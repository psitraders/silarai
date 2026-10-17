import { readImage } from '../../../../../core/smart';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { ProductCard } from '../../../../../ui/ProductCard';
import { SectionHeading } from '../../../../../ui/SectionHeading';
import { LookPhoto } from '../LookPhoto';
import type { ShopTheLookSettings } from '../manifest';
import { useLook } from '../useLook';

/** Look photo with hotspots; the picked product's card sits beside it (below on phones). */
export default function Hotspots({ settings, blocks, context }: LayoutProps<ShopTheLookSettings>) {
  const look = useLook(blocks);
  if (!readImage(settings.image) || (!look.isLoading && !look.spots.length)) {
    return <EditorHint context={context} text="Upload a look photo and add a hotspot for each product in it." />;
  }
  const current = look.spots[look.active];
  return (
    <div className="sf-container sf-section-pad">
      <div className="grid items-center gap-8 @3xl:grid-cols-[1.2fr_1fr] @5xl:gap-14">
        <LookPhoto image={settings.image} spots={look.spots} active={look.active} onPick={look.setActive} className="aspect-[4/5] w-full" eager={context.isFirst} />
        <div>
          <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.text} />
          <div aria-live="polite" className="mx-auto max-w-xs @3xl:mx-0">
            {current && <ProductCard key={current.product.id} product={current.product} index={-1} context={context} />}
          </div>
          {look.spots.length > 1 && (
            <p className="mt-4 text-xs sf-muted">{look.active + 1} of {look.spots.length} — tap the dots on the photo to see each piece.</p>
          )}
        </div>
      </div>
    </div>
  );
}
