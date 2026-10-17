import { useMemo } from 'react';
import { useStorefront } from '../storefront-context';
import type { StyleOptions } from '../types';
import { resolveTheme } from './buildTheme';

/** The effective style options (kit + fine-tune overrides) for `ui/` primitives and card packs. */
export function useStyleOptions(): StyleOptions {
  const { site } = useStorefront();
  return useMemo(() => resolveTheme(site.theme).style, [site.theme]);
}
