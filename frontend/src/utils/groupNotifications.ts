import { Notification } from '@/types/notification.types';
import { getGroupLabel } from './timeFormat';

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

export interface NotificationGroup {
  label: string;
  notifications: Notification[];
}

// ─────────────────────────────────────────
// GROUP BY DATE
// Groups notifications into labelled buckets:
// Today / Yesterday / This Week / This Month / <Month Year>
// Order of groups preserves newest-first
// ─────────────────────────────────────────

export const groupNotificationsByDate = (
  notifications: Notification[]
): NotificationGroup[] => {
  if (notifications.length === 0) return [];

  const groupMap = new Map<string, Notification[]>();

  for (const notification of notifications) {
    const label = getGroupLabel(notification.createdAt);

    if (!groupMap.has(label)) {
      groupMap.set(label, []);
    }
    groupMap.get(label)!.push(notification);
  }

  // Preserve insertion order — notifications are already sorted
  // newest-first from the API, so groups are also newest-first
  return Array.from(groupMap.entries()).map(([label, items]) => ({
    label,
    notifications: items,
  }));
};

// ─────────────────────────────────────────
// GROUP BY TYPE
// Groups notifications by NotificationType
// Used in the filtered views
// ─────────────────────────────────────────

export const groupNotificationsByType = (
  notifications: Notification[]
): NotificationGroup[] => {
  if (notifications.length === 0) return [];

  const groupMap = new Map<string, Notification[]>();

  for (const notification of notifications) {
    const label = notification.type;

    if (!groupMap.has(label)) {
      groupMap.set(label, []);
    }
    groupMap.get(label)!.push(notification);
  }

  return Array.from(groupMap.entries()).map(([label, items]) => ({
    label,
    notifications: items,
  }));
};

// ─────────────────────────────────────────
// FILTER UNREAD
// ─────────────────────────────────────────

export const filterUnread = (notifications: Notification[]): Notification[] =>
  notifications.filter((n) => !n.read);

// ─────────────────────────────────────────
// FILTER BY TYPE
// ─────────────────────────────────────────

export const filterByType = (
  notifications: Notification[],
  type: Notification['type']
): Notification[] => notifications.filter((n) => n.type === type);

// ─────────────────────────────────────────
// COUNT UNREAD PER TYPE
// Used for preference panel badge counts
// ─────────────────────────────────────────

export const countUnreadByType = (
  notifications: Notification[]
): Record<string, number> => {
  return notifications.reduce<Record<string, number>>((acc, n) => {
    if (!n.read) {
      acc[n.type] = (acc[n.type] ?? 0) + 1;
    }
    return acc;
  }, {});
};