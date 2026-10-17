import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCategories } from '../../../../core/data/hooks';
import type { LayoutProps } from '../../../../core/types';
import type { HeroSettings } from '../manifest';
import { HERO_HEIGHT } from '../heights';
import { HeroActions, HeroHighlights, HeroText } from '../parts';
import { useHeroText } from '../useHeroText';

/** Gradient hero with a rotating category chip — the Starter look. */
export default function Centered({ settings, context }: LayoutProps<HeroSettings>) {
  const { heading, subheading } = useHeroText(settings);
  const { data: categories = [] } = useCategories();
  const tags = categories.length ? categories.map(c => c.name) : ['New arrivals', 'Best sellers', 'Handpicked'];
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setTick(i => i + 1), 3000);
    return () => clearInterval(t);
  }, []);
  const tag = settings.eyebrow || tags[tick % tags.length];

  return (
    <div
      className="relative overflow-hidden sf-textured"
      style={{ background: 'linear-gradient(150deg, var(--sf-gradient-to) 0%, var(--sf-bg) 55%, color-mix(in srgb, var(--sf-bg) 45%, #000) 100%)' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full opacity-25"
        style={{ background: 'radial-gradient(circle, var(--sf-badge), transparent 70%)' }}
      />
      <div className={`sf-container relative flex flex-col items-center justify-center gap-6 py-16 text-center ${HERO_HEIGHT[settings.height] ?? HERO_HEIGHT.regular}`}>
        <p
          key={tag}
          className="sf-reveal inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
          style={{ background: 'color-mix(in srgb, currentColor 12%, transparent)', border: '1px solid color-mix(in srgb, currentColor 25%, transparent)' }}
          aria-live="off"
        >
          <Sparkles className="h-3 w-3" aria-hidden /> {tag}
        </p>
        <HeroText settings={{ ...settings, eyebrow: '' }} heading={heading} subheading={subheading} isFirst={context.isFirst} align="center" />
        <HeroActions settings={settings} />
        {settings.showHighlights && <HeroHighlights />}
      </div>
    </div>
  );
}
