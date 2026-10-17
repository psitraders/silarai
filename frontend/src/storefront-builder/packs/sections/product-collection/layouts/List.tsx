import { ChevronRight } from 'lucide-react';
import { useResolvedProducts } from '../../../../core/data/hooks';
import { useShell } from '../../../../core/shell-context';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { Price } from '../../../../ui/Price';
import { ProductImage } from '../../../../ui/ProductImage';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { ProductCollectionSettings } from '../manifest';
import { ViewAllLink } from '../ViewAllLink';

/** Compact rows (image · name · price), two columns on wide screens. Good for menus and price lists. */
export default function List({ settings, context }: LayoutProps<ProductCollectionSettings>) {
  const shell = useShell();
  const { items, isLoading } = useResolvedProducts(settings.products);
  if (!isLoading && !items.length) return <EditorHint context={context} text="No products match this collection yet." />;

  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading
        eyebrow={settings.eyebrow}
        title={settings.title}
        subtitle={settings.subtitle}
        action={settings.showViewAll ? <ViewAllLink query={settings.products.$products} categoryName={items[0]?.categoryName} /> : undefined}
      />
      <ul className="grid gap-x-8 @3xl:grid-cols-2">
        {(isLoading ? Array.from({ length: 6 }, () => null) : items).map((p, i) => (
          <li key={p?.id ?? i} style={{ borderBottom: '1px solid var(--sf-border)' }}>
            {p ? (
              <button type="button" onClick={() => shell.openProduct(p)} className="group flex w-full items-center gap-4 py-3 text-left">
                <ProductImage src={p.primaryImage} alt="" width={160} className="sf-img-sm h-16 w-16 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold group-hover:underline">{p.title}</span>
                  {p.categoryName && <span className="block truncate text-xs sf-muted">{p.categoryName}</span>}
                </span>
                <Price product={p} size="sm" className="shrink-0 text-right" />
                <ChevronRight className="h-4 w-4 shrink-0 sf-muted" aria-hidden />
              </button>
            ) : (
              <div className="flex items-center gap-4 py-3"><div className="sf-skeleton h-16 w-16 rounded-lg" /><div className="sf-skeleton h-4 flex-1 rounded-full" /></div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
