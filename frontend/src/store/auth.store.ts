import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginResult } from '../types/auth.types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: { userId: string; name: string; email: string; tenantId: string; roles: string[] } | null;
  isAuthenticated: boolean;
  setTokens: (result: LoginResult) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setTokens: (result: LoginResult) => {
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('refreshToken', result.refreshToken);
        set({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: {
            userId: result.userId,
            name: result.name,
            email: result.email,
            tenantId: result.tenantId,
            roles: result.roles,
          },
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
      },

      hasRole: (role: string) => get().user?.roles.includes(role) ?? false,
    }),
    { name: 'replycart-auth' }
  )
);
