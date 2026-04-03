import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { ApiErrorResponse } from '../types';

// ─────────────────────────────────────────
// SHARED HANDLER
// ─────────────────────────────────────────

const rateLimitResponse: ApiErrorResponse = {
  success: false,
  error: 'Too many requests, please try again later',
  code: 'RATE_LIMIT_EXCEEDED',
};

// ─────────────────────────────────────────
// GENERAL API LIMITER
// Applied globally to all routes
// ─────────────────────────────────────────

export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse,
  skip: () => env.NODE_ENV === 'test',
});

// ─────────────────────────────────────────
// AUTH LIMITER
// Stricter limits for login/register/refresh
// ─────────────────────────────────────────

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ...rateLimitResponse,
    error: 'Too many authentication attempts, please try again in 15 minutes',
  },
  skip: () => env.NODE_ENV === 'test',
});

export const simulatorLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,             // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse,
  skip: () => env.NODE_ENV === 'test',
});