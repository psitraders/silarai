import { effectiveSettings } from '../core/renderer/lazyLayout';
import { registry } from '../core/registry';
import type { PageLayout, ProductTemplateRule, RenderContext, Settings, StoreProduct } from '../core/types';

/** Which extra product design a product uses: its own pick, else its category's, else null (= the default design). */
export function pickProductTemplate(rules: ProductTemplateRule[] | undefined, product: Pick<StoreProduct, 'id' | 'categoryId'> | null): string | null {
  if (!rules?.length || !product) return null;
  return rules.find(r => r.productIds.includes(product.id))?.id
    ?? (product.categoryId ? rules.find(r => r.categoryIds.includes(product.categoryId!))?.id : undefined)
    ?? null;
}

export const POPUP_CONTEXT: RenderContext = { mode: 'live', isFirst: false, page: 'product' };

/** Blocks + settings the popup shows: the product template's `product-main` section (or the Starter one). */
export function popupContent(layout: PageLayout, fallback: PageLayout): { blocks: NonNullable<PageLayout['sections'][number]['blocks']>; settings: Settings } {
  const main = layout.sections.find(sec => sec.type === 'product-main') ?? fallback.sections.find(sec => sec.type === 'product-main');
  const manifest = registry.getPack<Settings, unknown>('section', 'product-main');
  return {
    blocks: main?.blocks ?? [],
    settings: manifest ? effectiveSettings(manifest, main?.settings, main?.v) : {},
  };
}
