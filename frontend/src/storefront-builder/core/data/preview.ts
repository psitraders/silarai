/**
 * Shareable draft preview (SB-R22). A link like `/{slug}?preview={token}` shows the merchant's saved
 * drafts. The token is kept for this tab so moving around the store stays in preview.
 */
const storageKey = (slug: string) => `sf_preview_${slug}`;

/** The preview token for this store, from the URL (first visit) or this tab's storage. */
export function previewToken(slug: string): string | null {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('preview');
    if (fromUrl) {
      sessionStorage.setItem(storageKey(slug), fromUrl);
      return fromUrl;
    }
    return sessionStorage.getItem(storageKey(slug));
  } catch {
    return null;
  }
}

/** Leaves preview mode for this store (the link stays valid for others). */
export function clearPreviewToken(slug: string) {
  try { sessionStorage.removeItem(storageKey(slug)); } catch { /* storage unavailable */ }
}
