import { useState } from 'react';
import { blocksOf } from '../../../../../core/blocks';
import { readImage } from '../../../../../core/smart';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { SectionHeading } from '../../../../../ui/SectionHeading';
import { SmartImage } from '../../../../../ui/SmartImage';
import { STORY_DEFAULTS, type LookbookSettings } from '../manifest';
import { StoryViewer } from '../StoryViewer';

/** Tall story cards in a swipeable row; each opens full screen. */
export default function Cards({ settings, blocks, context }: LayoutProps<LookbookSettings>) {
  const stories = blocksOf(blocks, 'story', STORY_DEFAULTS).filter(s => readImage(s.settings.image));
  const [open, setOpen] = useState<number | null>(null);
  if (!stories.length) return <EditorHint context={context} text="Add stories with a photo and the products in each look." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} />
      <ul className="sf-scroll-x -mx-4 flex snap-x gap-3 px-4 pb-2">
        {stories.map((s, i) => (
          <li key={s.id} className="w-[42%] shrink-0 snap-start @2xl:w-[28%] @5xl:w-[19%]">
            <button type="button" onClick={() => setOpen(i)} className="relative block w-full overflow-hidden text-left" aria-label={`Open story: ${s.settings.title}`}>
              <SmartImage value={s.settings.image} alt="" className="aspect-[9/16]" sizes="(min-width: 1024px) 20vw, 45vw" />
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: 'linear-gradient(to top, rgb(0 0 0 / 0.6), transparent)' }} />
              <span className="absolute inset-x-3 bottom-3 line-clamp-2 text-sm font-bold text-white">{s.settings.title}</span>
            </button>
          </li>
        ))}
      </ul>
      {open !== null && <StoryViewer stories={stories} index={open} onIndex={setOpen} onClose={() => setOpen(null)} context={context} />}
    </div>
  );
}
