import type { ContactInfoSettings } from './manifest';

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;
export const mapsHref = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

export function hasContactContent(s: ContactInfoSettings, hasWhatsApp: boolean) {
  return !!(s.address.trim() || s.phone.trim() || s.email.trim() || (s.hours ?? []).some(h => h.trim()) || (s.showWhatsApp && hasWhatsApp));
}
