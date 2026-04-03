import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import * as notificationService from '@/services/notificationService';
import { Notification, SocketNotificationUpdate } from '@/types/notification.types';

type SocketInstance = Socket;

let socketInstance: SocketInstance | null = null;

// ─────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────

export const useSocket = () => {
  const socketRef = useRef<SocketInstance | null>(null);
  const { accessToken, isAuthenticated } = useAuthStore();
  const store = useNotificationStore();

  // ── Connect ──
  const connect = useCallback(() => {
    if (socketInstance?.connected) return;

    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    socketInstance = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socketRef.current = socketInstance;

    // ── Event Handlers ──

    socketInstance.on('connect', () => {
      console.log('[socket] connected:', socketInstance?.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[socket] disconnected:', reason);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('[socket] connection error:', err.message);
    });

    // New notification received
    socketInstance.on('notification:new', (notification: Notification) => {
      store.addNotification(notification);
      // Fetch accurate count from DB instead of incrementing in memory
      // prevents drift from rapid or duplicate socket events
      notificationService.fetchUnreadCount();
    });

    // Single notification updated (read state)
    socketInstance.on('notification:updated', (update: SocketNotificationUpdate) => {
      store.updateNotification(update.id, {
        ...(update.read !== undefined && { read: update.read }),
        ...(update.readAt !== undefined && { readAt: update.readAt }),
      });
    });

    // Single notification deleted
    socketInstance.on('notification:deleted', (notificationId: string) => {
      const notification = useNotificationStore
        .getState()
        .notifications.find((n) => n.id === notificationId);

      store.removeNotification(notificationId);

      if (notification && !notification.read) {
        store.decrementUnreadCount();
      }
    });

    // All notifications marked read
    socketInstance.on('notifications:all_read', () => {
      store.markAllRead();
    });
  }, [store]);

  // ── Disconnect ──
  const disconnect = useCallback(() => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
      socketRef.current = null;
    }
  }, []);

  // ── Reconnect with new token ──
  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [connect, disconnect]);

  // ── Lifecycle ──
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      // Do not disconnect on unmount — socket is shared across the app
      // Disconnect only happens on logout (isAuthenticated → false)
    };
  }, [isAuthenticated, accessToken, connect, disconnect]);

  // ── Reconnect when access token rotates ──
  useEffect(() => {
    if (socketInstance?.connected && accessToken) {
      // Update auth token on socket without full reconnect
      socketInstance.auth = { token: accessToken };
    }
  }, [accessToken]);

  return {
    socket: socketRef.current,
    isConnected: socketInstance?.connected ?? false,
    connect,
    disconnect,
    reconnect,
  };
};