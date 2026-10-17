import { blocksOf } from '../../../../../core/blocks';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { SectionHeading } from '../../../../../ui/SectionHeading';
import { ComboCard } from '../ComboCard';
import { COMBO_DEFAULTS, type ComboPacksSettings } from '../manifest';

/** One card per combo, with its items, live total and "Add all". */
export default function Cards({ settings, blocks, context }: LayoutProps<ComboPacksSettings>) {
  const combos = blocksOf(blocks, 'combo', COMBO_DEFAULTS);
  if (!combos.length) return <EditorHint context={context} text="Add combos and pick the products in each." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} />
      <ul className="sf-gap grid @2xl:grid-cols-2 @5xl:grid-cols-3">
        {combos.map(({ id, settings: combo }) => <li key={id}><ComboCard combo={combo} context={context} /></li>)}
      </ul>
    </div>
  );
}
