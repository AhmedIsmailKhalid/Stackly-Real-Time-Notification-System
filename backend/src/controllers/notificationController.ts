import { Response, NextFunction } from 'express';
import { NotificationType } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { Errors } from '../middleware/errorHandler';
import * as notificationService from '../services/notificationService';
import * as socketService from '../services/socketService';

// ─────────────────────────────────────────
// GET NOTIFICATIONS
// GET /api/notifications
// ─────────────────────────────────────────

export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { read, type, page, limit } = req.query;

    const filters = {
      ...(read !== undefined && { read: read === 'true' }),
      ...(type && { type: type as NotificationType }),
      ...(page && { page: parseInt(page as string, 10) }),
      ...(limit && { limit: parseInt(limit as string, 10) }),
    };

    // Validate type if provided
    if (type && !Object.values(NotificationType).includes(type as NotificationType)) {
      throw Errors.BadRequest(`Invalid notification type: ${type}`);
    }

    const result = await notificationService.getNotifications(req.user.sub, filters);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET UNREAD COUNT
// GET /api/notifications/unread-count
// ─────────────────────────────────────────

export const getUnreadCount = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const count = await notificationService.getUnreadCount(req.user.sub);

    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// MARK SINGLE AS READ
// PATCH /api/notifications/:id/read
// ─────────────────────────────────────────

