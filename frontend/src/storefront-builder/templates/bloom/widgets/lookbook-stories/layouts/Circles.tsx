import { useState } from 'react';
import { blocksOf } from '../../../../../core/blocks';
import { readImage } from '../../../../../core/smart';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { SectionHeading } from '../../../../../ui/SectionHeading';
import { SmartImage } from '../../../../../ui/SmartImage';
import { STORY_DEFAULTS, type LookbookSettings } from '../manifest';
import { StoryViewer } from '../StoryViewer';

/** Round story bubbles in a swipeable row; each opens full screen. */
export default function Circles({ settings, blocks, context }: LayoutProps<LookbookSettings>) {
  const stories = blocksOf(blocks, 'story', STORY_DEFAULTS).filter(s => readImage(s.settings.image));
  const [open, setOpen] = useState<number | null>(null);
  if (!stories.length) return <EditorHint context={context} text="Add stories with a photo and the products in each look." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} />
      <ul className="sf-scroll-x -mx-4 flex gap-4 px-4 pb-2">
        {stories.map((s, i) => (
          <li key={s.id} className="shrink-0">
            <button type="button" onClick={() => setOpen(i)} className="flex w-20 flex-col items-center gap-2 @3xl:w-24" aria-label={`Open story: ${s.settings.title}`}>
              <span className="block rounded-full p-0.5" style={{ border: '2px solid var(--sf-link)' }}>
                <SmartImage value={s.settings.image} alt="" rounded={false} className="h-[72px] w-[72px] rounded-full @3xl:h-[88px] @3xl:w-[88px]" sizes="96px" maxWidth={480} />
              </span>
              <span className="line-clamp-1 text-xs font-semibold">{s.settings.title}</span>
            </button>
          </li>
        ))}
      </ul>
      {open !== null && <StoryViewer stories={stories} index={open} onIndex={setOpen} onClose={() => setOpen(null)} context={context} />}
    </div>
  );
}
