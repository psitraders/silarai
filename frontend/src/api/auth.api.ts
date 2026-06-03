import apiClient from './client';
import type { LoginResult, RegisterRequest } from '../types/auth.types';
import { getDeviceInfo } from '../utils/deviceInfo';

export interface SessionDto {
  id: string;
  deviceInfo: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface SetupTotpResult {
  secret: string;
  otpAuthUri: string;
}

export const authApi = {
  login: (email: string, password: string, totpCode?: string) =>
    apiClient.post<LoginResult & { requiresTwoFactor?: boolean }>(
      '/auth/login',
      { email, password, totpCode, deviceInfo: getDeviceInfo() }
    ).then((r) => r.data),

  register: (data: RegisterRequest) =>
    apiClient.post('/auth/register', data).then((r) => r.data),

  refresh: (refreshToken: string) =>
    apiClient.post<LoginResult>('/auth/refresh', { refreshToken }).then((r) => r.data),

  me: () => apiClient.get('/auth/me').then((r) => r.data),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }),

  // Email verification
  sendVerification: () =>
    apiClient.post('/auth/send-verification').then((r) => r.data),

  verifyEmail: (token: string) =>
    apiClient.post('/auth/verify-email', { token }).then((r) => r.data),

  // Password reset (OTP flow)
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }).then((r) => r.data),

  verifyResetOtp: (email: string, otp: string) =>
    apiClient.post<{ token: string }>('/auth/verify-reset-otp', { email, otp }).then((r) => r.data),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post('/auth/reset-password', { token, newPassword }).then((r) => r.data),

  // Profile & security
  updateProfile: (data: { name: string; phone?: string; avatarUrl?: string }) =>
    apiClient.put('/auth/profile', data).then((r) => r.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.put('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data),

  // Sessions
  getSessions: () =>
    apiClient.get<SessionDto[]>('/auth/sessions').then((r) => r.data),

  revokeSession: (sessionId: string) =>
    apiClient.delete(`/auth/sessions/${sessionId}`).then((r) => r.data),

  // TOTP 2FA
  getTotpStatus: () =>
    apiClient.get<{ enabled: boolean }>('/auth/totp/status').then((r) => r.data),

  setupTotp: () =>
    apiClient.post<SetupTotpResult>('/auth/totp/setup').then((r) => r.data),

  verifyTotp: (code: string) =>
    apiClient.post('/auth/totp/verify', { code }).then((r) => r.data),

  disableTotp: (password: string) =>
    apiClient.post('/auth/totp/disable', { password }).then((r) => r.data),

  // Mobile OTP — login (phone must exist in DB)
  sendOtp: (phone: string) =>
    apiClient.post('/auth/otp/send', { phone }).then((r) => r.data),

  verifyOtp: (phone: string, otp: string) =>
    apiClient.post<LoginResult>('/auth/otp/verify', {
      phone, otp, deviceInfo: getDeviceInfo(),
    }).then((r) => r.data),

  // Email OTP — registration (replaces SMS OTP for all users)
  sendRegistrationEmailOtp: (email: string, name?: string) =>
    apiClient.post('/auth/otp/send-registration-email', { email, name }).then((r) => r.data),

  verifyRegistrationEmailOtp: (email: string, otp: string) =>
    apiClient.post<{ verified: boolean }>('/auth/otp/verify-registration-email', { email, otp }).then((r) => r.data),

  // Email OTP — login
  sendLoginEmailOtp: (email: string) =>
    apiClient.post('/auth/otp/send-login-email', { email }).then((r) => r.data),

  verifyLoginEmailOtp: (email: string, otp: string) =>
    apiClient.post<LoginResult>('/auth/otp/verify-login-email', { email, otp }).then((r) => r.data),
};
