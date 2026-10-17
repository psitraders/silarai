import { useCurrentProduct } from '../../../core/commerce/currentProduct';
import { useRelatedProducts } from '../../../core/data/hooks';
import type { LayoutProps } from '../../../core/types';
import { EditorHint } from '../../../ui/EditorHint';
import { ProductRow } from '../../../ui/ProductRow';
import { SectionHeading } from '../../../ui/SectionHeading';
import type { RelatedProductsSettings } from './manifest';

export function Related({ settings, context, layout }: LayoutProps<RelatedProductsSettings> & { layout: 'grid' | 'carousel' }) {
  const product = useCurrentProduct();
  const limit = Math.min(Math.max(Number(settings.limit) || 8, 2), 24);
  const { items, isLoading } = useRelatedProducts(product, limit);
  if (!product) return <EditorHint context={context} text="Related products show on the product page, based on the product's category." />;
  if (!isLoading && !items.length) return <EditorHint context={context} text="No other products in this category yet." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.title} />
      <ProductRow products={items} isLoading={isLoading} layout={layout} context={context} label={settings.title || 'Related products'} cardStyle={settings.cardStyle} />
    </div>
  );
}
