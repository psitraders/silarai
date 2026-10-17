import { blocksOf } from '../../../../../core/blocks';
import { readImage } from '../../../../../core/smart';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { StoreIcon } from '../../../../../ui/icons';
import { SectionHeading } from '../../../../../ui/SectionHeading';
import { SmartImage } from '../../../../../ui/SmartImage';
import { BENTO_TILE_DEFAULTS, type FeatureBentoSettings } from '../manifest';

const SPAN: Record<string, string> = {
  small: '',
  wide: '@2xl:col-span-2',
  tall: '@2xl:row-span-2',
  large: '@2xl:col-span-2 @2xl:row-span-2',
};

/** A 2-column (phones) / 4-column grid of feature tiles in mixed sizes. */
export default function Bento({ settings, blocks, context }: LayoutProps<FeatureBentoSettings>) {
  const tiles = blocksOf(blocks, 'tile', BENTO_TILE_DEFAULTS).filter(t => t.settings.title.trim());
  if (!tiles.length) return <EditorHint context={context} text="Add feature tiles to fill the bento grid." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} />
      <ul className="grid auto-rows-[minmax(160px,auto)] grid-cols-1 gap-3 @md:grid-cols-2 @2xl:grid-cols-4">
        {tiles.map(({ id, settings: t }) => {
          const photo = !!readImage(t.image);
          return (
            <li key={id} className={`sf-card relative isolate flex flex-col justify-end gap-2 overflow-hidden p-5 ${SPAN[t.size] ?? ''}`}>
              {photo && (
                <>
                  <SmartImage value={t.image} alt="" rounded={false} fill className="-z-10" sizes="(min-width: 1024px) 50vw, 100vw" />
                  <span aria-hidden className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(to top, rgb(0 0 0 / 0.7), rgb(0 0 0 / 0.1))' }} />
                </>
              )}
              <StoreIcon name={t.icon} className={`mb-auto h-7 w-7 ${photo ? 'text-white' : 'sf-link'}`} />
              <h3 className={`sf-h3 ${photo ? 'text-white' : ''}`}>{t.title}</h3>
              {t.text && <p className={`text-sm ${photo ? 'text-white/90' : 'sf-muted'}`}>{t.text}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
