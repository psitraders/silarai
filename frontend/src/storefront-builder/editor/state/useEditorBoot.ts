import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { businessApi } from '../../../api/business.api';
import { storefrontApi } from '../../core/data/api';
import type { NavPage } from '../../core/types';
import { builderApi, type BuilderPageSummary } from '../api';
import { starterFor } from './starter';
import { useEditor, type PageKey } from './store';
import { SYSTEM_PAGE_KEYS, SYSTEM_PAGES, isSystemPage } from './systemPages';

export const PAGES_KEY = ['sb-builder-pages'] as const;

export function usePagesQuery() {
  return useQuery({ queryKey: PAGES_KEY, queryFn: builderApi.listPages, staleTime: 30_000 });
}

/** Custom pages as the storefront sees them (menus, footer links). */
export function toNavPages(pages: BuilderPageSummary[]): NavPage[] {
  return pages
    .filter(p => p.pageType === 'Custom' && p.isPublished)
    .map(p => ({ id: p.id, title: p.title, slug: p.slug, showInNav: p.showInNav, showInFooter: p.showInFooter }));
}

/** Loads everything the editor needs once, then initialises the editor store. */
export function useEditorBoot(initialPage: PageKey) {
  const ready = useEditor(s => s.ready);
  const init = useEditor(s => s.init);
  const setNavPages = useEditor(s => s.setNavPages);
  const setProductDesignIds = useEditor(s => s.setProductDesignIds);

  const settings = useQuery({ queryKey: ['storefront-settings'], queryFn: businessApi.getStorefrontSettings, staleTime: 5 * 60_000 });
  const slug = settings.data?.slug ?? '';
  const store = useQuery({ queryKey: ['public-store', slug], queryFn: () => storefrontApi.store(slug), enabled: !!slug, staleTime: 5 * 60_000 });
  const theme = useQuery({ queryKey: ['sb-builder-theme'], queryFn: builderApi.getTheme, staleTime: Infinity, refetchOnWindowFocus: false });
  const pages = usePagesQuery();

  useEffect(() => {
    if (ready || !store.data || !theme.data || !pages.data) return;
    const starter = starterFor(store.data);
    const systemIds = Object.fromEntries(SYSTEM_PAGE_KEYS.map(k => [k, pages.data.find(p => p.pageType === SYSTEM_PAGES[k].pageType)?.id]));
    const known = isSystemPage(initialPage) || pages.data.some(p => p.id === initialPage && (p.pageType === 'Custom' || p.pageType === 'AltProductTemplate'));
    init({
      slug,
      store: store.data,
      site: theme.data.draft ?? theme.data.published ?? starter.site,
      themeOnServer: !!theme.data.draft,
      systemIds,
      currentPage: known ? initialPage : 'home',
      // Nothing saved or published yet → start with the template wizard.
      wizard: !theme.data.draft && !theme.data.published ? { firstRun: true } : null,
    });
  }, [ready, store.data, theme.data, pages.data, slug, initialPage, init]);

  const navPages = useMemo(() => toNavPages(pages.data ?? []), [pages.data]);
  useEffect(() => { setNavPages(navPages); }, [navPages, setNavPages]);
  const designIds = useMemo(() => (pages.data ?? []).filter(p => p.pageType === 'AltProductTemplate').map(p => p.id), [pages.data]);
  useEffect(() => { setProductDesignIds(designIds); }, [designIds, setProductDesignIds]);

  const error = settings.error || store.error || theme.error || pages.error;
  return { error, retry: () => { void settings.refetch(); void store.refetch(); void theme.refetch(); void pages.refetch(); } };
}
