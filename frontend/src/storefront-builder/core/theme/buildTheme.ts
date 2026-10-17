/**
 * Theme engine (three token layers, design.md §2.2):
 *   palette (primitive) → 5 colour schemes (semantic) → style options (component).
 * Produces one CSS string scoped to a root selector, plus the font-pair to load.
 */
import { registry } from '../registry';
import type { FontPairDef, FontSpec, PaletteColors, SchemeId, StyleOptions, ThemeSettings } from '../types';
import { isDark, isHex } from './color';
import { buildSchemes, schemeToCss } from './schemes';
import { styleTokens, tokensToCss } from './styleTokens';

export const FALLBACK_PALETTE: PaletteColors = {
  primary: '#0F766E', secondary: '#134E4A', accent: '#D97706', background: '#F8FAFC', text: '#0F172A',
};

export const FALLBACK_STYLE: StyleOptions = {
  corners: 'soft', imageCorners: 'soft', shadowDepth: 'soft',
  headingScale: 'regular', headingWeight: 'bold', headingCase: 'normal', headingTracking: 'tight', bodySize: 16, linkStyle: 'color',
  buttonShape: 'rounded', buttonStyle: 'filled', buttonSize: 'regular', buttonHover: 'darken', buttonCase: 'normal',
  cardStyle: 'shadow', cardPadding: 'normal', cardHover: 'lift',
  productImageRatio: 'portrait', productSecondImage: true, productQuickAdd: true, productWishlist: true, productTitleLines: 2, productShowCategory: true, foodMarkers: false,
  badgeShape: 'pill', badgePosition: 'left', saleBadge: 'percent', priceCompare: 'strike', taxNote: false,
  inputStyle: 'outline', iconStroke: 'regular',
  pageWidth: 'regular', sectionSpacing: 'comfortable', gridGap: 'normal',
  texture: 'none', gradients: true,
  motion: 'subtle', scrollReveal: 'none',
  surface: 'solid', overlay: 'medium',
};

const FALLBACK_FONT: FontPairDef = {
  id: 'system', name: 'System', googleQuery: '',
  heading: { family: 'system-ui', fallback: 'sans' }, body: { family: 'system-ui', fallback: 'sans' },
};

export interface ResolvedTheme {
  palette: PaletteColors;
  dark: boolean;
  style: StyleOptions;
  font: FontPairDef;
}

export function resolvePalette(choice: ThemeSettings['palette'] | undefined): { colors: PaletteColors; dark: boolean } {
  if (choice?.custom) {
    const c = choice.custom;
    const safe = (v: string, fb: string) => (isHex(v) ? v : fb);
    return {
      colors: {
        primary: safe(c.primary, FALLBACK_PALETTE.primary),
        secondary: safe(c.secondary, FALLBACK_PALETTE.secondary),
        accent: safe(c.accent, FALLBACK_PALETTE.accent),
        background: safe(c.background, FALLBACK_PALETTE.background),
        text: safe(c.text, FALLBACK_PALETTE.text),
      },
      dark: isDark(isHex(c.background) ? c.background : FALLBACK_PALETTE.background),
    };
  }
  const preset = choice?.presetId ? registry.getPalette(choice.presetId) : undefined;
  return { colors: preset?.colors ?? FALLBACK_PALETTE, dark: !!preset?.dark };
}

export function resolveTheme(theme: ThemeSettings | undefined): ResolvedTheme {
  const { colors, dark } = resolvePalette(theme?.palette);
  const kit = theme?.styleKit ? registry.getStyleKit(theme.styleKit) : undefined;
  const style: StyleOptions = { ...FALLBACK_STYLE, ...(kit?.options ?? {}), ...(theme?.overrides ?? {}) };
  const font = (theme?.fontPair && registry.getFontPair(theme.fontPair)) || registry.getFontPair('inter') || FALLBACK_FONT;
  return { palette: colors, dark, style, font };
}

const NOTO = "'Noto Sans','Noto Sans Devanagari','Noto Sans Tamil','Noto Sans Bengali'";
export function fontStack(f: FontSpec): string {
  const generic = f.fallback === 'serif' ? 'Georgia,serif' : 'system-ui,-apple-system,sans-serif';
  const family = f.family === 'system-ui' ? '' : `'${f.family}',`;
  return `${family}${NOTO},${generic}`;
}

/** CSS for one storefront root: tokens on the root + one rule per colour scheme. */
export function buildThemeCss(theme: ResolvedTheme, scope: string): string {
  const schemes = buildSchemes(theme.palette);
  const root = [
    tokensToCss(styleTokens(theme.style)),
    `--sf-font-heading:${fontStack(theme.font.heading)}`,
    `--sf-font-body:${fontStack(theme.font.body)}`,
    `--sf-primary:${theme.palette.primary}`,
    `--sf-secondary:${theme.palette.secondary}`,
    `--sf-accent:${theme.palette.accent}`,
    `--sf-success:#16a34a`,
    `--sf-danger:#dc2626`,
    schemeToCss(schemes.light),
  ].join(';');

  const rules = [`${scope}{${root}}`];
  for (const id of Object.keys(schemes) as SchemeId[]) {
    rules.push(`${scope} [data-sf-scheme="${id}"]{${schemeToCss(schemes[id])}}`);
  }
  return rules.join('\n');
}

export function googleFontsHref(font: FontPairDef): string | null {
  return font.googleQuery ? `https://fonts.googleapis.com/css2?${font.googleQuery}&display=swap` : null;
}
