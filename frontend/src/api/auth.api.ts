import apiClient from './client';
import type { LoginResult, RegisterRequest } from '../types/auth.types';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResult>('/auth/login', { email, password }).then((r) => r.data),

  register: (data: RegisterRequest) =>
    apiClient.post('/auth/register', data).then((r) => r.data),

  refresh: (refreshToken: string) =>
    apiClient.post<LoginResult>('/auth/refresh', { refreshToken }).then((r) => r.data),

  me: () => apiClient.get('/auth/me').then((r) => r.data),

  logout: () => apiClient.post('/auth/logout'),
};
