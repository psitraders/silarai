/** Merchant-side storefront builder API (authenticated; see StorefrontBuilderController). */
import apiClient from '../../api/client';
import type { PageLayout, SectionInstance, SiteDoc } from '../core/types';

export type BuilderPageType = 'Custom' | 'Home' | 'ProductTemplate' | 'QuickViewTemplate' | 'CollectionTemplate' | 'Cart' | 'Search' | 'NotFound' | 'AltProductTemplate';

/** Categories / products using an extra product design (`AltProductTemplate`). */
export interface ProductDesignAssignment { categoryIds: string[]; productIds: string[] }

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
  /** Extra product designs only. */
  assignment?: ProductDesignAssignment | null;
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

/** One publish in the version history (newest 10 are kept). */
export interface StoreVersion { id: string; version: number; publishedAt: string; pageCount: number; publishedBy: string | null }

/** A page as it was live in a version. */
export interface VersionPage {
  pageId: string;
  pageType: BuilderPageType;
  title: string | null;
  slug: string | null;
  isPublished: boolean;
  showInNav: boolean;
  showInFooter: boolean;
  sortOrder: number;
  layout: PageLayout | null;
}

export interface StoreVersionDetail { id: string; version: number; publishedAt: string; site: SiteDoc; pages: VersionPage[] }

/** What `restore` wrote to the drafts. */
export interface RestoreVersionResult {
  updatedAt: string;
  site: SiteDoc;
  pages: { id: string; title: string; slug: string; pageType: BuilderPageType; layout: PageLayout }[];
}

/** AI page generation (SB-R23): `page` = a whole new page, `sections` = sections for the open page. */
export interface AiGenerateBody {
  prompt: string;
  mode: 'page' | 'sections';
  /** Compact list of the section packs the AI may use (see `ai/catalogue.ts`). */
  catalogue: string;
  pageTitle?: string;
  existingSections?: string[];
}

/** Validated sections (not saved anywhere yet) and this month's AI use count. */
export interface AiGenerateResult { title: string | null; sections: SectionInstance[]; usedThisMonth: number }

/** A section the merchant saved for reuse on any page. */
export interface SavedSection { id: string; name: string; sectionType: string; createdAt: string; section: SectionInstance }

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
  /** Which categories / products use an extra product design (moves them off any other design). */
  setAssignment: (id: string, body: ProductDesignAssignment) =>
    apiClient.put<BuilderPageDetail>(`${BASE}/pages/${id}/assignment`, body).then(r => r.data),
  publish: (body: { brandColors?: { primary: string; secondary: string; accent: string } }) =>
    apiClient.post<PublishResult>(`${BASE}/publish`, body).then(r => r.data),
  /** Writes a template's documents to the drafts in one save (nothing goes live until Publish). */
  applyTemplate: (body: ApplyTemplateBody) =>
    apiClient.post<ApplyTemplateResult>(`${BASE}/apply-template`, body).then(r => r.data),
  /** Shareable draft preview link (SB-R22): null token = no link. */
  getPreviewLink: () => apiClient.get<{ token: string | null }>(`${BASE}/preview-link`).then(r => r.data),
  /** Creates the link, or replaces it (the old one stops working). */
  createPreviewLink: () => apiClient.post<{ token: string }>(`${BASE}/preview-link`).then(r => r.data),
  deletePreviewLink: () => apiClient.delete(`${BASE}/preview-link`),
  /** Generates sections with AI; nothing is saved until the merchant applies them. Can take ~30 s. */
  aiGenerate: (body: AiGenerateBody) =>
    apiClient.post<AiGenerateResult>(`${BASE}/ai/generate`, body, { timeout: 90_000 }).then(r => r.data),
  listVersions: () => apiClient.get<StoreVersion[]>(`${BASE}/versions`).then(r => r.data),
  getVersion: (id: string) => apiClient.get<StoreVersionDetail>(`${BASE}/versions/${id}`).then(r => r.data),
  /** Copies a version into the drafts (nothing goes live until Publish). */
  restoreVersion: (id: string) => apiClient.post<RestoreVersionResult>(`${BASE}/versions/${id}/restore`).then(r => r.data),
  listSavedSections: () => apiClient.get<SavedSection[]>(`${BASE}/saved-sections`).then(r => r.data),
  saveSection: (body: { name: string; section: SectionInstance }) =>
    apiClient.post<SavedSection>(`${BASE}/saved-sections`, body).then(r => r.data),
  renameSavedSection: (id: string, name: string) =>
    apiClient.put<SavedSection>(`${BASE}/saved-sections/${id}`, { name }).then(r => r.data),
  deleteSavedSection: (id: string) => apiClient.delete(`${BASE}/saved-sections/${id}`),
};

/** Readable message from a failed builder call (server validation errors are path-prefixed). */
export function apiErrorMessage(err: unknown): string {
  const data = (err as { response?: { data?: { errors?: string[]; error?: string; title?: string } } })?.response?.data;
  if (data?.errors?.length) return data.errors.slice(0, 3).join(' · ');
  return data?.error || data?.title || (err instanceof Error ? err.message : 'Something went wrong.');
}
