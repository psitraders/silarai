import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { blocksOf } from '../../../core/blocks';
import { readImage } from '../../../core/smart';
import type { BlockInstance, RenderContext } from '../../../core/types';
import { CtaLink } from '../../../ui/CtaLink';
import { EditorHint } from '../../../ui/EditorHint';
import { SmartImage } from '../../../ui/SmartImage';
import { SLIDE_DEFAULTS, type SlideshowSettings } from './manifest';

const HEIGHT = { compact: 'min-h-[320px] @3xl:min-h-[400px]', regular: 'min-h-[420px] @3xl:min-h-[540px]', tall: 'min-h-[520px] @3xl:min-h-[680px]' } as const;

/**
 * Accessible slideshow: visible prev/next + dots, pause button, pauses on hover/focus,
 * no auto-play under reduced motion (design.md §10, §13 rule 13).
 */
export function Slides({ settings, blocks, context, contained }: { settings: SlideshowSettings; blocks: BlockInstance[]; context: RenderContext; contained: boolean }) {
  const slides = blocksOf(blocks, 'slide', SLIDE_DEFAULTS);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const count = slides.length;
  const reduced = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const auto = settings.autoplay && !reduced && count > 1 && context.mode === 'live';

  useEffect(() => {
    if (!auto || paused || hovered) return;
    const t = setInterval(() => setIndex(i => (i + 1) % count), Math.max(3, Number(settings.interval) || 6) * 1000);
    return () => clearInterval(t);
  }, [auto, paused, hovered, count, settings.interval]);

  if (!count) return <EditorHint context={context} text="Add slides to this slideshow." />;
  const current = index % count;
  const go = (d: number) => setIndex((current + d + count) % count);

  return (
    <div
      ref={root}
      className={`relative overflow-hidden ${contained ? 'rounded-[var(--sf-radius-lg)]' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={e => { if (!root.current?.contains(e.relatedTarget as Node)) setHovered(false); }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Slideshow"
    >
      <div className="flex transition-transform duration-500 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${current * 100}%)` }}>
        {slides.map(({ id, settings: s }, i) => {
          const hasImage = !!readImage(s.image);
          const Heading = context.isFirst && i === 0 ? 'h1' : 'h2';
          return (
            <div key={id} className={`relative isolate flex w-full shrink-0 items-center ${HEIGHT[settings.height] ?? HEIGHT.regular}`} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${count}`} aria-hidden={i !== current} inert={i !== current}>
              <SmartImage value={s.image} alt="" eager={context.isFirst && i === 0} rounded={false} fill className="-z-10" />
              {hasImage && <div aria-hidden className="absolute inset-0 -z-10" style={{ background: s.align === 'center' ? 'rgb(0 0 0 / 0.45)' : 'linear-gradient(to right, rgb(0 0 0 / 0.65), rgb(0 0 0 / 0.1))' }} />}
              <div className={`sf-container flex flex-col gap-4 py-14 ${s.align === 'center' ? 'items-center text-center' : ''} ${hasImage ? 'text-white' : ''}`}>
                {s.eyebrow && <p className="sf-eyebrow" style={{ color: 'inherit', opacity: 0.85 }}>{s.eyebrow}</p>}
                <Heading className="sf-h1 max-w-2xl">{s.heading}</Heading>
                {s.text && <p className="max-w-lg opacity-85">{s.text}</p>}
                <div><CtaLink label={s.buttonLabel} link={s.buttonLink} /></div>
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} className="sf-icon-btn absolute left-3 top-1/2 hidden -translate-y-1/2 @3xl:inline-flex" style={{ background: 'color-mix(in srgb, var(--sf-surface) 85%, transparent)', color: 'var(--sf-text)' }} aria-label="Previous slide">
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button type="button" onClick={() => go(1)} className="sf-icon-btn absolute right-3 top-1/2 hidden -translate-y-1/2 @3xl:inline-flex" style={{ background: 'color-mix(in srgb, var(--sf-surface) 85%, transparent)', color: 'var(--sf-text)' }} aria-label="Next slide">
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-3 py-1.5" style={{ background: 'color-mix(in srgb, var(--sf-surface) 80%, transparent)', color: 'var(--sf-text)' }}>
            {slides.map(({ id }, i) => (
              <button key={id} type="button" onClick={() => setIndex(i)} aria-label={`Go to slide ${i + 1}`} aria-current={i === current} className="flex h-6 w-6 items-center justify-center">
                <span className="block h-2 rounded-full transition-all duration-(--sf-motion-base)" style={{ width: i === current ? 18 : 8, background: i === current ? 'var(--sf-button)' : 'color-mix(in srgb, var(--sf-text) 35%, transparent)' }} />
              </button>
            ))}
            {auto && (
              <button type="button" onClick={() => setPaused(p => !p)} className="ml-1 flex h-6 w-6 items-center justify-center" aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}>
                {paused ? <Play className="h-3.5 w-3.5" aria-hidden /> : <Pause className="h-3.5 w-3.5" aria-hidden />}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
