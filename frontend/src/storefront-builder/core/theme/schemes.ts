import type { PaletteColors, SchemeId } from '../types';
import { WHITE, contrast, ensureContrast, isDark, mix, readableOn } from './color';

/** Semantic tokens one colour scheme provides (applied as --sf-* variables). */
export interface SchemeTokens {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  button: string;
  onButton: string;
  link: string;
  badge: string;
  onBadge: string;
  /** Second colour for gradients (hero, CTA bands). */
  gradientTo: string;
}

function tokensFor(bg: string, palette: PaletteColors, opts: { text?: string; button: string; badge: string; surface?: string }): SchemeTokens {
  const dark = isDark(bg);
  const text = ensureContrast(opts.text ?? palette.text, bg, 7);
  const surface = opts.surface ?? (dark ? mix(bg, WHITE, 0.07) : WHITE);
  const button = opts.button;
  return {
    bg,
    surface,
    text,
    muted: ensureContrast(mix(text, bg, 0.35), bg, 4.5),
    border: mix(text, bg, dark ? 0.8 : 0.88),
    button,
    onButton: readableOn(button),
    link: ensureContrast(button, bg, 4.5),
    badge: opts.badge,
    onBadge: readableOn(opts.badge),
    gradientTo: mix(bg, palette.secondary, 0.55),
  };
}

/**
 * Builds the 5 colour schemes of a palette (catalogue §2.1).
 * Every scheme fills every role, so any layout works with any scheme (SB-R7/R8).
 */
export function buildSchemes(p: PaletteColors): Record<SchemeId, SchemeTokens> {
  const darkPalette = isDark(p.background);

  const light = tokensFor(p.background, p, { button: p.primary, badge: p.accent });

  const softBg = mix(p.background, p.primary, darkPalette ? 0.12 : 0.07);
  const soft = tokensFor(softBg, p, { button: p.primary, badge: p.accent, surface: darkPalette ? mix(softBg, WHITE, 0.06) : WHITE });

  // A deep band: dark ink tinted with the brand on light palettes, a lifted surface on dark ones.
  const contrastBg = darkPalette ? mix(p.background, WHITE, 0.06) : mix(p.text, p.primary, 0.18);
  const contrastScheme = tokensFor(contrastBg, p, {
    text: readableOn(contrastBg),
    button: ensureContrast(p.accent, contrastBg, 3),
    badge: p.accent,
  });

  const brandText = readableOn(p.primary);
  const brand = tokensFor(p.primary, p, {
    text: brandText,
    button: brandText,
    badge: p.accent,
    surface: mix(p.primary, brandText, 0.1),
  });
  brand.onButton = contrast(p.primary, brandText) >= 3 ? p.primary : readableOn(brandText);
  brand.gradientTo = p.secondary;

  const accentBg = mix(p.background, p.accent, darkPalette ? 0.16 : 0.1);
  const accent = tokensFor(accentBg, p, { button: p.accent, badge: p.primary });

  return { light, soft, contrast: contrastScheme, brand, accent };
}

export function schemeToCss(t: SchemeTokens): string {
  return [
    `--sf-bg:${t.bg}`,
    `--sf-surface:${t.surface}`,
    `--sf-text:${t.text}`,
    `--sf-muted:${t.muted}`,
    `--sf-border:${t.border}`,
    `--sf-button:${t.button}`,
    `--sf-on-button:${t.onButton}`,
    `--sf-link:${t.link}`,
    `--sf-badge:${t.badge}`,
    `--sf-on-badge:${t.onBadge}`,
    `--sf-gradient-to:${t.gradientTo}`,
  ].join(';');
}
