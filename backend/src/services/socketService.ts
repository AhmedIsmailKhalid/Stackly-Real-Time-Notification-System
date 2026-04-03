import { Server } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents, NotificationPayload } from '../types';

let io: Server<ClientToServerEvents, ServerToClientEvents> | null = null;

// ─────────────────────────────────────────
// INIT — called once from socket/index.ts
// ─────────────────────────────────────────

export const initSocketService = (
  socketServer: Server<ClientToServerEvents, ServerToClientEvents>
): void => {
  io = socketServer;
};

// ─────────────────────────────────────────
// EMIT TO SPECIFIC USER
// Each user joins a room keyed by their userId
// ─────────────────────────────────────────

const emitToUser = (
  userId: string,
  event: keyof ServerToClientEvents,
  ...args: any[]
): void => {
  if (!io) {
    console.error('Socket.io not initialized — call initSocketService first');
    return;
  }
  io.to(`user:${userId}`).emit(event, ...args as any);
};

export const emitNewNotification = (
  userId: string,
  notification: NotificationPayload
): void => {
  emitToUser(userId, 'notification:new', notification);
};

export const emitNotificationUpdated = (
  userId: string,
  update: Partial<NotificationPayload> & { id: string }
): void => {
  emitToUser(userId, 'notification:updated', update);
};

export const emitNotificationDeleted = (
  userId: string,
  notificationId: string
): void => {
  emitToUser(userId, 'notification:deleted', notificationId);
};

export const emitAllNotificationsRead = (userId: string): void => {
  emitToUser(userId, 'notifications:all_read');
};