import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// ─────────────────────────────────────────
// CUSTOM ERROR CLASS
// ─────────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─────────────────────────────────────────
// COMMON ERROR FACTORIES
// ─────────────────────────────────────────

export const Errors = {
  BadRequest: (message: string) =>
    new AppError(message, 400, 'BAD_REQUEST'),

  Unauthorized: (message = 'Unauthorized') =>
    new AppError(message, 401, 'UNAUTHORIZED'),

  Forbidden: (message = 'Forbidden') =>
    new AppError(message, 403, 'FORBIDDEN'),

  NotFound: (resource: string) =>
    new AppError(`${resource} not found`, 404, 'NOT_FOUND'),

  Conflict: (message: string) =>
    new AppError(message, 409, 'CONFLICT'),

  Internal: (message = 'Internal server error') =>
    new AppError(message, 500, 'INTERNAL_ERROR', false),
} as const;

// ─────────────────────────────────────────
// 404 HANDLER — register before errorHandler
// ─────────────────────────────────────────

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(Errors.NotFound(`Route ${req.method} ${req.originalUrl}`));
};

// ─────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ─────────────────────────────────────────

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Operational errors — known, expected failures
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Prisma known errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as unknown as { code: string; meta?: { target?: string[] } };

    if (prismaErr.code === 'P2002') {
      const field = prismaErr.meta?.target?.[0] ?? 'field';
      res.status(409).json({
        success: false,
        error: `A record with this ${field} already exists`,
        code: 'DUPLICATE_ENTRY',
      });
      return;
    }

    if (prismaErr.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Record not found',
        code: 'NOT_FOUND',
      });
      return;
    }
  }

  // Unexpected errors — log and return generic message
  console.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    error: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code: 'INTERNAL_ERROR',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};