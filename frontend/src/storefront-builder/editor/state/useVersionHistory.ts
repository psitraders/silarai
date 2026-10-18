import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { PageLayout } from '../../core/types';
import { apiErrorMessage, builderApi, type BuilderPageType } from '../api';
import { useToast } from '../ui/toastStore';
import { useEditor, type PageKey } from './store';
import { SYSTEM_PAGE_KEYS, SYSTEM_PAGES, type SystemPageKey } from './systemPages';
import { PAGES_KEY } from './useEditorBoot';

export const VERSIONS_KEY = ['sb-versions'] as const;

/** Editor page key for a page of a version: the system key, or the page id for custom pages. */
export function pageKeyFor(pageType: BuilderPageType, id: string): PageKey {
  return SYSTEM_PAGE_KEYS.find(k => SYSTEM_PAGES[k].pageType === pageType) ?? id;
}

export function useVersions(enabled: boolean) {
  return useQuery({ queryKey: VERSIONS_KEY, queryFn: builderApi.listVersions, enabled, staleTime: 0 });
}

export function useVersionDetail(id: string | null) {
  return useQuery({ queryKey: ['sb-version', id], queryFn: () => builderApi.getVersion(id!), enabled: !!id, staleTime: Infinity });
}

/**
 * Restores a published version into the drafts (SB-R19): pending edits are saved first, the
 * server copies the version's site and page layouts into the drafts, and the editor takes them
 * over as the saved state. Undo history starts again from here.
 */
export function useRestoreVersion() {
  const qc = useQueryClient();
  const show = useToast(s => s.show);
  const [restoring, setRestoring] = useState(false);

  const restore = useCallback(async (id: string, label: string): Promise<boolean> => {
    setRestoring(true);
    try {
      if (!(await useEditor.getState().flush())) {
        show('error', 'Your latest changes couldn’t be saved, so nothing was restored. Try again.');
        return false;
      }
      const result = await builderApi.restoreVersion(id);
      const layouts: Record<PageKey, PageLayout> = {};
      const systemIds: Partial<Record<SystemPageKey, string>> = {};
      for (const p of result.pages) {
        const key = pageKeyFor(p.pageType, p.id);
        layouts[key] = p.layout;
        if (key !== p.id) systemIds[key as SystemPageKey] = p.id;
      }
      useEditor.getState().applyTemplateDocs({ site: result.site, layouts, systemIds, dropCustomLayouts: true });
      qc.removeQueries({ queryKey: ['sb-builder-page'] });
      void qc.invalidateQueries({ queryKey: PAGES_KEY });
      void qc.invalidateQueries({ queryKey: ['sb-builder-theme'] });
      show('success', `${label} restored to your draft — publish when you’re ready.`);
      return true;
    } catch (err) {
      show('error', `Couldn’t restore: ${apiErrorMessage(err)}`);
      return false;
    } finally {
      setRestoring(false);
    }
  }, [qc, show]);

  return { restore, restoring };
}
