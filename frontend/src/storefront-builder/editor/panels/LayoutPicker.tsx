import { Lock } from 'lucide-react';
import { canUse } from '../../core/canUse';
import type { EditorPack } from '../../core/types';
import { useEditor, type Target } from '../state/store';
import { Thumb } from '../ui/Thumb';

/** Layout thumbnails; hovering / focusing one previews it live ("try-on"), clicking applies it. */
export function LayoutPicker({ target, manifest, current }: { target: Target; manifest: EditorPack; current: string }) {
  const setTryOn = useEditor(s => s.setTryOn);
  const updateInstance = useEditor(s => s.updateInstance);
  const layouts = Object.entries(manifest.layouts);
  if (layouts.length < 2) return null;
  const allowed = canUse(manifest);
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">Layout <span className="font-normal text-slate-500">· {layouts.length} options — hover to preview</span></p>
      <div role="radiogroup" aria-label="Layout" className="grid grid-cols-2 gap-2" onMouseLeave={() => setTryOn(null)}>
        {layouts.map(([id, def]) => {
          const active = id === current;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={!allowed}
              onMouseEnter={() => !active && setTryOn({ target, layout: id })}
              onFocus={() => !active && setTryOn({ target, layout: id })}
              onBlur={() => setTryOn(null)}
              onClick={() => { setTryOn(null); updateInstance(target, inst => { inst.layout = id; }); }}
              className={`group cursor-pointer overflow-hidden rounded-xl border bg-white text-left transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rc-primary)] ${active ? 'theme-border border-2 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}
            >
              <Thumb rects={def.thumb} />
              <span className="flex items-center gap-1 border-t border-slate-100 px-2 py-1.5">
                <span className={`truncate text-xs font-medium ${active ? 'theme-text' : 'text-slate-700'}`}>{def.name}</span>
                {!allowed && <Lock className="h-3 w-3 text-slate-400" aria-label="Premium" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
