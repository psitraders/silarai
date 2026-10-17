import { generateWhatsAppLink } from '../../../../../utils/whatsappLink';
import { useStorefront } from '../../../../core/storefront-context';
import type { ConciergeSettings } from './manifest';

/** WhatsApp link for the booking message (null when the store has no WhatsApp number). */
export function useConciergeLink(settings: ConciergeSettings): string | null {
  const { store } = useStorefront();
  if (!store.whatsAppNumber) return null;
  return generateWhatsAppLink(store.whatsAppNumber, settings.message || `Hi ${store.name}! I’d like to book a video call.`);
}

export const NO_NUMBER_HINT = 'Add your WhatsApp number in Business settings so shoppers can book a call.';
