import type { Roundness, StyleOptions } from '../types';

/** Component-token layer: style options → CSS variables used by `ui/` and storefront.css. */

const RADIUS: Record<Roundness, [string, string, string]> = {
  sharp:  ['0px', '0px', '0px'],
  subtle: ['4px', '6px', '8px'],
  soft:   ['10px', '14px', '18px'],
  round:  ['14px', '20px', '28px'],
};

const BUTTON_RADIUS: Record<StyleOptions['buttonShape'], string> = {
  square: '0px', soft: '8px', rounded: '14px', pill: '999px',
};

// [min-height, padding-inline, font-size]
const BUTTON_SIZE: Record<StyleOptions['buttonSize'], [string, string, string]> = {
  compact: ['40px', '1.1rem', '0.85rem'],
  regular: ['44px', '1.4rem', '0.9rem'],
  large:   ['52px', '1.9rem', '1rem'],
};

const SHADOW: Record<StyleOptions['shadowDepth'], [string, string]> = {
  none:   ['none', 'none'],
  soft:   ['0 1px 3px rgb(15 23 42 / 0.06), 0 1px 2px rgb(15 23 42 / 0.04)', '0 12px 32px rgb(15 23 42 / 0.12)'],
  strong: ['0 4px 14px rgb(15 23 42 / 0.10)', '0 20px 44px rgb(15 23 42 / 0.18)'],
  hard:   ['4px 4px 0 var(--sf-text)', '6px 6px 0 var(--sf-text)'],
};

const SECTION_SPACE: Record<StyleOptions['sectionSpacing'], [string, string]> = {
  compact:     ['32px', '48px'],
  comfortable: ['48px', '72px'],
  airy:        ['64px', '104px'],
};

const PAGE_WIDTH: Record<StyleOptions['pageWidth'], string> = {
  narrow: '1024px', regular: '1200px', wide: '1440px', full: '100%',
};

const GAP: Record<StyleOptions['gridGap'], [string, string]> = {
  tight: ['8px', '12px'], normal: ['12px', '20px'], loose: ['16px', '32px'],
};

const CARD_PAD: Record<StyleOptions['cardPadding'], string> = {
  tight: '10px', normal: '14px', roomy: '20px',
};

const HEADING_WEIGHT: Record<StyleOptions['headingWeight'], string> = {
  regular: '400', semibold: '600', bold: '700', black: '850',
};

const HEADING_TRACKING: Record<StyleOptions['headingTracking'], string> = {
  tight: '-0.025em', normal: '0em', wide: '0.06em',
};

// [h1 mobile, h1 desktop, h2 mobile, h2 desktop]
const HEADING_SCALE: Record<StyleOptions['headingScale'], [string, string, string, string]> = {
  compact: ['1.875rem', '2.75rem', '1.375rem', '1.75rem'],
  regular: ['2.25rem', '3.5rem', '1.5rem', '2rem'],
  large:   ['2.75rem', '4.5rem', '1.75rem', '2.5rem'],
  huge:    ['3.25rem', '5.75rem', '2rem', '3rem'],
};

const MOTION: Record<StyleOptions['motion'], [string, string]> = {
  none:       ['0ms', '0ms'],
  subtle:     ['160ms', '240ms'],
  expressive: ['220ms', '420ms'],
};

const BADGE_RADIUS: Record<StyleOptions['badgeShape'], string> = {
  pill: '999px', tag: '3px 999px 999px 3px', square: '4px',
};

const ICON_STROKE: Record<StyleOptions['iconStroke'], string> = { thin: '1.5', regular: '2', bold: '2.5' };

const OVERLAY: Record<StyleOptions['overlay'], string> = { light: '0.25', medium: '0.45', dark: '0.65' };

