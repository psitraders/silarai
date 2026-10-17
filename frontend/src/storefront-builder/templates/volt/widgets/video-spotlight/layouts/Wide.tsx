import { useShell } from '../../../../../core/shell-context';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { Price } from '../../../../../ui/Price';
import type { VideoSpotlightSettings } from '../manifest';
import { Player } from '../Player';
import { useSpotlightProduct } from '../useSpotlightProduct';

/** The product video across the page, with the name, price and button below it. */
export default function Wide({ settings, context }: LayoutProps<VideoSpotlightSettings>) {
  const { openProduct } = useShell();
  const s = useSpotlightProduct(settings);
  if (s.isLoading) return <div className="sf-container sf-section-pad" aria-hidden><div className="sf-skeleton aspect-video" /></div>;
  if (!s.product) return <EditorHint context={context} text="Pick a product that has a video (.mp4 or .webm uploaded among its photos)." />;
  const title = settings.heading.trim() || s.product.title;
  return (
    <div className="sf-container sf-section-pad">
      {!s.video && <EditorHint context={context} padded={false} text="This product has no video yet — showing its photo. Upload an .mp4 among its photos to play it here." />}
      <Player video={s.video} poster={s.poster} title={s.product.title} className="mt-4 aspect-video rounded-[var(--sf-img-radius)]" />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          {settings.eyebrow && <p className="sf-eyebrow mb-1">{settings.eyebrow}</p>}
          <h2 className="sf-h2">{title}</h2>
          {settings.text && <p className="mt-2 max-w-2xl sf-muted">{settings.text}</p>}
        </div>
        <div className="flex items-center gap-4">
          <Price product={s.product} size="lg" />
          <button type="button" className="sf-btn sf-btn-primary" onClick={() => openProduct(s.product!)}>{settings.buttonLabel || 'View product'}</button>
        </div>
      </div>
    </div>
  );
}
