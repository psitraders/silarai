import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { StoreIcon } from '../../../../ui/icons';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { FeaturesSettings } from '../manifest';
import { useFeatures } from '../useFeatures';

export default function List({ settings, blocks, context }: LayoutProps<FeaturesSettings>) {
  const items = useFeatures(blocks);
  if (!items.length) return <EditorHint context={context} text="Add features to this section." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} align={settings.align} />
      <ul className="grid gap-x-12 gap-y-7 @3xl:grid-cols-2">
        {items.map(({ id, settings: f }) => (
          <li key={id} className="flex gap-4">
            <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full sf-link" style={{ background: 'color-mix(in srgb, var(--sf-link) 12%, transparent)' }}>
              <StoreIcon name={f.icon} className="h-5 w-5" />
            </span>
            <div>
              <h3 className="sf-h3">{f.title}</h3>
              {f.text && <p className="mt-1 text-sm sf-muted">{f.text}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
