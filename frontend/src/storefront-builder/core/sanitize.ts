/**
 * Browser-side safety net for merchant rich text (the server already sanitises
 * `$richtext` on save — SB-R4). DOMPurify is loaded lazily, only by pages that
 * actually contain rich text, so it never weighs down the first paint.
 */
import type { SmartRichText } from './types';

type Purify = { sanitize: (html: string, cfg?: Record<string, unknown>) => string };

let purifyPromise: Promise<Purify> | null = null;

export function loadSanitizer(): Promise<Purify> {
  purifyPromise ??= import('dompurify').then(m => m.default as unknown as Purify);
  return purifyPromise;
}

const CONFIG = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select', 'iframe'],
  FORBID_ATTR: ['style'],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
};

export async function sanitizeHtml(html: string): Promise<string> {
  const purify = await loadSanitizer();
  return purify.sanitize(html, CONFIG);
}

export function isRichText(value: unknown): value is SmartRichText {
  return !!value && typeof value === 'object' && typeof (value as SmartRichText).$richtext === 'string';
}
