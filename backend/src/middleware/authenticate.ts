import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Errors } from './errorHandler';
import { AuthenticatedRequest, JwtAccessPayload } from '../types';

// ─────────────────────────────────────────
// JWT HELPERS
// ─────────────────────────────────────────

export const signAccessToken = (payload: JwtAccessPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const signRefreshToken = (payload: { sub: string; tokenId: string }): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): JwtAccessPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
};

export const verifyRefreshToken = (token: string): { sub: string; tokenId: string } => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string; tokenId: string };
};

// ─────────────────────────────────────────
// EXTRACT BEARER TOKEN
// ─────────────────────────────────────────

const extractBearerToken = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return token?.trim() || null;
};

// ─────────────────────────────────────────
// AUTHENTICATE MIDDLEWARE
// ─────────────────────────────────────────

export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      throw Errors.Unauthorized('No token provided');
    }

    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next(Errors.Unauthorized('Token expired'));
      return;
    }
    if (err instanceof jwt.JsonWebTokenError) {
      next(Errors.Unauthorized('Invalid token'));
      return;
    }
    next(err);
  }
};

// ─────────────────────────────────────────
// OPTIONAL AUTHENTICATE — attaches user if
// token present but does not block if absent
// ─────────────────────────────────────────

export const optionalAuthenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (token) {
      const payload = verifyAccessToken(token);
      req.user = payload;
    }
    next();
  } catch {
    next();
  }
};