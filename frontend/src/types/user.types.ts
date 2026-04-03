// ─────────────────────────────────────────
// USER
// ─────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
}

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}