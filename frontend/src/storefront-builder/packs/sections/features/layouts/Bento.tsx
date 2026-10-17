import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { StoreIcon } from '../../../../ui/icons';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { FeaturesSettings } from '../manifest';
import { useFeatures } from '../useFeatures';

// Tile spans repeat in a 4-column rhythm: wide, narrow, narrow, wide…
const SPAN = ['@3xl:col-span-2', '', '', '@3xl:col-span-2'];

export default function Bento({ settings, blocks, context }: LayoutProps<FeaturesSettings>) {
  const items = useFeatures(blocks);
  if (!items.length) return <EditorHint context={context} text="Add features to this section." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} align={settings.align} />
      <ul className="sf-gap grid grid-cols-1 @xl:grid-cols-2 @3xl:grid-cols-4">
        {items.map(({ id, settings: f }, i) => {
          const tinted = i % 3 === 0;
          return (
            <li
              key={id}
              data-sf-scheme={tinted ? 'brand' : undefined}
              className={`flex min-h-[180px] flex-col justify-between gap-6 rounded-[var(--sf-card-radius)] p-6 ${tinted ? 'sf-scheme' : 'sf-card'} ${SPAN[i % 4]}`}
            >
              <StoreIcon name={f.icon} className="h-8 w-8" />
              <div>
                <h3 className="sf-h3 text-xl">{f.title}</h3>
                {f.text && <p className="mt-1 text-sm opacity-80">{f.text}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
