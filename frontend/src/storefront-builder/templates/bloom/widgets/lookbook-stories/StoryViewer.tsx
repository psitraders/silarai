import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useResolvedProducts } from '../../../../core/data/hooks';
import type { RenderContext } from '../../../../core/types';
import { Overlay } from '../../../../ui/Overlay';
import { ProductCard } from '../../../../ui/ProductCard';
import { SmartImage } from '../../../../ui/SmartImage';
import type { StoryBlock } from './manifest';

/** Full-screen story: photo, progress, previous / next (buttons and arrow keys) and the look's products. No auto-advance. */
export function StoryViewer({ stories, index, onIndex, onClose, context }: {
  stories: { id: string; settings: StoryBlock }[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  context: RenderContext;
}) {
  const story = stories[index].settings;
  const { items } = useResolvedProducts(story.products);
  const go = (d: number) => onIndex(Math.min(Math.max(index + d, 0), stories.length - 1));

  return (
    <Overlay onClose={onClose} label={story.title || 'Story'} variant="full">
      {/* Arrow keys move between stories (focus stays inside the dialog). */}
      <div
        className="mx-auto flex h-full w-full max-w-md flex-col gap-3 overflow-y-auto p-3 pt-14"
        onKeyDown={e => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); }}
      >
        <div className="flex gap-1" aria-hidden>
          {stories.map((s, i) => <span key={s.id} className="h-1 flex-1 rounded-full" style={{ background: i <= index ? 'var(--sf-text)' : 'var(--sf-border)' }} />)}
        </div>
        <div className="relative">
          <SmartImage value={story.image} alt={story.title} eager className="aspect-[9/16] max-h-[60dvh] w-full" sizes="448px" />
          <button type="button" onClick={() => go(-1)} disabled={index === 0} aria-label="Previous story" className="sf-icon-btn absolute left-2 top-1/2 -translate-y-1/2 shadow-md disabled:opacity-0" style={{ background: 'var(--sf-surface)' }}><ChevronLeft className="h-5 w-5" aria-hidden /></button>
          <button type="button" onClick={() => go(1)} disabled={index === stories.length - 1} aria-label="Next story" className="sf-icon-btn absolute right-2 top-1/2 -translate-y-1/2 shadow-md disabled:opacity-0" style={{ background: 'var(--sf-surface)' }}><ChevronRight className="h-5 w-5" aria-hidden /></button>
        </div>
        <p className="font-bold" aria-live="polite">{story.title} <span className="text-xs font-normal sf-muted">· {index + 1} of {stories.length}</span></p>
        {items.length > 0 && (
          <ul className="grid grid-cols-2 gap-3" aria-label="Shop this look">
            {items.map(p => <li key={p.id}><ProductCard product={p} index={-1} context={context} cardStyle="compact" /></li>)}
          </ul>
        )}
      </div>
    </Overlay>
  );
}
