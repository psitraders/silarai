import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { SmartImage } from '../../../../../ui/SmartImage';
import { SmartLinkAnchor } from '../../../../../ui/SmartLinkAnchor';
import type { CollectionSpotlightSettings } from '../manifest';
import { useSpotlight } from '../useSpotlight';

/** A framed portrait photo beside the collection's story — gallery-like, lots of space. */
export default function Framed({ settings, context }: LayoutProps<CollectionSpotlightSettings>) {
  const s = useSpotlight(settings);
  if (s.isLoading) return <div className="sf-container sf-section-pad" aria-hidden><div className="sf-skeleton h-96" /></div>;
  if (!s.heading) return <EditorHint context={context} text="Pick a collection (category) or add a heading for this spotlight." />;
  const H = context.isFirst ? 'h1' : 'h2';
  return (
    <div className="sf-container sf-section-pad">
      <div className="grid items-center gap-10 @3xl:grid-cols-2 @5xl:gap-20">
        <div className="relative mx-auto w-full max-w-md p-3" style={{ border: '1px solid var(--sf-border)' }}>
          <SmartImage value={s.image ?? { $image: '' }} alt={s.heading} eager={context.isFirst} className="aspect-[4/5]" sizes="(min-width: 768px) 40vw, 90vw" />
        </div>
        <div className="flex flex-col gap-4">
          {settings.eyebrow && <p className="sf-eyebrow">{settings.eyebrow}</p>}
          <span aria-hidden className="block h-px w-20" style={{ background: 'var(--sf-badge)' }} />
          <H className="sf-h1" style={{ textWrap: 'balance' }}>{s.heading}</H>
          {settings.text && <p className="sf-muted max-w-prose text-base @3xl:text-lg">{settings.text}</p>}
          {settings.buttonLabel && (
            <div className="pt-2">
              <SmartLinkAnchor href={s.href} className="sf-btn sf-btn-secondary">{settings.buttonLabel}</SmartLinkAnchor>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
