import { blocksOf } from '../../../../../core/blocks';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { StoreIcon } from '../../../../../ui/icons';
import { CERTIFICATION_DEFAULTS, type CertificationSettings } from '../manifest';

/** One quiet band of badges separated by fine rules. */
export default function Strip({ settings, blocks, context }: LayoutProps<CertificationSettings>) {
  const items = blocksOf(blocks, 'badge', CERTIFICATION_DEFAULTS).filter(b => b.settings.title.trim());
  if (!items.length) return <EditorHint context={context} text="Add the certifications and guarantees you offer." />;
  return (
    <div className="sf-container py-8">
      {settings.heading && <h2 className="sf-eyebrow mb-5 text-center">{settings.heading}</h2>}
      <ul className="grid grid-cols-2 gap-x-6 gap-y-6 @3xl:flex @3xl:flex-wrap @3xl:justify-center @3xl:gap-0">
        {items.map(({ id, settings: b }, i) => (
          <li key={id} className="flex items-center gap-3 @3xl:px-8" style={i > 0 ? { borderLeft: '1px solid var(--sf-border)' } : undefined}>
            <StoreIcon name={b.icon} className="h-7 w-7 shrink-0 sf-link" />
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
