import { Link } from 'react-router-dom';
import { optimizeImage } from '../../../../../utils/imageUrl';
import { useResolvedCategories } from '../../../../core/data/hooks';
import { useStorefront } from '../../../../core/storefront-context';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { CategoryGridSettings } from '../manifest';

/** Round photos in a centred, wrapping grid. */
export default function Circles({ settings, context }: LayoutProps<CategoryGridSettings>) {
  const { links } = useStorefront();
  const { items, isLoading } = useResolvedCategories(settings.categories);
  if (!isLoading && !items.length) return <EditorHint context={context} text="Add categories to your catalogue to fill this section." />;

  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.title} align="center" />
      <ul className="sf-gap grid grid-cols-3 @2xl:grid-cols-4 @4xl:grid-cols-6">
        {(isLoading ? Array.from({ length: 6 }, () => null) : items).map((cat, i) => (
          <li key={cat?.id ?? i}>
            {cat ? (
              <Link to={links.category(cat.name)} className="group flex flex-col items-center gap-3 text-center">
                <span className="sf-placeholder relative block aspect-square w-full overflow-hidden rounded-full transition-transform duration-(--sf-motion-base) group-hover:scale-[1.03]">
                  {cat.imageUrl ? (
                    <img src={optimizeImage(cat.imageUrl, 300)} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <span aria-hidden className="absolute inset-0 flex items-center justify-center text-3xl font-black" style={{ background: 'linear-gradient(135deg, var(--sf-button), var(--sf-gradient-to))', color: 'var(--sf-on-button)' }}>
                      {cat.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="text-sm font-semibold">{cat.name}</span>
              </Link>
            ) : (
              <div className="sf-skeleton aspect-square rounded-full" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
