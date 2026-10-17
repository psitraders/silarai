import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { apiErrorMessage, builderApi } from '../api';
import { PAGES_KEY } from './useEditorBoot';
import { dirtyKeys, useEditor } from './store';
import { SYSTEM_PAGES, isSystemPage } from './systemPages';

const DELAY = 1200;

/**
 * Saves drafts shortly after the merchant stops editing (design.md §9: long editors
 * autosave). Edits made while a save is in flight stay dirty and are saved next.
 * Returns `saveNow()` for Publish / leaving the editor.
 */
export function useAutosave() {
  const qc = useQueryClient();
  const inFlight = useRef<Promise<boolean> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSave = useCallback(async (): Promise<boolean> => {
    const s = useEditor.getState();
    const keys = dirtyKeys(s);
    if (!keys.length || !s.site) return true;
    const snapshot: Record<string, number> = {};
    for (const k of keys) snapshot[k] = s.rev[k] ?? 0;
    s.markSaving();
    try {
      if (keys.includes('site')) {
        await builderApi.saveTheme(s.site);
        s.setThemeOnServer();
      }
      let createdPage = false;
      for (const key of keys.filter(k => k !== 'site')) {
        const layout = s.layouts[key];
        if (!layout) continue;
        if (isSystemPage(key)) {
          const id = useEditor.getState().systemIds[key];
          if (id) await builderApi.updatePage(id, { layout });
          else {
            const created = await builderApi.createPage({ pageType: SYSTEM_PAGES[key].pageType, layout });
            useEditor.getState().setSystemId(key, created.id);
            createdPage = true;
          }
        } else {
          await builderApi.updatePage(key, { layout });
        }
      }
      useEditor.getState().markSaved(snapshot);
      if (createdPage || keys.length > 1 || !keys.includes('site')) void qc.invalidateQueries({ queryKey: PAGES_KEY });
      return true;
    } catch (err) {
      useEditor.getState().markError(apiErrorMessage(err));
      return false;
    }
  }, [qc]);

  const saveNow = useCallback(async (): Promise<boolean> => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    while (inFlight.current) await inFlight.current;
    inFlight.current = runSave();
    const ok = await inFlight.current;
    inFlight.current = null;
    return ok;
  }, [runSave]);

  // Lets other flows (template wizard) save pending edits before they replace documents.
  useEffect(() => {
    useEditor.setState({ flush: saveNow });
    return () => useEditor.setState({ flush: async () => true });
  }, [saveNow]);

  // Debounced save after every edit (a failed save waits for the next edit or "Retry").
  useEffect(() => useEditor.subscribe((state, prev) => {
    if (state.rev === prev.rev) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { void saveNow(); }, DELAY);
  }), [saveNow]);

  // Warn before closing the tab with unsaved edits.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (useEditor.getState().saveState !== 'saved') { e.preventDefault(); }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return { saveNow };
}
