import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { SectionHeading } from '../../../../../ui/SectionHeading';
import { SmartImage } from '../../../../../ui/SmartImage';
import { SmartLinkAnchor } from '../../../../../ui/SmartLinkAnchor';
import type { ShopByOccasionSettings } from '../manifest';
import { useOccasions } from '../useOccasions';

/** Arch-topped photos with the occasion name below — soft and editorial. */
export default function Arches({ settings, blocks, context }: LayoutProps<ShopByOccasionSettings>) {
  const tiles = useOccasions(blocks);
  if (!tiles.length) return <EditorHint context={context} text="Add occasions and pick the category each one opens." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} align="center" />
      <ul className="sf-gap grid grid-cols-2 @4xl:grid-cols-4">
        {tiles.map(t => (
          <li key={t.id}>
            <SmartLinkAnchor href={t.href} className="block text-center">
              <SmartImage value={t.image} alt="" rounded={false} className="aspect-[3/4] rounded-t-full" sizes="(min-width: 1024px) 25vw, 50vw" />
              <span className="mt-3 block font-semibold hover:underline">{t.label}</span>
            </SmartLinkAnchor>
          </li>
        ))}
      </ul>
    </div>
  );
}
