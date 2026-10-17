import { LayoutGrid } from 'lucide-react';
import { useResolvedCategories } from '../../../../../core/data/hooks';
import { useStorefront } from '../../../../../core/storefront-context';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { ProductImage } from '../../../../../ui/ProductImage';
import { SmartLinkAnchor } from '../../../../../ui/SmartLinkAnchor';
import type { CategoryChipRailSettings } from '../manifest';

/** Chips with a small round category photo, in one swipeable row. */
export default function PhotoChips({ settings, context }: LayoutProps<CategoryChipRailSettings>) {
  const { links } = useStorefront();
  const { items, isLoading } = useResolvedCategories(settings.categories);
  if (isLoading) return <div className="sf-container h-16" aria-hidden />;
  if (!items.length) return <EditorHint context={context} text="Add product categories to show them as chips." />;
  const chip = 'flex min-h-11 items-center gap-2 rounded-full py-1 pl-1 pr-4 text-sm font-semibold';
  const style = { border: '1px solid var(--sf-border)', background: 'var(--sf-surface)' };
  return (
    <nav aria-label={settings.heading || 'Shop by category'} className="sf-container py-4">
      {settings.heading && <h2 className="mb-3 text-sm font-bold">{settings.heading}</h2>}
      <ul className="sf-scroll-x -mx-4 flex gap-2 px-4 pb-1">
        {settings.showAll && (
          <li className="shrink-0">
            <SmartLinkAnchor href={links.allProducts()} className={chip} style={style}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: 'var(--sf-button)', color: 'var(--sf-on-button)' }}><LayoutGrid className="h-4 w-4" aria-hidden /></span>
              All
            </SmartLinkAnchor>
          </li>
        )}
        {items.map(c => (
          <li key={c.id} className="shrink-0">
            <SmartLinkAnchor href={links.category(c.name)} className={chip} style={style}>
              <ProductImage src={c.imageUrl} alt="" width={96} className="h-9 w-9 shrink-0 rounded-full" />
              {c.name}
            </SmartLinkAnchor>
          </li>
        ))}
      </ul>
    </nav>
  );
}