export function styleTokens(o: StyleOptions): Record<string, string> {
  const [rSm, rMd, rLg] = RADIUS[o.corners];
  const [iSm, , iLg] = RADIUS[o.imageCorners];
  const [shadowRest, shadowHover] = SHADOW[o.shadowDepth];
  const [spaceSm, spaceLg] = SECTION_SPACE[o.sectionSpacing];
  const [h1s, h1l, h2s, h2l] = HEADING_SCALE[o.headingScale];
  const [motionFast, motionBase] = MOTION[o.motion];
  const [btnH, btnPx, btnFs] = BUTTON_SIZE[o.buttonSize];
  const [gapSm, gapLg] = GAP[o.gridGap];

  const cardShadow =
    o.cardStyle === 'shadow' || o.cardStyle === 'elevated' ? shadowRest
    : o.cardStyle === 'hard-shadow' ? SHADOW.hard[0]
    : 'none';
  const cardShadowHover =
    o.cardStyle === 'elevated' || o.cardHover === 'lift' ? (o.cardStyle === 'hard-shadow' ? SHADOW.hard[1] : shadowHover)
    : cardShadow;

  return {
    '--sf-radius-sm': rSm,
    '--sf-radius-md': rMd,
    '--sf-radius-lg': rLg,
    '--sf-img-radius': o.imageCorners === 'sharp' ? '0px' : iLg,
    '--sf-img-radius-sm': iSm,
    '--sf-btn-radius': BUTTON_RADIUS[o.buttonShape],
    '--sf-btn-h': btnH,
    '--sf-btn-px': btnPx,
    '--sf-btn-fs': btnFs,
    '--sf-btn-case': o.buttonCase === 'upper' ? 'uppercase' : 'none',
    '--sf-btn-tracking': o.buttonCase === 'upper' ? '0.06em' : '0em',
    '--sf-btn-shadow': o.buttonStyle === 'hard-shadow' ? '3px 3px 0 var(--sf-text)' : 'none',
    '--sf-card-radius': rLg,
    '--sf-card-shadow': cardShadow,
    '--sf-card-shadow-hover': cardShadowHover,
    '--sf-card-border-width': o.cardStyle === 'bordered' || o.cardStyle === 'hard-shadow' || o.cardStyle === 'glass' || o.cardHover === 'border' ? (o.cardStyle === 'hard-shadow' ? '2px' : '1px') : '0px',
    '--sf-card-lift': o.cardHover === 'lift' && o.motion !== 'none' ? '-4px' : '0px',
    '--sf-card-zoom': o.cardHover === 'zoom' && o.motion !== 'none' ? '1.06' : '1',
    '--sf-card-pad': CARD_PAD[o.cardPadding],
    '--sf-input-radius': o.inputStyle === 'underline' ? '0px' : rMd,
    '--sf-heading-weight': HEADING_WEIGHT[o.headingWeight],
    '--sf-heading-case': o.headingCase === 'upper' ? 'uppercase' : 'none',
    '--sf-heading-tracking': o.headingCase === 'upper' && o.headingTracking === 'tight' ? '0.02em' : HEADING_TRACKING[o.headingTracking],
    '--sf-h1-sm': h1s,
    '--sf-h1-lg': h1l,
    '--sf-h2-sm': h2s,
    '--sf-h2-lg': h2l,
    '--sf-body-size': `${o.bodySize}px`,
    '--sf-section-space-sm': spaceSm,
    '--sf-section-space-lg': spaceLg,
    '--sf-page-width': PAGE_WIDTH[o.pageWidth],
    '--sf-gap-sm': gapSm,
    '--sf-gap': gapLg,
    '--sf-motion-fast': motionFast,
    '--sf-motion-base': motionBase,
    '--sf-surface-blur': o.surface === 'glass' ? '14px' : '0px',
    '--sf-surface-alpha': o.surface === 'glass' ? '0.72' : '1',
    '--sf-overlay-alpha': OVERLAY[o.overlay],
    '--sf-badge-radius': BADGE_RADIUS[o.badgeShape],
    '--sf-icon-stroke': ICON_STROKE[o.iconStroke],
  };
}

export function tokensToCss(tokens: Record<string, string>): string {
  return Object.entries(tokens).map(([k, v]) => `${k}:${v}`).join(';');
}
