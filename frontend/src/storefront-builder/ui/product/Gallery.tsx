import { ChevronLeft, ChevronRight, Expand, ShoppingBag } from 'lucide-react';
import { useRef, useState, type CSSProperties } from 'react';
import { optimizeImage } from '../../../utils/imageUrl';
import { useProductCtl } from '../../core/commerce/useProductController';
import { Overlay } from '../Overlay';
import { isVideoUrl } from './blockTypes';

export type GalleryMode =
  | 'slider' | 'thumbs-left' | 'stacked' | 'grid' | 'bento' | 'carousel' | 'single' | 'fill' | 'round' | 'grid-2x2';
export type ImageRatio = 'square' | 'portrait' | 'landscape' | 'natural';

const RATIO: Record<ImageRatio, string> = { square: 'aspect-square', portrait: 'aspect-[4/5]', landscape: 'aspect-[4/3]', natural: 'aspect-[4/5]' };

function Media({ src, alt, width, eager, className = '', fit = 'cover', style }: {
  src: string; alt: string; width: number; eager?: boolean; className?: string; fit?: 'cover' | 'contain'; style?: CSSProperties;
}) {
  const cls = `h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`;
  if (isVideoUrl(src)) {
    return <video src={src} className={cls} style={style} controls muted playsInline preload="metadata" aria-label={alt} />;
  }
  return <img src={optimizeImage(src, width)} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" className={cls} style={style} />;
}

function Empty({ className = '' }: { className?: string }) {
  return (
    <div className={`sf-placeholder flex items-center justify-center ${className}`} aria-hidden>
      <ShoppingBag className="h-14 w-14 sf-muted opacity-30" />
    </div>
  );
}

/**
 * Product images in one of the gallery modes the product layouts use. Swipe and
 * arrow buttons on every slider; tapping an image opens a full-screen viewer.
 * Wide-screen modes (grid, stacked, bento, thumbs-left) fall back to a slider in
 * narrow containers.
 */
export function ProductGallery({ mode = 'slider', ratio = 'portrait', eager = false, className = '', badge = false, zoom = true, videoFirst = false }: {
  mode?: GalleryMode;
  ratio?: ImageRatio;
  eager?: boolean;
  className?: string;
  /** Sale badge on the first image (off by default — the Badges block shows it). */
  badge?: boolean;
  /** Tap to open the full-screen viewer. */
  zoom?: boolean;
  /** Put merchant video clips before the photos. */
  videoFirst?: boolean;
}) {
  const ctl = useProductCtl();
  const images = videoFirst ? [...ctl.images].sort((a, b) => Number(isVideoUrl(b)) - Number(isVideoUrl(a))) : ctl.images;
  const [viewer, setViewer] = useState<number | null>(null);
  const title = ctl.product.title;
  const aspect = RATIO[ratio];
  const fit = ratio === 'natural' ? 'contain' : 'cover';
  const open = zoom ? (i: number) => setViewer(i) : undefined;

  const saleBadge = badge && ctl.discountPercent > 0 && (
    <span className="sf-badge pointer-events-none absolute left-3 top-3 z-10">-{ctl.discountPercent}%</span>
  );

  if (!images.length) {
    return <div className={`relative ${className}`}>{saleBadge}<Empty className={mode === 'fill' ? 'h-full min-h-80' : mode === 'round' ? 'aspect-square rounded-full' : `${aspect} sf-img`} /></div>;
  }

  const slider = (opts: { thumbs?: 'below' | 'left' | 'none'; peek?: boolean; fill?: boolean; dots?: boolean }) => (
    <Slider images={images} title={title} aspect={opts.fill ? 'h-full' : aspect} fit={fit} eager={eager} onOpen={open} {...opts} />
  );

  let body;
  switch (mode) {
    case 'thumbs-left':
      body = slider({ thumbs: 'left' });
      break;
    case 'stacked':
    case 'grid':
    case 'bento': {
      const wide = (
        <div className={mode === 'stacked' ? 'flex flex-col gap-3' : mode === 'grid' ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-2 gap-3'}>
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => open?.(i)}
              className={`sf-img relative block overflow-hidden ${mode === 'bento' && i === 0 ? 'col-span-2' : ''} ${mode === 'grid' && images.length % 2 === 1 && i === images.length - 1 ? 'col-span-2' : ''}`}
              aria-label={`Enlarge image ${i + 1} of ${title}`}
            >
              <div className={mode === 'bento' && i === 0 ? 'aspect-[4/3]' : aspect}>
                <Media src={src} alt={i === 0 ? title : ''} width={i === 0 || mode === 'stacked' ? 1200 : 700} eager={eager && i < 2} fit={fit} className="sf-zoom" />
              </div>
            </button>
          ))}
        </div>
      );
      body = (
        <>
          <div className="@3xl:hidden">{slider({ thumbs: 'none', dots: true })}</div>
          <div className="hidden @3xl:block">{wide}</div>
        </>
      );
      break;
    }
    case 'carousel':
      body = slider({ thumbs: 'none', peek: true });
      break;
    case 'single':
      body = slider({ thumbs: 'none', dots: true });
      break;
    case 'fill':
      body = slider({ thumbs: 'none', dots: true, fill: true });
      break;
    case 'round':
      body = (
        <button type="button" onClick={() => open?.(0)} className="mx-auto block aspect-square w-full max-w-sm overflow-hidden rounded-full" aria-label={`Enlarge image of ${title}`}>
          <Media src={images[0]} alt={title} width={700} eager={eager} />
        </button>
      );
      break;
    case 'grid-2x2':
      body = images.length < 3 ? slider({ thumbs: 'none', dots: true }) : (
        <div className="grid grid-cols-2 gap-1.5">
          {images.slice(0, 4).map((src, i) => (
            <button key={src + i} type="button" onClick={() => open?.(i)} className="relative block aspect-square overflow-hidden" aria-label={`Enlarge image ${i + 1} of ${title}`}>
              <Media src={src} alt={i === 0 ? title : ''} width={500} eager={eager && i === 0} className="sf-zoom" />
              {i === 3 && images.length > 4 && (
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white" style={{ background: 'rgb(0 0 0 / 0.45)' }}>+{images.length - 4}</span>
              )}
            </button>
          ))}
        </div>
      );
      break;
    default:
      body = slider({ thumbs: images.length > 1 ? 'below' : 'none' });
  }

  return (
    <div className={`relative ${mode === 'fill' ? 'h-full' : ''} ${className}`}>
      {saleBadge}
      {body}
      {viewer != null && <Viewer images={images} start={viewer} title={title} onClose={() => setViewer(null)} />}
    </div>
  );
}

