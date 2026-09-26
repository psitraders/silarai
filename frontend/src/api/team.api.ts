import apiClient from './client';

export type TeamMemberStatus = 'Active' | 'Invited' | 'Deactivated';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;            // 'TenantAdmin' | 'BusinessAdmin'
  status: TeamMemberStatus;
  createdAt: string;
  lastLoginAt: string | null;
}

// TenantAdmin only — Business Admins get 403 from every endpoint here.
export const teamApi = {
  list: () =>
    apiClient.get<TeamMember[]>('/team').then((r) => r.data),

  invite: (data: { name: string; email: string }) =>
    apiClient.post<TeamMember>('/team/invite', data).then((r) => r.data),

  resendInvite: (userId: string) =>
    apiClient.post(`/team/${userId}/resend-invite`).then((r) => r.data),

  setStatus: (userId: string, isActive: boolean) =>
    apiClient.put(`/team/${userId}/status`, { isActive }).then((r) => r.data),
};
