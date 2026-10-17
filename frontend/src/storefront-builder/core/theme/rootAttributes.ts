import type { ThemeSettings } from '../types';
import { resolveTheme } from './buildTheme';

/** Data attributes that switch style variants in storefront.css (buttons, links, inputs, textures, motion…). */
export function themeRootAttributes(theme: ThemeSettings | undefined): Record<string, string> {
  const s = resolveTheme(theme).style;
  return {
    'data-sf-btn': s.buttonStyle,
    'data-sf-btn-hover': s.buttonHover,
    'data-sf-card': s.cardStyle,
    'data-sf-card-hover': s.cardHover,
    'data-sf-link': s.linkStyle,
    'data-sf-input': s.inputStyle,
    'data-sf-texture': s.texture,
    'data-sf-gradients': s.gradients ? 'on' : 'off',
    'data-sf-motion': s.motion,
    'data-sf-reveal': s.motion === 'none' ? 'none' : s.scrollReveal,
    'data-sf-surface': s.surface,
  };
}
