import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { StoreIcon } from '../../../../ui/icons';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { FeaturesSettings } from '../manifest';
import { useFeatures } from '../useFeatures';

export default function Icons({ settings, blocks, context }: LayoutProps<FeaturesSettings>) {
  const items = useFeatures(blocks);
  if (!items.length) return <EditorHint context={context} text="Add features to this section." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} align={settings.align} />
      <ul className={`sf-gap grid grid-cols-1 text-center @xl:grid-cols-2 ${items.length % 4 === 0 ? '@4xl:grid-cols-4' : '@4xl:grid-cols-3'}`}>
        {items.map(({ id, settings: f }) => (
          <li key={id} className="flex flex-col items-center gap-3 px-2">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full sf-link" style={{ background: 'color-mix(in srgb, var(--sf-link) 12%, transparent)' }}>
              <StoreIcon name={f.icon} />
            </span>
            <h3 className="sf-h3">{f.title}</h3>
            {f.text && <p className="text-sm sf-muted">{f.text}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
