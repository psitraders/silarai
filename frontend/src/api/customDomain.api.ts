import { apiClient } from './client';

export interface CustomDomainStatus {
  hasDomain: boolean;
  domain?: string;
  status?: 'pending' | 'active' | 'failed' | 'awaiting_nameservers';
  setupType?: 'www' | 'apex';
  verifiedAt?: string;
  cnameTarget?: string;
  nameservers?: string[];               // apex only — returned after zone creation
  txtValidation?: { name: string; value: string };
}

export interface RefreshResult {
  status: string;
  sslStatus: string;
  isActive: boolean;
}

export const customDomainApi = {
  get: () =>
    apiClient.get<CustomDomainStatus>('/storefront/custom-domain').then(r => r.data),

  save: (domain: string) =>
    apiClient.put<CustomDomainStatus>('/storefront/custom-domain', { domain }).then(r => r.data),

  remove: () =>
    apiClient.delete('/storefront/custom-domain').then(r => r.data),

  refresh: () =>
    apiClient.post<RefreshResult>('/storefront/custom-domain/refresh').then(r => r.data),
};
