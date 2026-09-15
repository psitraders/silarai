/**
 * Contact & form-handoff configuration.
 *
 * The site is a static build with no backend and no third-party form service.
 * Enquiry forms therefore hand off to the visitor's own mail client via a
 * pre-filled `mailto:` link — the visitor presses Send, and the message arrives
 * from their real address, which makes replying straightforward.
 *
 * Consequences worth knowing:
 *   - Nothing is delivered until the visitor presses Send in their mail app.
 *     UI copy must say so; it must never claim the message was already sent.
 *   - Some visitors (webmail-only, locked-down devices) have no mail client
 *     registered, so nothing visibly happens. Every form must therefore also
 *     show the address in copyable plain text as a fallback.
 *   - There is no server-side record of an enquiry. Replies land in the inbox
 *     below and that is the only record.
 */

export const CONTACT_EMAIL = 'psitraders@outlook.com';
export const CONTACT_PHONE = '(+91)9444139089';
export const CONTACT_PHONE_HREF = 'tel:+919444139089';
export const CONTACT_LEGAL_NAME = 'PSI traders OPC PVT LTD';
export const CONTACT_ADDRESS = '74 RR Nagar, NSNPALAYAM, Coimbatore, Tamil Nadu 641031';

/**
 * Practical ceiling for a mailto: URL. Windows historically truncates around
 * 2048 characters and some clients cut lower, so the body is trimmed to stay
 * comfortably under that rather than silently losing the end of the message.
 */
const MAILTO_MAX_LENGTH = 1800;

/** Builds a pre-filled mailto: URL addressed to the enquiries inbox. */
export function buildMailtoUrl(subject: string, bodyLines: string[]): string {
  const compose = (lines: string[]) =>
    `mailto:${CONTACT_EMAIL}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(lines.filter((line) => line !== null && line !== undefined).join('\n'))}`;

  let lines = bodyLines.slice();
  let url = compose(lines);

  // Drop trailing lines until the URL fits, so the greeting and key details survive.
  while (url.length > MAILTO_MAX_LENGTH && lines.length > 3) {
    lines = lines.slice(0, -1);
    url = compose(lines);
  }

  return url;
}

/**
 * Opens the visitor's mail client. Returns false when the browser blocks it,
 * so the caller can lean on the copyable fallback instead.
 */
export function openMailClient(url: string): boolean {
  try {
    window.location.href = url;
    return true;
  } catch (err) {
    console.warn('Could not open mail client:', err);
    return false;
  }
}

/** Copies text to the clipboard, resolving false when the browser refuses. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
