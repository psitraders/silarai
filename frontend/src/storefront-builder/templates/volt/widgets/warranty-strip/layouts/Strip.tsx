import { blocksOf } from '../../../../../core/blocks';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { StoreIcon } from '../../../../../ui/icons';
import { ASSURANCE_DEFAULTS, type WarrantyStripSettings } from '../manifest';

/** Icons with a title and a detail line, in one band (2 columns on phones). */
export default function Strip({ settings, blocks, context }: LayoutProps<WarrantyStripSettings>) {
  const items = blocksOf(blocks, 'item', ASSURANCE_DEFAULTS).filter(b => b.settings.title.trim());
  if (!items.length) return <EditorHint context={context} text="Add your warranty, payment and support details." />;
  return (
    <div className="sf-container py-8">
      {settings.heading && <h2 className="sf-h3 mb-5 text-center">{settings.heading}</h2>}
      <ul className="grid grid-cols-2 gap-6 @3xl:grid-cols-4">
        {items.map(({ id, settings: b }) => (
          <li key={id} className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--sf-radius-md)]" style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)' }}>
              <StoreIcon name={b.icon} className="h-5 w-5 sf-link" />
            </span>
            <span>
              <span className="block text-sm font-semibold">{b.title}</span>
              {b.detail && <span className="block text-xs sf-muted">{b.detail}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
