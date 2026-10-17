import { useEffect, useMemo } from 'react';
import type { ThemeSettings } from '../types';
import { buildThemeCss, googleFontsHref, resolveTheme, type ResolvedTheme } from './buildTheme';
import './storefront.css';

/**
 * Applies a theme to everything inside `.sf-root[data-sf-root="<scopeId>"]`:
 * injects the token CSS and loads only the chosen font pair (display=swap).
 */
export function ThemeStyle({ theme, scopeId }: { theme: ThemeSettings | undefined; scopeId: string }) {
  const resolved = useMemo<ResolvedTheme>(() => resolveTheme(theme), [theme]);
  const css = useMemo(() => buildThemeCss(resolved, `.sf-root[data-sf-root="${scopeId}"]`), [resolved, scopeId]);
  const href = googleFontsHref(resolved.font);

  useEffect(() => {
    if (!href) return;
    const id = `sf-font-${resolved.font.id}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    // Fonts are cached per pair; leaving the link in place avoids re-downloads on navigation.
  }, [href, resolved.font.id]);

  return <style data-sf-theme={scopeId}>{css}</style>;
}