function Slider({ images, title, aspect, fit, eager, onOpen, thumbs = 'below', peek = false, fill = false, dots = false }: {
  images: string[]; title: string; aspect: string; fit: 'cover' | 'contain'; eager: boolean;
  onOpen?: (i: number) => void; thumbs?: 'below' | 'left' | 'none'; peek?: boolean; fill?: boolean; dots?: boolean;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const many = images.length > 1;

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    const next = Math.max(0, Math.min(images.length - 1, i));
    const child = el.children[next] as HTMLElement | undefined;
    if (child) el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  };
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const child = el.children[0] as HTMLElement | undefined;
    const step = child ? child.offsetWidth + 12 * (peek ? 1 : 0) : el.clientWidth;
    setIndex(Math.max(0, Math.min(images.length - 1, Math.round(el.scrollLeft / Math.max(1, step)))));
  };

  const thumbStrip = many && thumbs !== 'none' && (
    <ul
      className={thumbs === 'left'
        ? 'flex gap-2 overflow-x-auto pt-3 @3xl:order-first @3xl:max-h-[560px] @3xl:w-20 @3xl:shrink-0 @3xl:flex-col @3xl:overflow-y-auto @3xl:pr-3 @3xl:pt-0'
        : 'flex gap-2 overflow-x-auto pt-3'}
      aria-label="Product images"
    >
      {images.map((src, i) => (
        <li key={src + i} className="shrink-0">
          <button
            type="button"
            onClick={() => go(i)}
            aria-label={`Show image ${i + 1}`}
            aria-current={i === index}
            className="block h-16 w-16 overflow-hidden rounded-[var(--sf-radius-sm)] transition-opacity"
            style={{ outline: i === index ? '2px solid var(--sf-text)' : '1px solid var(--sf-border)', outlineOffset: i === index ? 2 : 0, opacity: i === index ? 1 : 0.65 }}
          >
            {isVideoUrl(src) ? <span className="flex h-full w-full items-center justify-center text-[10px] font-bold sf-placeholder">Video</span> : <img src={optimizeImage(src, 160)} alt="" loading="lazy" className="h-full w-full object-cover" />}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`${thumbs === 'left' ? 'flex flex-col @3xl:flex-row' : ''} ${fill ? 'h-full' : ''}`}>
      <div className={`relative min-w-0 flex-1 ${fill ? 'h-full' : ''}`}>
        <ul
          ref={track}
          onScroll={onScroll}
          className={`sf-scroll-x flex snap-x snap-mandatory overflow-x-auto ${peek ? 'gap-3' : ''} ${fill ? 'h-full' : ''} ${fill || peek ? '' : 'sf-img'}`}
          aria-label={`${title} images`}
        >
          {images.map((src, i) => (
            <li key={src + i} className={`relative shrink-0 snap-start ${peek ? 'w-[82%] @3xl:w-[62%]' : 'w-full'} ${fill ? 'h-full' : ''}`}>
              <button type="button" onClick={() => onOpen?.(i)} className={`block w-full overflow-hidden ${fill ? 'h-full min-h-80' : aspect} ${peek ? 'sf-img' : ''}`} aria-label={`Enlarge image ${i + 1} of ${title}`} tabIndex={onOpen ? 0 : -1}>
                <Media src={src} alt={i === 0 ? title : ''} width={1200} eager={eager && i === 0} fit={fit} />
              </button>
            </li>
          ))}
        </ul>
        {many && (
          <>
            <button type="button" onClick={() => go(index - 1)} disabled={index === 0} className="sf-icon-btn absolute left-2 top-1/2 z-10 -translate-y-1/2 shadow-md disabled:opacity-0" style={{ background: 'color-mix(in srgb, var(--sf-surface) 90%, transparent)' }} aria-label="Previous image">
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" onClick={() => go(index + 1)} disabled={index === images.length - 1} className="sf-icon-btn absolute right-2 top-1/2 z-10 -translate-y-1/2 shadow-md disabled:opacity-0" style={{ background: 'color-mix(in srgb, var(--sf-surface) 90%, transparent)' }} aria-label="Next image">
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </>
        )}
        {many && (dots || thumbs === 'none') && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5" aria-hidden>
            {images.map((_, i) => (
              <span key={i} className="h-1.5 rounded-full transition-all" style={{ width: i === index ? 18 : 6, background: i === index ? 'var(--sf-surface)' : 'color-mix(in srgb, var(--sf-surface) 55%, transparent)', boxShadow: '0 0 0 1px rgb(0 0 0 / 0.12)' }} />
            ))}
          </div>
        )}
        {onOpen && (
          <span className="pointer-events-none absolute bottom-3 right-3 z-10 hidden rounded-full p-1.5 @md:block" style={{ background: 'color-mix(in srgb, var(--sf-surface) 85%, transparent)' }} aria-hidden>
            <Expand className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      {thumbStrip}
    </div>
  );
}

/** Full-screen image viewer (Esc / ← → / swipe). */
function Viewer({ images, start, title, onClose }: { images: string[]; start: number; title: string; onClose: () => void }) {
  const [i, setI] = useState(start);
  const prev = () => setI(x => (x - 1 + images.length) % images.length);
  const next = () => setI(x => (x + 1) % images.length);
  const touch = useRef<number | null>(null);
  return (
    <Overlay onClose={onClose} label={`${title} — image ${i + 1} of ${images.length}`} variant="full" className="items-center justify-center" style={{ background: 'var(--sf-surface)' }}>
      <div
        className="flex h-full w-full items-center justify-center p-4 pt-14"
        onKeyDown={e => { if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); }}
        onTouchStart={e => { touch.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          if (touch.current == null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 40) { if (dx < 0) next(); else prev(); }
          touch.current = null;
        }}
      >
        <Media src={images[i]} alt={title} width={1800} fit="contain" className="max-h-full" />
      </div>
      {images.length > 1 && (
        <>
          <button type="button" data-autofocus onClick={prev} className="sf-icon-btn absolute left-3 top-1/2 -translate-y-1/2 shadow-md" style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)' }} aria-label="Previous image">
            <ChevronLeft className="h-6 w-6" aria-hidden />
          </button>
          <button type="button" onClick={next} className="sf-icon-btn absolute right-3 top-1/2 -translate-y-1/2 shadow-md" style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)' }} aria-label="Next image">
            <ChevronRight className="h-6 w-6" aria-hidden />
          </button>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-semibold tabular-nums sf-muted" aria-live="polite">{i + 1} / {images.length}</p>
        </>
      )}
    </Overlay>
  );
}
