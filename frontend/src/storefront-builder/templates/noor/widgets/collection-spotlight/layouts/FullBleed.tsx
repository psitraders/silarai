import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { SmartImage } from '../../../../../ui/SmartImage';
import { SmartLinkAnchor } from '../../../../../ui/SmartLinkAnchor';
import type { CollectionSpotlightSettings } from '../manifest';
import { useSpotlight } from '../useSpotlight';

/** Photo across the page with a dark gradient and a fine accent rule. */
export default function FullBleed({ settings, context }: LayoutProps<CollectionSpotlightSettings>) {
  const s = useSpotlight(settings);
  if (s.isLoading) return <div className="sf-skeleton h-96" aria-hidden />;
  if (!s.heading) return <EditorHint context={context} text="Pick a collection (category) or add a heading for this spotlight." />;
  const H = context.isFirst ? 'h1' : 'h2';
  return (
    <div className={`relative isolate flex overflow-hidden ${settings.height === 'regular' ? 'min-h-[420px] @3xl:min-h-[540px]' : 'min-h-[520px] @3xl:min-h-[680px]'}`}>
      {s.image && (
        <SmartImage value={s.image} alt="" eager={context.isFirst} rounded={false} fill className="-z-10" />
      )}
      <div aria-hidden className="absolute inset-0 -z-10" style={{ background: s.image ? 'linear-gradient(to top, rgb(0 0 0 / 0.72), rgb(0 0 0 / 0.2) 60%, rgb(0 0 0 / 0.05))' : 'var(--sf-bg)' }} />
      <div className={`sf-container flex w-full flex-col justify-end gap-4 py-14 @4xl:py-20 ${s.image ? 'text-white' : ''}`}>
        {settings.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.3em] opacity-90">{settings.eyebrow}</p>}
        <span aria-hidden className="block h-px w-20" style={{ background: 'var(--sf-badge)' }} />
        <H className="sf-h1 max-w-3xl" style={{ textWrap: 'balance' }}>{s.heading}</H>
        {settings.text && <p className="max-w-xl text-base opacity-90 @3xl:text-lg">{settings.text}</p>}
        {settings.buttonLabel && (
          <div className="pt-2">
            <SmartLinkAnchor href={s.href} className="sf-btn sf-btn-primary sf-btn-lg">{settings.buttonLabel}</SmartLinkAnchor>
          </div>
        )}
      </div>
    </div>
  );
}
