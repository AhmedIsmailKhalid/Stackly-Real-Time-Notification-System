import { Socket } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents, JwtAccessPayload } from '../../types';
import * as notificationService from '../../services/notificationService';
import {
  emitNotificationUpdated,
  emitAllNotificationsRead,
} from '../../services/socketService';

type AuthenticatedSocket = Socket<ClientToServerEvents, ServerToClientEvents> & {
  user: JwtAccessPayload;
};

export const registerNotificationHandlers = (socket: AuthenticatedSocket): void => {
  // ── Mark single notification as read ──
  socket.on('notification:mark_read', async (notificationId: string) => {
    try {
      const updated = await notificationService.markAsRead(
        notificationId,
        socket.user.sub
      );

      emitNotificationUpdated(socket.user.sub, {
        id: updated.id,
        read: updated.read,
        readAt: updated.readAt,
      });
    } catch (err) {
      console.error(`[socket] notification:mark_read error — ${(err as Error).message}`);
    }
  });

  // ── Mark all notifications as read ──
  socket.on('notification:mark_all_read', async () => {
    try {
      await notificationService.markAllAsRead(socket.user.sub);
      emitAllNotificationsRead(socket.user.sub);
    } catch (err) {
      console.error(`[socket] notification:mark_all_read error — ${(err as Error).message}`);
    }
  });
};