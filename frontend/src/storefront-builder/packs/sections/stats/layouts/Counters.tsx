import { blocksOf } from '../../../../core/blocks';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { SectionHeading } from '../../../../ui/SectionHeading';
import { STAT_DEFAULTS, type StatsSettings } from '../manifest';

export default function Counters({ settings, blocks, context }: LayoutProps<StatsSettings>) {
  const stats = blocksOf(blocks, 'stat', STAT_DEFAULTS);
  if (!stats.length) return <EditorHint context={context} text="Add numbers to this section." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} align="center" />
      <dl className="sf-gap grid grid-cols-2 text-center @3xl:grid-cols-4">
        {stats.map(({ id, settings: s }) => (
          <div key={id} className="flex flex-col-reverse gap-1">
            <dt className="text-sm sf-muted">{s.label}</dt>
            <dd className="sf-h1 tabular-nums" style={{ fontSize: 'clamp(2rem, 6cqi, 3.5rem)' }}>{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
