import { blocksOf } from '../../../../core/blocks';
import { useCategories } from '../../../../core/data/hooks';
import { readImage } from '../../../../core/smart';
import { useStorefront } from '../../../../core/storefront-context';
import type { BlockInstance } from '../../../../core/types';
import { OCCASION_TILE_DEFAULTS } from './manifest';

/** Occasion tiles with their link (category page, else all products) and photo (uploaded, else the category's). */
export function useOccasions(blocks: BlockInstance[]) {
  const { links } = useStorefront();
  const { data: categories = [] } = useCategories();
  return blocksOf(blocks, 'occasion', OCCASION_TILE_DEFAULTS)
    .filter(o => o.settings.label.trim())
    .map(o => {
      const q = o.settings.category?.$categories;
      const id = q?.source === 'manual' ? q.categoryIds?.[0] : undefined;
      const category = id ? categories.find(c => c.id === id) : undefined;
      const photo = readImage(o.settings.image) ?? category?.imageUrl ?? '';
      return { id: o.id, label: o.settings.label, href: category ? links.category(category.name) : links.allProducts(), image: { $image: photo } };
    });
}
