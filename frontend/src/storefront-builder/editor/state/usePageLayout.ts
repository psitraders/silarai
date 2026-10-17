import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { builderApi } from '../api';
import { EMPTY_LAYOUT, starterFor } from './starter';
import { useEditor } from './store';
import { isSystemPage } from './systemPages';

/** Makes sure the current page's layout is loaded (draft → published → Starter / empty). */
export function useCurrentPageLoader() {
  const key = useEditor(s => s.currentPage);
  const loaded = useEditor(s => !!s.layouts[s.currentPage]);
  const systemIds = useEditor(s => s.systemIds);
  const store = useEditor(s => s.store);
  const loadLayout = useEditor(s => s.loadLayout);
  const id = isSystemPage(key) ? systemIds[key] : key;

  const detail = useQuery({
    queryKey: ['sb-builder-page', id],
    queryFn: () => builderApi.getPage(id!),
    enabled: !!id && !loaded,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (loaded || !store) return;
    if (id && !detail.data) return;
    const fromServer = detail.data?.draftLayout ?? detail.data?.publishedLayout;
    const starter = starterFor(store);
    const fallback = isSystemPage(key) ? starter[key] : EMPTY_LAYOUT;
    loadLayout(key, structuredClone(fromServer ?? fallback));
  }, [loaded, store, id, detail.data, key, loadLayout]);

  return { loading: !loaded, error: detail.error };
}
