/** Small, dependency-free colour helpers for the theme engine (hex in, hex out). */

type RGB = [number, number, number];

const clamp = (n: number, min = 0, max = 255) => Math.min(max, Math.max(min, n));

export function isHex(value: unknown): value is string {
  return typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}

export function hexToRgb(hex: string): RGB {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]: RGB): string {
  return '#' + [r, g, b].map(v => clamp(Math.round(v)).toString(16).padStart(2, '0')).join('');
}

/** Linear mix: t = 0 → a, t = 1 → b. */
export function mix(a: string, b: string, t: number): string {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  return rgbToHex([0, 1, 2].map(i => ra[i] + (rb[i] - ra[i]) * t) as RGB);
}

/** WCAG relative luminance. */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio (1–21). */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function isDark(hex: string): boolean {
  return luminance(hex) < 0.22;
}

export const INK = '#0f172a';
export const WHITE = '#ffffff';

/** Whichever of white / ink reads better on `bg`. */
export function readableOn(bg: string): string {
  return contrast(WHITE, bg) >= contrast(INK, bg) ? WHITE : INK;
}

/**
 * Nudges `fg` toward the readable colour for `bg` until it reaches `min` contrast.
 * Keeps brand colour where possible; falls back to white/ink when it can't.
 */
export function ensureContrast(fg: string, bg: string, min = 4.5): string {
  if (contrast(fg, bg) >= min) return fg;
  const target = readableOn(bg);
  for (let t = 0.1; t <= 1; t += 0.1) {
    const c = mix(fg, target, t);
    if (contrast(c, bg) >= min) return c;
  }
  return target;
}
