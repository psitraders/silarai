import { Link } from 'react-router-dom';
import { optimizeImage } from '../../../../../utils/imageUrl';
import { useResolvedCategories } from '../../../../core/data/hooks';
import { useStorefront } from '../../../../core/storefront-context';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { CategoryGridSettings } from '../manifest';

export default function Tiles({ settings, context }: LayoutProps<CategoryGridSettings>) {
  const { links } = useStorefront();
  const { items, isLoading } = useResolvedCategories(settings.categories);
  if (!isLoading && !items.length) return <EditorHint context={context} text="Add categories to your catalogue to fill this section." />;

  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.title} />
      <ul className="sf-gap grid grid-cols-2 @2xl:grid-cols-3 @5xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }, (_, i) => <li key={i} className="sf-skeleton sf-img aspect-[4/3]" />)
          : items.map(cat => (
            <li key={cat.id}>
              <Link to={links.category(cat.name)} className="sf-card sf-card-hover group relative block aspect-[4/3]">
                {cat.imageUrl ? (
                  <img src={optimizeImage(cat.imageUrl, 500)} alt="" loading="lazy" decoding="async" className="sf-zoom absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <span aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--sf-primary), var(--sf-secondary))' }} />
                )}
                <span aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgb(0 0 0 / 0.6), transparent 60%)' }} />
                <span className="absolute bottom-3 left-3 right-3 text-base font-bold text-white">{cat.name}</span>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
