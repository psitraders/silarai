/** Extracts a provider + id; the embed URL is always built by us, never taken from the merchant. */
export function parseVideo(url: string): { provider: 'youtube' | 'vimeo'; id: string } | null {
  const u = url.trim();
  const yt = u.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/);
  if (yt) return { provider: 'youtube', id: yt[1] };
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d{6,12})/);
  if (vm) return { provider: 'vimeo', id: vm[1] };
  return null;
}
