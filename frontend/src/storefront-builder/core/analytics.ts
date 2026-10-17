/** Safe GA4 event helper — no-ops until the store's gtag script has loaded. */
export function gtagEvent(eventName: string, params?: Record<string, unknown>) {
  try {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === 'function') gtag('event', eventName, params);
  } catch { /* analytics must never break the store */ }
}
