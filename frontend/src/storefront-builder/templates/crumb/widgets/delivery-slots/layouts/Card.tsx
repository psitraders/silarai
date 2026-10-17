import { Clock, MapPin } from 'lucide-react';
import { blocksOf } from '../../../../../core/blocks';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { SLOT_DEFAULTS, type DeliverySlotsSettings } from '../manifest';

/** Slots as chips and the delivery areas, in one card. */
export default function Card({ settings, blocks, context }: LayoutProps<DeliverySlotsSettings>) {
  const slots = blocksOf(blocks, 'slot', SLOT_DEFAULTS).filter(s => s.settings.label.trim());
  if (!slots.length && !settings.areas.trim()) return <EditorHint context={context} text="Add your delivery slots and the areas you deliver to." />;
  return (
    <div className="sf-container sf-section-pad">
      <div className="sf-card mx-auto max-w-3xl p-6 @3xl:p-8">
        {settings.eyebrow && <p className="sf-eyebrow mb-2">{settings.eyebrow}</p>}
        <h2 className="sf-h2">{settings.heading}</h2>
        {slots.length > 0 && (
          <ul className="mt-5 grid gap-3 @xl:grid-cols-2">
            {slots.map(({ id, settings: s }) => (
              <li key={id} className="flex items-center gap-3 rounded-[var(--sf-radius-md)] p-3" style={{ background: 'var(--sf-bg)', border: '1px solid var(--sf-border)' }}>
                <Clock className="h-5 w-5 shrink-0 sf-link" aria-hidden />
                <span><span className="block text-sm font-semibold">{s.label}</span><span className="block text-sm sf-muted">{s.time}</span></span>
              </li>
            ))}
          </ul>
        )}
        {settings.areas.trim() && (
          <p className="mt-5 flex gap-3 text-sm"><MapPin className="h-5 w-5 shrink-0 sf-link" aria-hidden /><span><span className="font-semibold">We deliver to: </span>{settings.areas}</span></p>
        )}
        {settings.note && <p className="mt-3 text-sm sf-muted">{settings.note}</p>}
      </div>
    </div>
  );
}
