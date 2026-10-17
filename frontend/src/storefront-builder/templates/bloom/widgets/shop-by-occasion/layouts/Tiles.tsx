import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { SectionHeading } from '../../../../../ui/SectionHeading';
import { SmartImage } from '../../../../../ui/SmartImage';
import { SmartLinkAnchor } from '../../../../../ui/SmartLinkAnchor';
import type { ShopByOccasionSettings } from '../manifest';
import { useOccasions } from '../useOccasions';

/** Tall photo tiles with the occasion name over a gradient. */
export default function Tiles({ settings, blocks, context }: LayoutProps<ShopByOccasionSettings>) {
  const tiles = useOccasions(blocks);
  if (!tiles.length) return <EditorHint context={context} text="Add occasions and pick the category each one opens." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} />
      <ul className="sf-gap grid grid-cols-2 @4xl:grid-cols-4">
        {tiles.map(t => (
          <li key={t.id}>
            <SmartLinkAnchor href={t.href} className="group relative block overflow-hidden">
              <SmartImage value={t.image} alt="" className="aspect-[3/4]" sizes="(min-width: 1024px) 25vw, 50vw" />
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: 'linear-gradient(to top, rgb(0 0 0 / 0.65), transparent)' }} />
              <span className="absolute inset-x-4 bottom-4 text-lg font-bold text-white">{t.label}</span>
            </SmartLinkAnchor>
          </li>
        ))}
      </ul>
    </div>
  );
}
