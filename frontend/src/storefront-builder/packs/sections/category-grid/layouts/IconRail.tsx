import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { optimizeImage } from '../../../../../utils/imageUrl';
import { useResolvedCategories } from '../../../../core/data/hooks';
import { useStorefront } from '../../../../core/storefront-context';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { CategoryGridSettings } from '../manifest';

const TILE = 'h-[72px] w-[72px] rounded-[var(--sf-radius-lg)] overflow-hidden transition-transform duration-(--sf-motion-base) group-hover:-translate-y-0.5';

export default function IconRail({ settings, context }: LayoutProps<CategoryGridSettings>) {
  const { links } = useStorefront();
  const { items, isLoading } = useResolvedCategories(settings.categories);
  if (!isLoading && !items.length) return <EditorHint context={context} text="Add categories to your catalogue to fill this section." />;

  return (
    <div className="sf-container py-8">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.title} />
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute bottom-2 right-0 top-0 z-10 w-12" style={{ background: 'linear-gradient(to left, var(--sf-bg), transparent)' }} />
        <ul className="sf-scroll-x flex gap-4 pb-2">
          {settings.showAll && (
            <li className="shrink-0">
              <Link to={links.allProducts()} className="group flex w-[76px] flex-col items-center gap-2 text-center">
                <span className={`${TILE} flex items-center justify-center`} style={{ background: 'linear-gradient(135deg, var(--sf-primary), var(--sf-secondary))' }}>
                  <ShoppingBag className="h-7 w-7 text-white" aria-hidden />
                </span>
                <span className="text-[11px] font-bold leading-tight">All</span>
              </Link>
            </li>
          )}
          {isLoading
            ? Array.from({ length: 6 }, (_, i) => <li key={i} className="shrink-0"><div className={`${TILE} sf-skeleton`} /></li>)
            : items.map(cat => (
              <li key={cat.id} className="shrink-0">
                <Link to={links.category(cat.name)} className="group flex w-[76px] flex-col items-center gap-2 text-center">
                  <span className={`${TILE} sf-placeholder`}>
                    {cat.imageUrl ? (
                      <img src={optimizeImage(cat.imageUrl, 200)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-2xl font-black text-white" style={{ background: 'linear-gradient(135deg, var(--sf-primary), var(--sf-secondary))' }}>
                        {cat.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-bold leading-tight sf-muted">{cat.name}</span>
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
