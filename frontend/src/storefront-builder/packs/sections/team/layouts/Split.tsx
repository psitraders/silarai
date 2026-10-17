import { Quote } from 'lucide-react';
import { blocksOf } from '../../../../core/blocks';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { SmartImage } from '../../../../ui/SmartImage';
import { MEMBER_DEFAULTS, type TeamSettings } from '../manifest';

/** The founder's photo beside their story; anyone else listed underneath. */
export default function Split({ settings, blocks, context }: LayoutProps<TeamSettings>) {
  const [founder, ...rest] = blocksOf(blocks, 'member', MEMBER_DEFAULTS);
  if (!founder) return <EditorHint context={context} text="Add the founder (and anyone else) to this section." />;
  const f = founder.settings;
  return (
    <div className="sf-container sf-section-pad">
      <div className="grid items-center gap-10 @3xl:grid-cols-[5fr_6fr] @3xl:gap-16">
        <SmartImage value={f.photo} alt={f.name} className="aspect-[4/5]" sizes="(min-width: 768px) 45vw, 100vw" maxWidth={1200} eager={context.isFirst} />
        <div>
          {settings.eyebrow && <p className="sf-eyebrow mb-3">{settings.eyebrow}</p>}
          {settings.heading && <h2 className="sf-h2 mb-5">{settings.heading}</h2>}
          {f.bio && (
            <blockquote className="relative">
              <Quote className="mb-3 h-8 w-8 sf-link opacity-60" aria-hidden />
              <p className="whitespace-pre-line text-lg leading-relaxed">{f.bio}</p>
            </blockquote>
          )}
          <p className="mt-6 font-bold">{f.name}</p>
          {f.role && <p className="text-sm sf-muted">{f.role}</p>}
          {rest.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-5 pt-6" style={{ borderTop: '1px solid var(--sf-border)' }}>
              {rest.map(({ id, settings: p }) => (
                <li key={id} className="flex items-center gap-3">
                  <SmartImage value={p.photo} alt={p.name} className="h-12 w-12 shrink-0 rounded-full" rounded={false} maxWidth={480} />
                  <span><span className="block text-sm font-semibold">{p.name}</span><span className="block text-xs sf-muted">{p.role}</span></span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
