import { useCurrentProduct } from '../../../core/commerce/currentProduct';
import { useRecentlyViewed } from '../../../core/commerce/recentlyViewed';
import { useProductsByIds } from '../../../core/data/hooks';
import { useStorefront } from '../../../core/storefront-context';
import type { LayoutProps } from '../../../core/types';
import { EditorHint } from '../../../ui/EditorHint';
import { ProductRow } from '../../../ui/ProductRow';
import { SectionHeading } from '../../../ui/SectionHeading';
import type { RecentlyViewedSettings } from './manifest';

export function Recent({ settings, context, layout }: LayoutProps<RecentlyViewedSettings> & { layout: 'grid' | 'carousel' }) {
  const { slug } = useStorefront();
  const current = useCurrentProduct();
  const limit = Math.min(Math.max(Number(settings.limit) || 8, 2), 12);
  const ids = useRecentlyViewed(slug).filter(id => id !== current?.id).slice(0, limit);
  const { items, isLoading } = useProductsByIds(context.mode === 'live' ? ids : []);
  if (context.mode !== 'live') return <EditorHint context={context} text={`“${settings.title || 'Recently viewed'}” shows each shopper the products they opened recently. It stays hidden until they have viewed some.`} />;
  if (!ids.length || (!isLoading && !items.length)) return null;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.title} />
      <ProductRow products={items} isLoading={isLoading} layout={layout} context={context} label={settings.title || 'Recently viewed'} cardStyle={settings.cardStyle} skeletons={Math.min(ids.length, 4)} />
    </div>
  );
}
