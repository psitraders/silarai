/**
 * Returns an optimised version of the image URL.
 *
 * • Cloudinary URLs get q_auto (auto-quality) + f_auto (WebP/AVIF for
 *   supported browsers) injected into the transformation chain, plus an
 *   optional pixel-width cap to avoid serving 4K images on mobile cards.
 *
 * • Non-Cloudinary URLs (Azure blobs, etc.) are returned unchanged.
 */
export function optimizeImage(url: string | null | undefined, width?: number): string | undefined {
  if (!url) return undefined;

  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    const transforms = ['q_auto', 'f_auto', ...(width ? [`w_${width}`] : [])].join(',');
    // Insert transforms right after /upload/
    return url.replace('/upload/', `/upload/${transforms}/`);
  }

  return url;
}
