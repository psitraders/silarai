/** Merchant-side storefront builder API (authenticated; see StorefrontBuilderController). */
import apiClient from '../../api/client';
import type { PageLayout, SiteDoc } from '../core/types';

export type BuilderPageType = 'Custom' | 'Home' | 'ProductTemplate' | 'QuickViewTemplate' | 'CollectionTemplate' | 'Cart' | 'Search' | 'NotFound';

export interface BuilderPageSummary {
  id: string;
  title: string;
  slug: string;
  pageType: BuilderPageType;
  isPublished: boolean;
  showInNav: boolean;
  showInFooter: boolean;
  sortOrder: number;
  publishedAt?: string | null;
  updatedAt?: string | null;
  hasDraft: boolean;
  hasUnpublishedChanges: boolean;
}

export interface BuilderPageDetail extends Omit<BuilderPageSummary, 'hasDraft' | 'hasUnpublishedChanges'> {
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
  draftLayout: PageLayout | null;
  publishedLayout: PageLayout | null;
}

export interface BuilderTheme {
  draft: SiteDoc | null;
  published: SiteDoc | null;
  publishedAt?: string | null;
  version: number;
  updatedAt?: string | null;
}

export interface UpsertPage {
  title?: string;
  slug?: string;
  pageType?: BuilderPageType;
  layout?: PageLayout;
  isPublished?: boolean;
  showInNav?: boolean;
  showInFooter?: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;
}

export interface PublishResult { version: number; publishedAt: string; pages: number; theme: boolean }

export interface ApplyTemplatePage {
  pageType: BuilderPageType;
  title?: string;
  slug?: string;
  layout: PageLayout;
  showInNav?: boolean;
  showInFooter?: boolean;
}

/** `keep` = only the look (site document); `replace` = also the given pages' drafts. */
export interface ApplyTemplateBody { mode: 'keep' | 'replace'; site: SiteDoc; pages?: ApplyTemplatePage[] }

export interface ApplyTemplateResult {
  updatedAt: string;
  pages: { id: string; title: string; slug: string; pageType: BuilderPageType }[];
}

const BASE = '/storefront-builder';

export const builderApi = {
  getTheme: () => apiClient.get<BuilderTheme>(`${BASE}/theme`).then(r => r.data),
  saveTheme: (doc: SiteDoc) => apiClient.put<{ updatedAt: string }>(`${BASE}/theme`, doc).then(r => r.data),
  listPages: () => apiClient.get<BuilderPageSummary[]>(`${BASE}/pages`).then(r => r.data),
  getPage: (id: string) => apiClient.get<BuilderPageDetail>(`${BASE}/pages/${id}`).then(r => r.data),
  createPage: (body: UpsertPage) => apiClient.post<BuilderPageDetail>(`${BASE}/pages`, body).then(r => r.data),
  updatePage: (id: string, body: UpsertPage) => apiClient.put<BuilderPageDetail>(`${BASE}/pages/${id}`, body).then(r => r.data),
  deletePage: (id: string) => apiClient.delete(`${BASE}/pages/${id}`),
  duplicatePage: (id: string) => apiClient.post<BuilderPageDetail>(`${BASE}/pages/${id}/duplicate`).then(r => r.data),
  publish: (body: { brandColors?: { primary: string; secondary: string; accent: string } }) =>
    apiClient.post<PublishResult>(`${BASE}/publish`, body).then(r => r.data),
  /** Writes a template's documents to the drafts in one save (nothing goes live until Publish). */
  applyTemplate: (body: ApplyTemplateBody) =>
    apiClient.post<ApplyTemplateResult>(`${BASE}/apply-template`, body).then(r => r.data),
};

/** Readable message from a failed builder call (server validation errors are path-prefixed). */
export function apiErrorMessage(err: unknown): string {
  const data = (err as { response?: { data?: { errors?: string[]; error?: string; title?: string } } })?.response?.data;
  if (data?.errors?.length) return data.errors.slice(0, 3).join(' · ');
  return data?.error || data?.title || (err instanceof Error ? err.message : 'Something went wrong.');
}
