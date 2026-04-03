import { useEffect, useCallback } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import * as notificationService from '@/services/notificationService';
import { NotificationFilters, NotificationType } from '@/types/notification.types';

// ─────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────

export const useNotifications = () => {
  const store = useNotificationStore();

  // ── Initial Load ──
  useEffect(() => {
    const load = async () => {
      await Promise.all([
        notificationService.fetchNotifications({ page: 1, limit: 20 }),
        notificationService.fetchUnreadCount(),
      ]);
    };
    load();
  }, []);

  // ── Load More (pagination) ──
  const loadMore = useCallback(async () => {
    if (!store.hasMore || store.isLoadingMore) return;

    await notificationService.fetchNotifications(
      { ...store.filters, page: store.page + 1, limit: 20 },
      true // append
    );
  }, [store.hasMore, store.isLoadingMore, store.filters, store.page]);

  // ── Apply Filters ──
  const applyFilters = useCallback(
    async (filters: NotificationFilters) => {
      store.setFilters(filters);
      store.resetPagination();
      await notificationService.fetchNotifications({ ...filters, page: 1, limit: 20 });
    },
    [store]
  );

  // ── Mark Single Read ──
  const markAsRead = useCallback(async (notificationId: string) => {
    const notification = store.notifications.find((n) => n.id === notificationId);
    if (!notification || notification.read) return;

    await notificationService.markAsRead(notificationId);
  }, [store.notifications]);

  // ── Mark All Read ──
  const markAllAsRead = useCallback(async () => {
    if (store.unreadCount === 0) return;
    await notificationService.markAllAsRead();
  }, [store.unreadCount]);

  // ── Delete Single ──
  const deleteNotification = useCallback(async (notificationId: string) => {
    await notificationService.deleteNotification(notificationId);
  }, []);

  // ── Delete All ──
  const deleteAll = useCallback(async () => {
    await notificationService.deleteAllNotifications();
  }, []);

  // ── Simulate (demo) ──
  const simulate = useCallback(async (type: NotificationType) => {
    await notificationService.simulateNotification(type);
  }, []);

  return {
    // State
    notifications:   store.notifications,
    unreadCount:     store.unreadCount,
    total:           store.total,
    hasMore:         store.hasMore,
    isLoading:       store.isLoading,
    isLoadingMore:   store.isLoadingMore,
    error:           store.error,
    filters:         store.filters,

    // Actions
    loadMore,
    applyFilters,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
    simulate,
  };
};