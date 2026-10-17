import { useResolvedCategories } from '../../../../core/data/hooks';
import { readImage } from '../../../../core/smart';
import { useStorefront } from '../../../../core/storefront-context';
import type { CollectionSpotlightSettings } from './manifest';

/** The spotlighted category with its heading, photo and link (merchant values win). */
export function useSpotlight(settings: CollectionSpotlightSettings) {
  const { links } = useStorefront();
  const { items, isLoading } = useResolvedCategories(settings.category);
  const category = items[0];
  const photo = readImage(settings.image) ?? category?.imageUrl ?? undefined;
  return {
    isLoading,
    heading: settings.heading.trim() || category?.name || '',
    image: photo ? { $image: photo } : undefined,
    href: category ? links.category(category.name) : links.allProducts(),
  };
}
