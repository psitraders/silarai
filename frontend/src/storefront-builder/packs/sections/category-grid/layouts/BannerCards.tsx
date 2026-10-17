import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { optimizeImage } from '../../../../../utils/imageUrl';
import { useResolvedCategories } from '../../../../core/data/hooks';
import { useStorefront } from '../../../../core/storefront-context';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { CategoryGridSettings } from '../manifest';

/** Wide photo cards with the category name, description and a "Shop" arrow. */
export default function BannerCards({ settings, context }: LayoutProps<CategoryGridSettings>) {
  const { links } = useStorefront();
  const { items, isLoading } = useResolvedCategories(settings.categories);
  if (!isLoading && !items.length) return <EditorHint context={context} text="Add categories to your catalogue to fill this section." />;

  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.title} />
      <ul className="sf-gap grid @2xl:grid-cols-2">
        {(isLoading ? Array.from({ length: 4 }, () => null) : items).map((cat, i) => (
          <li key={cat?.id ?? i}>
            {cat ? (
              <Link to={links.category(cat.name)} className="sf-card sf-card-hover group relative flex aspect-[16/7] items-end overflow-hidden">
                {cat.imageUrl ? (
                  <img src={optimizeImage(cat.imageUrl, 800)} alt="" loading="lazy" decoding="async" className="sf-zoom absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <span aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--sf-primary), var(--sf-secondary))' }} />
                )}
                <span aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgb(0 0 0 / 0.65), rgb(0 0 0 / 0.1))' }} />
                <span className="relative flex w-full items-end justify-between gap-4 p-5 text-white">
                  <span>
                    <span className="block text-xl font-bold" style={{ fontFamily: 'var(--sf-font-heading)' }}>{cat.name}</span>
                    {cat.description && <span className="mt-1 line-clamp-1 block text-sm opacity-85">{cat.description}</span>}
                  </span>
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur transition-transform duration-(--sf-motion-base) group-hover:translate-x-1">
                    <ArrowRight className="h-5 w-5" aria-hidden />
                  </span>
                </span>
              </Link>
            ) : (
              <div className="sf-skeleton sf-img aspect-[16/7]" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
