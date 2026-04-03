import { create } from 'zustand';
import { Notification, NotificationPreference, NotificationFilters } from '@/types/notification.types';

// ─────────────────────────────────────────
// STATE
// ─────────────────────────────────────────

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreference[];
  total: number;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  filters: NotificationFilters;

  // Actions — data
  setNotifications: (notifications: Notification[], total: number, hasMore: boolean) => void;
  appendNotifications: (notifications: Notification[], total: number, hasMore: boolean) => void;
  addNotification: (notification: Notification) => void;
  updateNotification: (id: string, update: Partial<Notification>) => void;
  removeNotification: (id: string) => void;
  markAllRead: () => void;
  clearNotifications: () => void;

  // Actions — unread count
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;

  // Actions — preferences
  setPreferences: (preferences: NotificationPreference[]) => void;
  updatePreference: (id: string, update: Partial<NotificationPreference>) => void;

  // Actions — UI state
  setLoading: (value: boolean) => void;
  setLoadingMore: (value: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<NotificationFilters>) => void;
  setPage: (page: number) => void;
  resetPagination: () => void;
}

// ─────────────────────────────────────────
// STORE
// ─────────────────────────────────────────

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  unreadCount: 0,
  preferences: [],
  total: 0,
  page: 1,
  hasMore: false,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  filters: {},

  // ── Data Actions ──

  setNotifications: (notifications, total, hasMore) =>
    set({ notifications, total, hasMore, page: 1 }),

  appendNotifications: (notifications, total, hasMore) =>
    set((state) => ({
      notifications: [...state.notifications, ...notifications],
      total,
      hasMore,
      page: state.page + 1,
    })),

  addNotification: (notification) =>
    set((state) => ({
      // Prepend — newest first, avoid duplicates
      notifications: state.notifications.some((n) => n.id === notification.id)
        ? state.notifications
        : [notification, ...state.notifications],
      total: state.total + 1,
    })),

  updateNotification: (id, update) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, ...update } : n
      ),
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      total: Math.max(0, state.total - 1),
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        read: true,
        readAt: n.readAt ?? new Date().toISOString(),
      })),
      unreadCount: 0,
    })),

  clearNotifications: () =>
    set({ notifications: [], total: 0, page: 1, hasMore: false }),

  // ── Unread Count Actions ──

  setUnreadCount: (count) =>
    set({ unreadCount: Math.max(0, count) }),

  incrementUnreadCount: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  decrementUnreadCount: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  // ── Preference Actions ──

  setPreferences: (preferences) =>
    set({ preferences }),

  updatePreference: (id, update) =>
    set((state) => ({
      preferences: state.preferences.map((p) =>
        p.id === id ? { ...p, ...update } : p
      ),
    })),

  // ── UI State Actions ──

  setLoading: (value) =>
    set({ isLoading: value }),

  setLoadingMore: (value) =>
    set({ isLoadingMore: value }),

  setError: (error) =>
    set({ error }),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  setPage: (page) =>
    set({ page }),

  resetPagination: () =>
    set({ page: 1, hasMore: false, notifications: [], total: 0 }),
}));