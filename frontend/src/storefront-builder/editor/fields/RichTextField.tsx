import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, RemoveFormatting } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { sanitizeHtml } from '../../core/sanitize';
import { readRichText } from '../../core/smart';
import type { SmartRichText } from '../../core/types';
import { FieldLabel, INPUT } from '../ui/controls';

type ToolId = 'bold' | 'italic' | 'h2' | 'h3' | 'ul' | 'ol' | 'link' | 'clear';

const TOOLS: { id: ToolId; label: string; Icon: typeof Bold }[] = [
  { id: 'bold', label: 'Bold', Icon: Bold },
  { id: 'italic', label: 'Italic', Icon: Italic },
  { id: 'h2', label: 'Heading', Icon: Heading2 },
  { id: 'h3', label: 'Subheading', Icon: Heading3 },
  { id: 'ul', label: 'Bulleted list', Icon: List },
  { id: 'ol', label: 'Numbered list', Icon: ListOrdered },
  { id: 'link', label: 'Link', Icon: Link2 },
  { id: 'clear', label: 'Clear formatting', Icon: RemoveFormatting },
];

/**
 * Small built-in formatter (bold, italic, headings, lists, links) — TipTap is not
 * added (plan D6). Output is sanitised again by the server on save.
 */
export function RichTextField({ label, helper, value, onChange }: { label: string; helper?: string; value: unknown; onChange: (v: SmartRichText) => void }) {
  const id = useId();
  const editor = useRef<HTMLDivElement>(null);
  const lastEmitted = useRef<string | null>(null);
  const savedRange = useRef<Range | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const html = readRichText(value);

  // Load external values (selecting another section, presets) — never our own typing.
  useEffect(() => {
    if (html === lastEmitted.current) return;
    let alive = true;
    sanitizeHtml(html).then(clean => {
      if (alive && editor.current) { editor.current.innerHTML = clean; lastEmitted.current = html; }
    });
    return () => { alive = false; };
  }, [html]);

  const emit = () => {
    const next = editor.current?.innerHTML ?? '';
    const normalised = next === '<br>' ? '' : next;
    lastEmitted.current = normalised;
    onChange({ $richtext: normalised });
  };

  const exec = (command: string, arg?: string) => {
    editor.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  const runTool = (tool: ToolId) => {
    switch (tool) {
      case 'bold': exec('bold'); break;
      case 'italic': exec('italic'); break;
      case 'h2': exec('formatBlock', 'h2'); break;
      case 'h3': exec('formatBlock', 'h3'); break;
      case 'ul': exec('insertUnorderedList'); break;
      case 'ol': exec('insertOrderedList'); break;
      case 'clear': exec('removeFormat'); exec('formatBlock', 'p'); break;
      case 'link': {
        const sel = document.getSelection();
        savedRange.current = sel && sel.rangeCount && editor.current?.contains(sel.anchorNode) ? sel.getRangeAt(0).cloneRange() : null;
        setLinkUrl('https://');
        setLinkOpen(true);
        break;
      }
    }
  };

  return (
    <div>
      <FieldLabel htmlFor={id} helper={helper}>{label}</FieldLabel>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-[var(--rc-primary)]">
        <div className="flex flex-wrap gap-0.5 border-b border-slate-100 bg-slate-50 p-1" role="toolbar" aria-label={`${label} formatting`}>
          {TOOLS.map(({ id: tool, label: l, Icon }) => (
            <button key={tool} type="button" title={l} aria-label={l} onMouseDown={e => e.preventDefault()} onClick={() => runTool(tool)} className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-slate-600 hover:bg-white hover:text-slate-900">
              <Icon className="h-4 w-4" aria-hidden />
            </button>
          ))}
        </div>
        {linkOpen && (
          <form
            className="flex gap-2 border-b border-slate-100 p-2"
            onSubmit={e => {
              e.preventDefault();
              const range = savedRange.current;
              if (range) { const sel = document.getSelection(); sel?.removeAllRanges(); sel?.addRange(range); }
              if (linkUrl.trim() && linkUrl.trim() !== 'https://') exec('createLink', linkUrl.trim());
              setLinkOpen(false);
            }}
          >
            <input autoFocus aria-label="Link address" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://… or /products" className={INPUT} />
            <button type="submit" className="theme-btn min-h-9 shrink-0 cursor-pointer rounded-lg px-3 text-sm font-medium">Add link</button>
            <button type="button" onClick={() => setLinkOpen(false)} className="min-h-9 shrink-0 cursor-pointer rounded-lg px-2 text-sm text-slate-600 hover:bg-slate-100">Cancel</button>
          </form>
        )}
        <div
          id={id}
          ref={editor}
          role="textbox"
          aria-multiline="true"
          aria-label={label}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          className="prose-sm max-h-80 min-h-28 overflow-y-auto px-3 py-2 text-sm text-slate-900 outline-none [&_a]:text-[var(--rc-primary)] [&_a]:underline [&_h2]:text-lg [&_h2]:font-bold [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5"
        />
      </div>
    </div>
  );
}
