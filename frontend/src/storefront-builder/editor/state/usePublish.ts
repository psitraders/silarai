import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { resolveTheme } from '../../core/theme/buildTheme';
import { hexToRgb, rgbToHex } from '../../core/theme/color';
import { apiErrorMessage, builderApi } from '../api';
import { useToast } from '../ui/toastStore';
import { useEditor } from './store';
import { PAGES_KEY } from './useEditorBoot';

/**
 * Publish = save everything, then copy all drafts live in one go (SB-R2). The palette's
 * colours are sent along so the store's brand colour (PWA, chatbot widget, emails) follows the design.
 */
export function usePublish(saveNow: () => Promise<boolean>) {
  const qc = useQueryClient();
  const show = useToast(s => s.show);
  const [publishing, setPublishing] = useState(false);

  const publish = useCallback(async () => {
    setPublishing(true);
    try {
      if (!(await saveNow())) { show('error', 'Couldn’t save your changes, so nothing was published. Fix the error and try again.'); return; }
      const s = useEditor.getState();
      if (!s.site) return;
      if (!s.themeOnServer) { await builderApi.saveTheme(s.site); s.setThemeOnServer(); }
      const { primary, secondary, accent } = resolveTheme(s.site.theme).palette;
      const hex6 = (c: string) => rgbToHex(hexToRgb(c)).toUpperCase();
      await builderApi.publish({ brandColors: { primary: hex6(primary), secondary: hex6(secondary), accent: hex6(accent) } });
      void qc.invalidateQueries({ queryKey: PAGES_KEY });
      void qc.invalidateQueries({ queryKey: ['public-site', s.slug] });
      void qc.invalidateQueries({ queryKey: ['storefront-settings'] });
      show('success', 'Published — your store is live.', { label: 'View store', href: `/${s.slug}` });
    } catch (err) {
      show('error', `Publish failed: ${apiErrorMessage(err)}`);
    } finally {
      setPublishing(false);
    }
  }, [saveNow, qc, show]);

  return { publish, publishing };
}
