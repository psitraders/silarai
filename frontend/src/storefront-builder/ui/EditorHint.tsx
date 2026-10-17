import type { RenderContext } from '../core/types';

/**
 * Empty-state shown only in the editor and dev gallery (design.md §13 rule 10):
 * shoppers never see an empty section, merchants always see what to fill in.
 */
export function EditorHint({ context, text, padded = true }: { context: RenderContext; text: string; padded?: boolean }) {
  if (context.mode === 'live') return null;
  return (
    <div className={padded ? 'sf-container py-10' : ''}>
      <div className="rounded-[var(--sf-radius-md)] border-2 border-dashed px-4 py-8 text-center text-sm sf-muted" style={{ borderColor: 'var(--sf-border)' }}>
        {text}
      </div>
    </div>
  );
}
