import { Request } from 'express';
import { NotificationType, NotificationPriority } from '@prisma/client';

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────

export interface JwtAccessPayload {
  sub: string;       // userId
  email: string;
  username: string;
}

export interface JwtRefreshPayload {
  sub: string;       // userId
  tokenId: string;   // RefreshToken.id — used to verify token hasn't been revoked
}

export interface AuthenticatedRequest extends Request {
  user: JwtAccessPayload;
}

// ─────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────

export interface CreateNotificationPayload {
  userId: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  actorId?: string;
  actorName?: string;
  actorAvatarUrl?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationFilters {
  read?: boolean;
  type?: NotificationType;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ─────────────────────────────────────────
// SOCKET
// ─────────────────────────────────────────

export interface SocketAuthPayload {
  token: string;
}

export interface ServerToClientEvents {
  'notification:new': (notification: NotificationPayload) => void;
  'notification:updated': (notification: Partial<NotificationPayload> & { id: string }) => void;
  'notification:deleted': (notificationId: string) => void;
  'notifications:all_read': () => void;
}

export interface ClientToServerEvents {
  'notification:mark_read': (notificationId: string) => void;
  'notification:mark_all_read': () => void;
}

export interface NotificationPayload {
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
// API RESPONSES
// ─────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;