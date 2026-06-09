import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginResult } from '../types/auth.types';
import { authApi } from '../api/auth.api';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: { userId: string; name: string; email: string; tenantId: string; roles: string[] } | null;
  isAuthenticated: boolean;
  /** True once Zustand has finished rehydrating from localStorage. Guards against
   *  redirect loops caused by reading isAuthenticated before hydration completes. */
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setTokens: (result: LoginResult) => void;
  updateUser: (partial: Partial<{ name: string; phone: string; avatarUrl: string }>) => void;
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
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

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

      updateUser: (partial) => {
        const current = get().user;
        if (current) set({ user: { ...current, ...partial } });
      },

      logout: () => {
        const rt = get().refreshToken;
        if (rt) authApi.logout(rt).catch(() => {}); // fire-and-forget
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('silarai-auth'); // clear persisted snapshot
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
      },

      hasRole: (role: string) => get().user?.roles.includes(role) ?? false,
    }),
    {
      name: 'silarai-auth',
      // Called when rehydration finishes — flip the flag so guards can render
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
