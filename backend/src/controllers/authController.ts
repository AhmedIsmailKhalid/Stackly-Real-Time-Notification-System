import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../config/db';
import { env } from '../config/env';
import { Errors } from '../middleware/errorHandler';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../middleware/authenticate';
import { AuthenticatedRequest } from '../types';

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

const SALT_ROUNDS = 12;
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

const generateRawRefreshToken = (): string =>
  crypto.randomBytes(40).toString('hex');

const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
    encode: (val) => val, // Prevent URL encoding of token value
  });
};

const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

const sanitizeUser = (user: {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: Date;
}) => ({
  id: user.id,
  email: user.email,
  username: user.username,
  displayName: user.displayName,
  avatarUrl: user.avatarUrl,
  createdAt: user.createdAt.toISOString(),
});

// ─────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, username, displayName, password } = req.body;

    if (!email || !username || !displayName || !password) {
      throw Errors.BadRequest('email, username, displayName and password are required');
    }

    if (password.length < 8) {
      throw Errors.BadRequest('Password must be at least 8 characters');
    }

    // Check uniqueness
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      throw Errors.Conflict(
        existing.email === email
          ? 'Email already in use'
          : 'Username already taken'
      );
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { email, username, displayName, passwordHash },
    });

    // Issue tokens
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    const rawRefreshToken = generateRawRefreshToken();
    const tokenHash = hashToken(rawRefreshToken);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000),
        userAgent: req.headers['user-agent'] ?? null,
        ipAddress: req.ip ?? null,
      },
    });

    setRefreshTokenCookie(res, rawRefreshToken);

    res.status(201).json({
      success: true,
      data: {
        user: sanitizeUser(user),
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw Errors.BadRequest('Email and password are required');
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Constant-time comparison to prevent user enumeration
    const passwordMatch = user
      ? await bcrypt.compare(password, user.passwordHash)
      : await bcrypt.compare(password, '$2a$12$placeholderHashForTimingAttackPrevention');

    if (!user || !passwordMatch) {
      throw Errors.Unauthorized('Invalid email or password');
    }

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    const rawRefreshToken = generateRawRefreshToken();
    const tokenHash = hashToken(rawRefreshToken);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000),
        userAgent: req.headers['user-agent'] ?? null,
        ipAddress: req.ip ?? null,
      },
    });

    setRefreshTokenCookie(res, rawRefreshToken);

    res.status(200).json({
      success: true,
      data: {
        user: sanitizeUser(user),
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// REFRESH TOKEN
// ─────────────────────────────────────────

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawToken = req.cookies?.refreshToken as string | undefined;

    if (!rawToken) {
      throw Errors.Unauthorized('No refresh token provided');
    }

    const tokenHash = hashToken(rawToken);



    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      throw Errors.Unauthorized('Invalid refresh token');
    }

    if (storedToken.revokedAt) {
      // Token reuse detected — revoke all tokens for this user
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { revokedAt: new Date() },
      });
      throw Errors.Unauthorized('Refresh token reuse detected — please log in again');
    }

    if (storedToken.expiresAt < new Date()) {
      throw Errors.Unauthorized('Refresh token expired');
    }

    // userId verified via storedToken directly — no JWT payload needed


    // Rotate — revoke old, issue new
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const newAccessToken = signAccessToken({
      sub: storedToken.user.id,
      email: storedToken.user.email,
      username: storedToken.user.username,
    });

    const newRawRefreshToken = generateRawRefreshToken();
    const newTokenHash = hashToken(newRawRefreshToken);

    await prisma.refreshToken.create({
      data: {
        userId: storedToken.user.id,
        tokenHash: newTokenHash,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000),
        userAgent: req.headers['user-agent'] ?? null,
        ipAddress: req.ip ?? null,
      },
    });

    setRefreshTokenCookie(res, newRawRefreshToken);

    res.status(200).json({
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawToken = req.cookies?.refreshToken as string | undefined;

    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { revokedAt: new Date() },
      });
    }

    clearRefreshTokenCookie(res);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET CURRENT USER
// ─────────────────────────────────────────

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
    });

    if (!user) throw Errors.NotFound('User');

    res.status(200).json({
      success: true,
      data: { user: sanitizeUser(user) },
    });
  } catch (err) {
    next(err);
  }
};