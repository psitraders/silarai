import { blocksOf } from '../../../../../core/blocks';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { StoreIcon } from '../../../../../ui/icons';
import { CERTIFICATION_DEFAULTS, type CertificationSettings } from '../manifest';

/** One card per certification or guarantee. */
export default function Cards({ settings, blocks, context }: LayoutProps<CertificationSettings>) {
  const items = blocksOf(blocks, 'badge', CERTIFICATION_DEFAULTS).filter(b => b.settings.title.trim());
  if (!items.length) return <EditorHint context={context} text="Add the certifications and guarantees you offer." />;
  return (
    <div className="sf-container sf-section-pad">
      {settings.heading && <h2 className="sf-h2 mb-6 text-center">{settings.heading}</h2>}
      <ul className="sf-gap grid grid-cols-2 @4xl:grid-cols-4">
        {items.map(({ id, settings: b }) => (
          <li key={id} className="sf-card flex flex-col items-center gap-2 p-5 text-center">
            <StoreIcon name={b.icon} className="h-8 w-8 sf-link" />
            <span className="text-sm font-semibold">{b.title}</span>
            {b.detail && <span className="text-xs sf-muted">{b.detail}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
