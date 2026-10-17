import { useResolvedCategories } from '../../../../../core/data/hooks';
import { useStorefront } from '../../../../../core/storefront-context';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { SmartLinkAnchor } from '../../../../../ui/SmartLinkAnchor';
import type { CategoryChipRailSettings } from '../manifest';

/** Text chips in one swipeable row (scrolls inside itself, never the page). */
export default function Chips({ settings, context }: LayoutProps<CategoryChipRailSettings>) {
  const { links } = useStorefront();
  const { items, isLoading } = useResolvedCategories(settings.categories);
  if (isLoading) return <div className="sf-container h-14" aria-hidden />;
  if (!items.length) return <EditorHint context={context} text="Add product categories to show them as chips." />;
  return (
    <nav aria-label={settings.heading || 'Shop by category'} className="sf-container py-3">
      {settings.heading && <h2 className="mb-2 text-sm font-bold">{settings.heading}</h2>}
      <ul className="sf-scroll-x -mx-4 flex gap-2 px-4 pb-1">
        {settings.showAll && <li className="shrink-0"><SmartLinkAnchor href={links.allProducts()} className="sf-chip">All products</SmartLinkAnchor></li>}
        {items.map(c => (
          <li key={c.id} className="shrink-0"><SmartLinkAnchor href={links.category(c.name)} className="sf-chip">{c.name}</SmartLinkAnchor></li>
        ))}
      </ul>
    </nav>
  );
}
