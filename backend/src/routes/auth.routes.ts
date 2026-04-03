import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/authenticate';
import { AuthenticatedRequest } from '../types';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
} from '../controllers/authController';

const router = Router();

// ─────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────

// POST /api/auth/register
router.post('/register', authLimiter, register);

// POST /api/auth/login
router.post('/login', authLimiter, login);

// POST /api/auth/refresh
router.post('/refresh', authLimiter, refreshToken);

// POST /api/auth/logout
router.post('/logout', logout);

// ─────────────────────────────────────────
// PROTECTED ROUTES
// ─────────────────────────────────────────

// GET /api/auth/me
router.get('/me', authenticate as any, (req, res, next) =>
  getMe(req as AuthenticatedRequest, res, next)
);

export default router;