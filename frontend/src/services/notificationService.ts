import api from './api';
import { useNotificationStore } from '@/store/notificationStore';
import {
  Notification,
  NotificationFilters,
  NotificationPreference,
  NotificationType,
  PaginatedNotifications,
  UnreadCountResponse,
  MarkAllReadResponse,
  DeleteAllResponse,
} from '@/types/notification.types';

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

type ApiResponse<T> = { success: boolean; data: T };

const buildQueryString = (filters: NotificationFilters): string => {
  const params = new URLSearchParams();
  if (filters.read !== undefined) params.set('read', String(filters.read));
  if (filters.type) params.set('type', filters.type);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  return params.toString() ? `?${params.toString()}` : '';
};

// ─────────────────────────────────────────
// FETCH NOTIFICATIONS
// ─────────────────────────────────────────

export const fetchNotifications = async (
  filters: NotificationFilters = {},
  append = false
): Promise<PaginatedNotifications> => {
  const store = useNotificationStore.getState();

  append ? store.setLoadingMore(true) : store.setLoading(true);
  store.setError(null);

  try {
    const query = buildQueryString(filters);
    const response = await api.get<ApiResponse<PaginatedNotifications>>(
      `/api/notifications${query}`
    );

    const { data, total, hasMore } = response.data.data;

    append
      ? store.appendNotifications(data, total, hasMore)
      : store.setNotifications(data, total, hasMore);

    return response.data.data;
  } catch (err: unknown) {
    const message = extractErrorMessage(err);
    store.setError(message);
    throw err;
  } finally {
    append ? store.setLoadingMore(false) : store.setLoading(false);
  }
};

// ─────────────────────────────────────────
// FETCH UNREAD COUNT
// ─────────────────────────────────────────

export const fetchUnreadCount = async (): Promise<number> => {
  const response = await api.get<ApiResponse<UnreadCountResponse>>(
    '/api/notifications/unread-count'
  );

  const { count } = response.data.data;
  useNotificationStore.getState().setUnreadCount(count);

  return count;
};

// ─────────────────────────────────────────
// MARK SINGLE AS READ
// ─────────────────────────────────────────

export const markAsRead = async (notificationId: string): Promise<Notification> => {
  const store = useNotificationStore.getState();

  const response = await api.patch<ApiResponse<Notification>>(
    `/api/notifications/${notificationId}/read`
  );

  const updated = response.data.data;

  // Optimistic update already applied via socket in most cases,
  // but REST response is source of truth
  store.updateNotification(notificationId, { read: true, readAt: updated.readAt });
  store.decrementUnreadCount();

  return updated;
};

// ─────────────────────────────────────────
// MARK ALL AS READ
// ─────────────────────────────────────────

export const markAllAsRead = async (): Promise<MarkAllReadResponse> => {
  const response = await api.patch<ApiResponse<MarkAllReadResponse>>(
    '/api/notifications/read-all'
  );

  useNotificationStore.getState().markAllRead();

  return response.data.data;
};

// ─────────────────────────────────────────
// DELETE SINGLE
// ─────────────────────────────────────────

export const deleteNotification = async (notificationId: string): Promise<void> => {
  const store = useNotificationStore.getState();

  const notification = store.notifications.find((n) => n.id === notificationId);

  await api.delete(`/api/notifications/${notificationId}`);

  store.removeNotification(notificationId);

  // Decrement unread count only if deleted notification was unread
  if (notification && !notification.read) {
    store.decrementUnreadCount();
  }
};

// ─────────────────────────────────────────
// DELETE ALL
// ─────────────────────────────────────────

export const deleteAllNotifications = async (): Promise<DeleteAllResponse> => {
  const response = await api.delete<ApiResponse<DeleteAllResponse>>(
    '/api/notifications'
  );

  useNotificationStore.getState().clearNotifications();
  useNotificationStore.getState().setUnreadCount(0);

  return response.data.data;
};

// ─────────────────────────────────────────
// FETCH PREFERENCES
// ─────────────────────────────────────────

export const fetchPreferences = async (): Promise<NotificationPreference[]> => {
  const response = await api.get<ApiResponse<NotificationPreference[]>>(
    '/api/notifications/preferences'
  );

  const preferences = response.data.data;
  useNotificationStore.getState().setPreferences(preferences);

  return preferences;
};

// ─────────────────────────────────────────
// UPDATE PREFERENCE
// ─────────────────────────────────────────

export const updatePreference = async (
  type: NotificationType,
  data: { inApp?: boolean; email?: boolean }
): Promise<NotificationPreference> => {
  const response = await api.patch<ApiResponse<NotificationPreference>>(
    `/api/notifications/preferences/${type}`,
    data
  );

  const updated = response.data.data;
  useNotificationStore.getState().updatePreference(updated.id, updated);

  return updated;
};

// ─────────────────────────────────────────
// SIMULATE NOTIFICATION (demo trigger)
// ─────────────────────────────────────────

export const simulateNotification = async (
  type: NotificationType
): Promise<Notification> => {
  const response = await api.post<ApiResponse<Notification>>(
    '/api/notifications/simulate',
    { type }
  );

  return response.data.data;
};

// ─────────────────────────────────────────
// ERROR HELPER
// ─────────────────────────────────────────

const extractErrorMessage = (err: unknown): string => {
  if (
    err &&
    typeof err === 'object' &&
    'response' in err &&
    err.response &&
    typeof err.response === 'object' &&
    'data' in err.response &&
    err.response.data &&
    typeof err.response.data === 'object' &&
    'error' in err.response.data
  ) {
    return String((err.response.data as { error: string }).error);
  }
  return 'Something went wrong. Please try again.';
};