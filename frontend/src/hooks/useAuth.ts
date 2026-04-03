import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import * as authService from '@/services/authService';
import { LoginRequest, RegisterRequest } from '@/types/user.types';

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, accessToken, isAuthenticated, isInitializing } = useAuthStore();

  // ── Login ──
  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      await authService.login(credentials);
      navigate('/dashboard');
    },
    [navigate]
  );

  // ── Register ──
  const register = useCallback(
    async (data: RegisterRequest): Promise<void> => {
      await authService.register(data);
      navigate('/dashboard');
    },
    [navigate]
  );

  // ── Logout ──
  const logout = useCallback(async (): Promise<void> => {
    await authService.logout();
    navigate('/login');
  }, [navigate]);

  return {
    user,
    accessToken,
    isAuthenticated,
    isInitializing,
    login,
    register,
    logout,
  };
};