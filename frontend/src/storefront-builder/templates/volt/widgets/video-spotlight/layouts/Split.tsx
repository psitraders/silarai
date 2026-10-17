import { useShell } from '../../../../../core/shell-context';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { Price } from '../../../../../ui/Price';
import type { VideoSpotlightSettings } from '../manifest';
import { Player } from '../Player';
import { useSpotlightProduct } from '../useSpotlightProduct';

/** The product video beside its name, text, live price and a button. */
export default function Split({ settings, context }: LayoutProps<VideoSpotlightSettings>) {
  const { openProduct } = useShell();
  const s = useSpotlightProduct(settings);
  if (s.isLoading) return <div className="sf-container sf-section-pad" aria-hidden><div className="sf-skeleton aspect-video" /></div>;
  if (!s.product) return <EditorHint context={context} text="Pick a product that has a video (.mp4 or .webm uploaded among its photos)." />;
  const title = settings.heading.trim() || s.product.title;
  return (
    <div className="sf-container sf-section-pad">
      {!s.video && <EditorHint context={context} padded={false} text="This product has no video yet — showing its photo. Upload an .mp4 among its photos to play it here." />}
      <div className="mt-4 grid items-center gap-8 @3xl:grid-cols-[1.4fr_1fr]">
        <Player video={s.video} poster={s.poster} title={s.product.title} className="aspect-video rounded-[var(--sf-img-radius)]" />
        <div className="flex flex-col gap-3">
          {settings.eyebrow && <p className="sf-eyebrow">{settings.eyebrow}</p>}
          <h2 className="sf-h2">{title}</h2>
          {settings.text && <p className="sf-muted">{settings.text}</p>}
          <Price product={s.product} size="lg" />
          <div><button type="button" className="sf-btn sf-btn-primary" onClick={() => openProduct(s.product!)}>{settings.buttonLabel || 'View product'}</button></div>
        </div>
      </div>
    </div>
  );
}