export const markAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) throw Errors.BadRequest('Notification ID is required');

    const updated = await notificationService.markAsRead(id, req.user.sub);

    // Emit real-time update to user's socket room
    socketService.emitNotificationUpdated(req.user.sub, {
      id: updated.id,
      read: updated.read,
      readAt: updated.readAt,
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// MARK ALL AS READ
// PATCH /api/notifications/read-all
// ─────────────────────────────────────────

export const markAllAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await notificationService.markAllAsRead(req.user.sub);

    // Emit real-time update to user's socket room
    socketService.emitAllNotificationsRead(req.user.sub);

    res.status(200).json({
      success: true,
      data: result,
      message: `${result.count} notifications marked as read`,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// DELETE SINGLE
// DELETE /api/notifications/:id
// ─────────────────────────────────────────

export const deleteNotification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) throw Errors.BadRequest('Notification ID is required');

    await notificationService.deleteNotification(id, req.user.sub);

    // Emit real-time deletion to user's socket room
    socketService.emitNotificationDeleted(req.user.sub, id);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Notification deleted',
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// DELETE ALL
// DELETE /api/notifications
// ─────────────────────────────────────────

export const deleteAllNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await notificationService.deleteAllNotifications(req.user.sub);

    res.status(200).json({
      success: true,
      data: result,
      message: `${result.count} notifications deleted`,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// GET PREFERENCES
// GET /api/notifications/preferences
// ─────────────────────────────────────────

export const getPreferences = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const preferences = await notificationService.getPreferences(req.user.sub);

    res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// UPDATE PREFERENCE
// PATCH /api/notifications/preferences/:type
// ─────────────────────────────────────────

export const updatePreference = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type } = req.params;
    const { inApp, email } = req.body;

    if (!type || !Object.values(NotificationType).includes(type as NotificationType)) {
      throw Errors.BadRequest(`Invalid notification type: ${type}`);
    }

    if (inApp === undefined && email === undefined) {
      throw Errors.BadRequest('At least one of inApp or email must be provided');
    }

    if (inApp !== undefined && typeof inApp !== 'boolean') {
      throw Errors.BadRequest('inApp must be a boolean');
    }

    if (email !== undefined && typeof email !== 'boolean') {
      throw Errors.BadRequest('email must be a boolean');
    }

    const updated = await notificationService.updatePreference(
      req.user.sub,
      type as NotificationType,
      { inApp, email }
    );

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// TRIGGER DEMO NOTIFICATION (simulator)
// POST /api/notifications/simulate
// ─────────────────────────────────────────

export const simulateNotification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
     // Prevent DB hammering from rapid simulation
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    const { type } = req.body;

    if (!type || !Object.values(NotificationType).includes(type as NotificationType)) {
      throw Errors.BadRequest(`Invalid notification type: ${type}`);
    }

    const templatePools: Record<NotificationType, Array<{
      title: string;
      message: string;
      actorName: string;
      actorAvatarUrl: string;
      actionUrl: string;
    }>> = {
      MENTION: [
        {
          title: 'You were mentioned',
          message: 'Sarah Chen mentioned you in "Q4 Product Roadmap"',
          actorName: 'Sarah Chen',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
          actionUrl: '/docs/q4-roadmap',
        },
        {
          title: 'You were mentioned',
          message: 'Alex Rivera mentioned you in "Sprint Retrospective Notes"',
          actorName: 'Alex Rivera',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
          actionUrl: '/docs/sprint-retro',
        },
        {
          title: 'You were mentioned',
          message: 'Marcus Johnson mentioned you in "Backend Architecture Review"',
          actorName: 'Marcus Johnson',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
          actionUrl: '/docs/arch-review',
        },
        {
          title: 'You were mentioned',
          message: 'Jordan Lee mentioned you in "Q1 OKR Planning"',
          actorName: 'Jordan Lee',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
          actionUrl: '/docs/okr-planning',
        },
        {
          title: 'You were mentioned',
          message: 'Priya Nair mentioned you in "Design System Guidelines"',
          actorName: 'Priya Nair',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
          actionUrl: '/docs/design-system',
        },
      ],
      COMMENT: [
        {
          title: 'New comment on your post',
          message: 'Alex Rivera commented on "API Design Patterns"',
          actorName: 'Alex Rivera',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
          actionUrl: '/posts/api-design',
        },
        {
          title: 'New comment on your task',
          message: 'Sarah Chen left feedback on "Implement WebSocket reconnection"',
          actorName: 'Sarah Chen',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
          actionUrl: '/tasks/ws-reconnection',
        },
        {
          title: 'New comment on your document',
          message: 'Marcus Johnson replied to your comment in "Release Notes v3.0"',
          actorName: 'Marcus Johnson',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
          actionUrl: '/docs/release-notes',
        },
        {
          title: 'New comment on your PR',
          message: 'Priya Nair reviewed your pull request "feat: add notification grouping"',
          actorName: 'Priya Nair',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
          actionUrl: '/prs/notification-grouping',
        },
        {
          title: 'New comment on your task',
          message: 'Jordan Lee commented on "Database schema migration plan"',
          actorName: 'Jordan Lee',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
          actionUrl: '/tasks/db-migration',
        },
      ],
      TEAM_ACTIVITY: [
        {
          title: 'New team member',
          message: 'Jordan Lee joined the Engineering workspace',
          actorName: 'Jordan Lee',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
          actionUrl: '/team',
        },
        {
          title: 'Role updated',
          message: 'Sarah Chen was promoted to Engineering Lead',
          actorName: 'Sarah Chen',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
          actionUrl: '/team',
        },
        {
          title: 'New team member',
          message: 'Priya Nair joined the Design workspace',
          actorName: 'Priya Nair',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
          actionUrl: '/team',
        },
        {
          title: 'Team member left',
          message: 'Chris Walton left the Product workspace',
          actorName: 'Chris Walton',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chris',
          actionUrl: '/team',
        },
        {
          title: 'New team member',
          message: 'Marcus Johnson joined the Backend Engineering workspace',
          actorName: 'Marcus Johnson',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
          actionUrl: '/team',
        },
        {
          title: 'Role updated',
          message: 'Alex Rivera was added as an admin to the Engineering workspace',
          actorName: 'Alex Rivera',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
          actionUrl: '/team',
        },
      ],
      SYSTEM_ALERT: [
        {
          title: 'Deployment successful',
          message: 'stackly-frontend v2.4.1 deployed to production',
          actorName: 'Stackly CI',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=system',
          actionUrl: '/deployments',
        },
        {
          title: 'Build failed',
          message: 'stackly-backend v2.4.2 build failed on branch feat/socket-auth',
          actorName: 'Stackly CI',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=system',
          actionUrl: '/deployments',
        },
        {
          title: 'Scheduled maintenance',
          message: 'Stackly will undergo maintenance on Sunday 2am–4am UTC',
          actorName: 'Stackly System',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=system2',
          actionUrl: '/status',
        },
        {
          title: 'Deployment successful',
          message: 'stackly-backend v2.5.0 deployed to production successfully',
          actorName: 'Stackly CI',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=system',
          actionUrl: '/deployments',
        },
        {
          title: 'High memory usage detected',
          message: 'Production server memory usage exceeded 85% threshold',
          actorName: 'Stackly Monitor',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=monitor',
          actionUrl: '/monitoring',
        },
        {
          title: 'SSL certificate expiring',
          message: 'SSL certificate for stackly.dev expires in 7 days — renewal required',
          actorName: 'Stackly System',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=system2',
          actionUrl: '/settings/ssl',
        },
      ],
      ASSIGNMENT: [
        {
          title: 'Task assigned to you',
          message: 'Marcus Johnson assigned "Fix notification race condition" to you',
          actorName: 'Marcus Johnson',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
          actionUrl: '/tasks',
        },
        {
          title: 'Task assigned to you',
          message: 'Sarah Chen assigned "Implement dark mode toggle" to you',
          actorName: 'Sarah Chen',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
          actionUrl: '/tasks',
        },
        {
          title: 'PR review requested',
          message: 'Alex Rivera requested your review on "refactor: notification store cleanup"',
          actorName: 'Alex Rivera',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
          actionUrl: '/prs',
        },
        {
          title: 'Task assigned to you',
          message: 'Jordan Lee assigned "Write API documentation for v3 endpoints" to you',
          actorName: 'Jordan Lee',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
          actionUrl: '/tasks',
        },
        {
          title: 'Bug assigned to you',
          message: 'Priya Nair assigned "Login page flicker on Safari" to you',
          actorName: 'Priya Nair',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
          actionUrl: '/bugs',
        },
        {
          title: 'PR review requested',
          message: 'Marcus Johnson requested your review on "feat: add CSV export to dashboard"',
          actorName: 'Marcus Johnson',
          actorAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
          actionUrl: '/prs',
        },
      ],
    };

    const pool = templatePools[type as NotificationType];
    const template = pool[Math.floor(Math.random() * pool.length)];

    const notification = await notificationService.createNotification({
      userId: req.user.sub,
      type: type as NotificationType,
      title: template.title,
      message: template.message,
      actorName: template.actorName,
      actorAvatarUrl: template.actorAvatarUrl,
      actionUrl: template.actionUrl,
    });

    // Emit real-time to the user's socket room
    socketService.emitNewNotification(req.user.sub, notification);

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Demo notification triggered',
    });
  } catch (err) {
    next(err);
  }
};