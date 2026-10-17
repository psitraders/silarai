import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { TemplateDocs } from '../../core/types';
import { apiErrorMessage, builderApi, type ApplyTemplatePage } from '../api';
import { useEditor } from '../state/store';
import { PAGES_KEY } from '../state/useEditorBoot';
import type { SystemPageKey } from '../state/systemPages';
import { useToast } from '../ui/toastStore';

const SYSTEM_BY_TYPE: Record<string, SystemPageKey> = { Home: 'home', CollectionTemplate: 'collection', ProductTemplate: 'product' };

/**
 * Writes a template's documents to the drafts (`apply-template`) and hands them to the editor.
 * `keep` changes only the look (theme, header, footer, behaviour) and keeps the merchant's menus
 * and pages; `replace` also replaces Home, the catalogue and product designs and adds the
 * template's pages (pages with the same address get the template's design as their draft).
 */
export function useApplyTemplate() {
  const qc = useQueryClient();
  const show = useToast(s => s.show);
  const [applying, setApplying] = useState(false);

  const apply = useCallback(async (docs: TemplateDocs, mode: 'keep' | 'replace', templateName: string): Promise<boolean> => {
    setApplying(true);
    try {
      const state = useEditor.getState();
      if (!(await state.flush())) {
        show('error', 'Your latest changes couldn’t be saved, so the template wasn’t applied. Try again.');
        return false;
      }
      const current = useEditor.getState().site;
      const site = mode === 'keep' && current ? { ...docs.site, menus: current.menus } : docs.site;
      const pages: ApplyTemplatePage[] | undefined = mode === 'replace'
        ? [
          { pageType: 'Home', layout: docs.home },
          ...(docs.collection ? [{ pageType: 'CollectionTemplate' as const, layout: docs.collection }] : []),
          ...(docs.product ? [{ pageType: 'ProductTemplate' as const, layout: docs.product }] : []),
          ...(docs.pages ?? []).map(p => ({ pageType: 'Custom' as const, title: p.title, slug: p.slug, layout: p.layout, showInNav: p.showInNav, showInFooter: p.showInFooter })),
        ]
        : undefined;

      const result = await builderApi.applyTemplate({ mode, site, pages });

      const systemIds: Partial<Record<SystemPageKey, string>> = {};
      for (const p of result.pages) {
        const key = SYSTEM_BY_TYPE[p.pageType];
        if (key) systemIds[key] = p.id;
      }
      useEditor.getState().applyTemplateDocs({
        site,
        layouts: mode === 'replace'
          ? { home: docs.home, ...(docs.collection ? { collection: docs.collection } : {}), ...(docs.product ? { product: docs.product } : {}) }
          : {},
        systemIds,
        dropCustomLayouts: mode === 'replace',
      });
      qc.removeQueries({ queryKey: ['sb-builder-page'] });
      void qc.invalidateQueries({ queryKey: PAGES_KEY });
      void qc.invalidateQueries({ queryKey: ['sb-builder-theme'] });
      show('success', `${templateName} applied to your draft — publish when you’re ready.`);
      return true;
    } catch (err) {
      show('error', `Couldn’t apply the template: ${apiErrorMessage(err)}`);
      return false;
    } finally {
      setApplying(false);
    }
  }, [qc, show]);

  return { apply, applying };
}
