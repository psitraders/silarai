import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { StoreIcon } from '../../../../ui/icons';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { FeaturesSettings } from '../manifest';
import { useFeatures } from '../useFeatures';

export default function Cards({ settings, blocks, context }: LayoutProps<FeaturesSettings>) {
  const items = useFeatures(blocks);
  if (!items.length) return <EditorHint context={context} text="Add features to this section." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} align={settings.align} />
      <ul className="sf-gap grid grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-4">
        {items.map(({ id, settings: f }) => (
          <li key={id} className="sf-card sf-card-hover flex flex-col gap-3 p-6">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--sf-radius-md)]" style={{ background: 'var(--sf-button)', color: 'var(--sf-on-button)' }}>
              <StoreIcon name={f.icon} className="h-5 w-5" />
            </span>
            <h3 className="sf-h3">{f.title}</h3>
            {f.text && <p className="text-sm sf-muted">{f.text}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
