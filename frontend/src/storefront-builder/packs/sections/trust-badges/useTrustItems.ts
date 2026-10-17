import { useStorefront } from '../../../core/storefront-context';
import type { TrustBadgesSettings } from './manifest';

export function useTrustItems(settings: TrustBadgesSettings) {
  const { store } = useStorefront();
  return (settings.items ?? []).filter(
    i => i.text?.trim() && !(i.icon === 'whatsapp' && settings.hideWhatsAppWithoutNumber && !store.whatsAppNumber),
  );
}
