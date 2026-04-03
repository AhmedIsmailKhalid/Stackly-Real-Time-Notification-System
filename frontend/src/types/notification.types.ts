// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

export type NotificationType =
  | 'MENTION'
  | 'COMMENT'
  | 'TEAM_ACTIVITY'
  | 'SYSTEM_ALERT'
  | 'ASSIGNMENT';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH';

// ─────────────────────────────────────────
// NOTIFICATION
// ─────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  actorId: string | null;
  actorName: string | null;
  actorAvatarUrl: string | null;
  actionUrl: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────
// PREFERENCES
// ─────────────────────────────────────────

export interface NotificationPreference {
  id: string;
  userId: string;
  type: NotificationType;
  inApp: boolean;
  email: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────
// FILTERS
// ─────────────────────────────────────────

export interface NotificationFilters {
  read?: boolean;
  type?: NotificationType;
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────
// API SHAPES
// ─────────────────────────────────────────

export interface PaginatedNotifications {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface UnreadCountResponse {
  count: number;
}

export interface MarkAllReadResponse {
  count: number;
}

export interface DeleteAllResponse {
  count: number;
}

// ─────────────────────────────────────────
// NOTIFICATION TYPE METADATA
// UI display config per type
// ─────────────────────────────────────────

export interface NotificationTypeConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, NotificationTypeConfig> = {
  MENTION: {
    label: 'Mention',
    color: 'text-brand-600',
    bgColor: 'bg-brand-50',
    borderColor: 'border-brand-200',
  },
  COMMENT: {
    label: 'Comment',
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  TEAM_ACTIVITY: {
    label: 'Team',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  SYSTEM_ALERT: {
    label: 'System',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  ASSIGNMENT: {
    label: 'Assignment',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
  },
};

// ─────────────────────────────────────────
// SOCKET EVENTS
// Mirror of backend ServerToClientEvents
// ─────────────────────────────────────────

export interface SocketNotificationUpdate {
  id: string;
  read?: boolean;
  readAt?: string | null;
}