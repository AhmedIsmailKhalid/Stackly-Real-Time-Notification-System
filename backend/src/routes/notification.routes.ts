import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { AuthenticatedRequest } from '../types';
import { simulatorLimiter } from '../middleware/rateLimiter';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getPreferences,
  updatePreference,
  simulateNotification,
} from '../controllers/notificationController';

const router = Router();

// All notification routes require authentication
router.use(authenticate as any);

const handle =
  (fn: (req: AuthenticatedRequest, res: any, next: any) => Promise<void>) =>
  (req: any, res: any, next: any) =>
    fn(req as AuthenticatedRequest, res, next);

// ─────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────

// GET    /api/notifications
router.get('/', handle(getNotifications));

// GET    /api/notifications/unread-count
router.get('/unread-count', handle(getUnreadCount));

// PATCH  /api/notifications/read-all
router.patch('/read-all', handle(markAllAsRead));

// DELETE /api/notifications
router.delete('/', handle(deleteAllNotifications));

// PATCH  /api/notifications/:id/read
router.patch('/:id/read', handle(markAsRead));

// DELETE /api/notifications/:id
router.delete('/:id', handle(deleteNotification));

// ─────────────────────────────────────────
// PREFERENCES
// ─────────────────────────────────────────

// GET    /api/notifications/preferences
router.get('/preferences', handle(getPreferences));

// PATCH  /api/notifications/preferences/:type
router.patch('/preferences/:type', handle(updatePreference));

// ─────────────────────────────────────────
// SIMULATOR
// ─────────────────────────────────────────

// POST   /api/notifications/simulate
router.post('/simulate', simulatorLimiter, handle(simulateNotification));

export default router;