import { Plus } from 'lucide-react';
import { blocksOf } from '../../../core/blocks';
import type { BlockInstance } from '../../../core/types';
import { QUESTION_DEFAULTS } from './manifest';

/** Native <details> accordion: keyboard and screen-reader friendly with no script. */
export function Questions({ blocks }: { blocks: BlockInstance[] }) {
  const items = blocksOf(blocks, 'question', QUESTION_DEFAULTS).filter(q => q.settings.question.trim());
  return (
    <div className="flex flex-col gap-3">
      {items.map(({ id, settings: q }) => (
        <details key={id} className="sf-card group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 font-semibold [&::-webkit-details-marker]:hidden">
            {q.question}
            <Plus className="h-5 w-5 shrink-0 transition-transform duration-(--sf-motion-base) group-open:rotate-45" aria-hidden />
          </summary>
          <p className="whitespace-pre-line px-4 pb-4 text-sm sf-muted">{q.answer}</p>
        </details>
      ))}
    </div>
  );
}
