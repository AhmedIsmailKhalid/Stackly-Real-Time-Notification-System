import { NotificationType, NotificationPriority } from '@prisma/client';
import { prisma } from '../config/db';
import { Errors } from '../middleware/errorHandler';
import {
  CreateNotificationPayload,
  NotificationFilters,
  PaginatedResponse,
  NotificationPayload,
} from '../types';

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

const toNotificationPayload = (n: any): NotificationPayload => ({
  id: n.id,
  userId: n.userId,
  type: n.type,
  priority: n.priority,
  title: n.title,
  message: n.message,
  read: n.read,
  readAt: n.readAt?.toISOString() ?? null,
  actorId: n.actorId ?? null,
  actorName: n.actorName ?? null,
  actorAvatarUrl: n.actorAvatarUrl ?? null,
  actionUrl: n.actionUrl ?? null,
  metadata: n.metadata ?? null,
  createdAt: n.createdAt.toISOString(),
  updatedAt: n.updatedAt.toISOString(),
});

// ─────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────

export const createNotification = async (
  payload: CreateNotificationPayload
): Promise<NotificationPayload> => {
  // Check user exists
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw Errors.NotFound('User');

  // Check user preference — skip creation if inApp is disabled for this type
  const preference = await prisma.notificationPreference.findUnique({
    where: { userId_type: { userId: payload.userId, type: payload.type } },
  });

  if (preference && !preference.inApp) {
    throw Errors.BadRequest(
      `User has disabled in-app notifications for type: ${payload.type}`
    );
  }

  const notification = await prisma.notification.create({
    data: {
      userId: payload.userId,
      type: payload.type,
      priority: payload.priority ?? NotificationPriority.MEDIUM,
      title: payload.title,
      message: payload.message,
      actorId: payload.actorId,
      actorName: payload.actorName,
      actorAvatarUrl: payload.actorAvatarUrl,
      actionUrl: payload.actionUrl,
      metadata: payload.metadata ? JSON.parse(JSON.stringify(payload.metadata)) : undefined,      
    },
  });

  return toNotificationPayload(notification);
};

// ─────────────────────────────────────────
// GET PAGINATED LIST
// ─────────────────────────────────────────

export const getNotifications = async (
  userId: string,
  filters: NotificationFilters
): Promise<PaginatedResponse<NotificationPayload>> => {
  const page = filters.page ?? 1;
  const limit = Math.min(filters.limit ?? 20, 100); // cap at 100
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(filters.read !== undefined && { read: filters.read }),
    ...(filters.type && { type: filters.type }),
  };

  const [notifications, total] = await prisma.$transaction([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    data: notifications.map(toNotificationPayload),
    total,
    page,
    limit,
    hasMore: skip + notifications.length < total,
  };
};

// ─────────────────────────────────────────
// GET UNREAD COUNT
// ─────────────────────────────────────────

export const getUnreadCount = async (userId: string): Promise<number> => {
  return prisma.notification.count({
    where: { userId, read: false },
  });
};

// ─────────────────────────────────────────
// MARK SINGLE AS READ
// ─────────────────────────────────────────

export const markAsRead = async (
  notificationId: string,
  userId: string
): Promise<NotificationPayload> => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) throw Errors.NotFound('Notification');
  if (notification.userId !== userId) throw Errors.Forbidden();
  if (notification.read) return toNotificationPayload(notification);

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true, readAt: new Date() },
  });

  return toNotificationPayload(updated);
};

// ─────────────────────────────────────────
// MARK ALL AS READ
// ─────────────────────────────────────────

export const markAllAsRead = async (userId: string): Promise<{ count: number }> => {
  const result = await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true, readAt: new Date() },
  });

  return { count: result.count };
};

// ─────────────────────────────────────────
// DELETE SINGLE
// ─────────────────────────────────────────

export const deleteNotification = async (
  notificationId: string,
  userId: string
): Promise<void> => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) throw Errors.NotFound('Notification');
  if (notification.userId !== userId) throw Errors.Forbidden();

  await prisma.notification.delete({ where: { id: notificationId } });
};

// ─────────────────────────────────────────
// DELETE ALL FOR USER
// ─────────────────────────────────────────

export const deleteAllNotifications = async (
  userId: string
): Promise<{ count: number }> => {
  const result = await prisma.notification.deleteMany({ where: { userId } });
  return { count: result.count };
};

// ─────────────────────────────────────────
// PREFERENCES
// ─────────────────────────────────────────

export const getPreferences = async (userId: string) => {
  // Return all types — upsert defaults for any missing
  const existingPrefs = await prisma.notificationPreference.findMany({
    where: { userId },
  });

  const existingTypes = new Set(existingPrefs.map((p) => p.type));
  const allTypes = Object.values(NotificationType);
  const missingTypes = allTypes.filter((t) => !existingTypes.has(t));

  if (missingTypes.length > 0) {
    await prisma.notificationPreference.createMany({
      data: missingTypes.map((type) => ({ userId, type })),
      skipDuplicates: true,
    });

    return prisma.notificationPreference.findMany({ where: { userId } });
  }

  return existingPrefs;
};

export const updatePreference = async (
  userId: string,
  type: NotificationType,
  data: { inApp?: boolean; email?: boolean }
) => {
  return prisma.notificationPreference.upsert({
    where: { userId_type: { userId, type } },
    update: data,
    create: { userId, type, ...data },
  });
};