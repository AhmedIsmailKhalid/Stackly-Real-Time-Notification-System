import api from './api';
import { useAuthStore } from '@/store/authStore';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '@/types/user.types';

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<{ success: boolean; data: AuthResponse }>(
    '/api/auth/login',
    credentials
  );

  const { user, accessToken } = response.data.data;
  useAuthStore.getState().setAuth(user, accessToken);

  return { user, accessToken };
};

// ─────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await api.post<{ success: boolean; data: AuthResponse }>(
    '/api/auth/register',
    data
  );

  const { user, accessToken } = response.data.data;
  useAuthStore.getState().setAuth(user, accessToken);

  return { user, accessToken };
};

// ─────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────

export const logout = async (): Promise<void> => {
  try {
    await api.post('/api/auth/logout');
  } finally {
    // Always clear local auth state even if request fails
    useAuthStore.getState().clearAuth();
  }
};

// ─────────────────────────────────────────
// REFRESH
// Attempt to get a new access token using
// the httpOnly refresh token cookie
// ─────────────────────────────────────────

export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await api.post<{ success: boolean; data: { accessToken: string } }>(
      '/api/auth/refresh'
    );

    const { accessToken } = response.data.data;
    useAuthStore.getState().setAccessToken(accessToken);

    return accessToken;
  } catch {
    useAuthStore.getState().clearAuth();
    return null;
  }
};

// ─────────────────────────────────────────
// GET CURRENT USER
// ─────────────────────────────────────────

export const getMe = async (): Promise<void> => {
  const response = await api.get<{ success: boolean; data: { user: AuthResponse['user'] } }>(
    '/api/auth/me'
  );

  const { user } = response.data.data;
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    useAuthStore.getState().setAuth(user, accessToken);
  }
};

// ─────────────────────────────────────────
// INITIALIZE AUTH
// Called once on app mount — attempts to
// restore session via refresh token cookie
// ─────────────────────────────────────────

export const initializeAuth = async (): Promise<void> => {
  const { setInitializing, clearAuth } = useAuthStore.getState();

  try {
    const accessToken = await refreshAccessToken();
    if (!accessToken) {
      clearAuth();
      return;
    }
    await getMe();
  } catch {
    clearAuth();
  } finally {
    setInitializing(false);
  }
};