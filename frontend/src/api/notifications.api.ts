import apiClient from './client';

export interface ActivityItem {
  type: 'order' | 'lead' | 'customer';
  title: string;
  subtitle: string;
  occurredAt: string; // ISO date string
  entityId: string | null;
}

export const notificationsApi = {
  getFeed: (count = 20) =>
    apiClient
      .get<ActivityItem[]>('/activity/feed', { params: { count } })
      .then((r) => r.data),
};
