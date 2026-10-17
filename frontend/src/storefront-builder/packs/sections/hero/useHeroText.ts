import { useStorefront } from '../../../core/storefront-context';
import type { HeroSettings } from './manifest';

/** Heading / text with the store name and description as fallbacks. */
export function useHeroText(settings: HeroSettings) {
  const { store } = useStorefront();
  return {
    heading: settings.heading.trim() || store.name,
    subheading: settings.subheading.trim() || store.description || '',
  };
}
