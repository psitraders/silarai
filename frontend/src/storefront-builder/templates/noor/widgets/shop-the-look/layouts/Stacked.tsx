import { readImage } from '../../../../../core/smart';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { ProductCard } from '../../../../../ui/ProductCard';
import { SectionHeading } from '../../../../../ui/SectionHeading';
import { LookPhoto } from '../LookPhoto';
import type { ShopTheLookSettings } from '../manifest';
import { useLook } from '../useLook';

/** Wide look photo with hotspots, every product in the look listed below it. */
export default function Stacked({ settings, blocks, context }: LayoutProps<ShopTheLookSettings>) {
  const look = useLook(blocks);
  if (!readImage(settings.image) || (!look.isLoading && !look.spots.length)) {
    return <EditorHint context={context} text="Upload a look photo and add a hotspot for each product in it." />;
  }
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.text} align="center" />
      <LookPhoto image={settings.image} spots={look.spots} active={look.active} onPick={look.setActive} className="aspect-[4/3] w-full @3xl:aspect-[16/9]" eager={context.isFirst} />
      <ul className="sf-gap mt-8 grid grid-cols-2 @2xl:grid-cols-3 @5xl:grid-cols-4" aria-label="Products in this look">
        {look.spots.map((s, i) => (
          <li key={s.id} className="rounded-[var(--sf-radius-md)] transition-shadow" style={i === look.active ? { boxShadow: '0 0 0 2px var(--sf-link)' } : undefined}>
            <ProductCard product={s.product} index={-1} context={context} />
          </li>
        ))}
      </ul>
    </div>
  );
}
