import apiClient from './client';
import type { DashboardKpis } from '../types/analytics.types';

export const analyticsApi = {
  getKpis: (periodDays = 7) =>
    apiClient.get<DashboardKpis>('/analytics/kpis', { params: { periodDays } }).then((r) => r.data),
};
