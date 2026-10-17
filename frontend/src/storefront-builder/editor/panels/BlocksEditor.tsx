import { ArrowDown, ArrowUp, ChevronRight, Copy, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { BlockDef, EditorPack, SectionInstance } from '../../core/types';
import { blockSummary } from '../state/blockSummary';
import { newId } from '../state/ids';
import { useEditor, type Target } from '../state/store';
import { IconButton } from '../ui/controls';
import { SortableList } from '../ui/SortableList';

/** Repeatable items inside a section: add, reorder (drag or ↑/↓), duplicate, remove, edit. */
export function BlocksEditor({ target, manifest, instance }: { target: Target; manifest: EditorPack; instance: SectionInstance }) {
  const spec = manifest.blocks!;
  const blocks = instance.blocks ?? [];
  const { select, addBlock, moveBlock, removeBlock, duplicateBlock } = useEditor.getState();
  const [chooser, setChooser] = useState(false);
  const full = spec.max !== undefined && blocks.length >= spec.max;
  const atMin = spec.min !== undefined && blocks.length <= spec.min;
  const defOf = (type: string) => spec.types.find(t => t.type === type);

  const add = (def: BlockDef) => {
    addBlock(target, { id: newId(def.type), type: def.type, settings: structuredClone(def.defaults) });
    setChooser(false);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">{spec.label} <span className="font-normal text-slate-500">· {blocks.length}{spec.max ? ` of ${spec.max}` : ''}</span></p>
      </div>
      {blocks.length > 0 && (
        <SortableList
          items={blocks}
          label={spec.label}
          onMove={(id, to) => moveBlock(target, id, to)}
          renderItem={(block, i, handle) => (
            <div className="flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white py-1 pr-1">
              {handle}
              <button type="button" onClick={() => select({ target, blockId: block.id })} className="flex min-h-8 min-w-0 flex-1 cursor-pointer items-center gap-1 text-left text-sm text-slate-800 hover:text-slate-950">
                <span className="truncate">{blockSummary(defOf(block.type), block.settings)}</span>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              </button>
              <IconButton label="Move up" disabled={i === 0} onClick={() => moveBlock(target, block.id, i - 1)}><ArrowUp className="h-4 w-4" aria-hidden /></IconButton>
              <IconButton label="Move down" disabled={i === blocks.length - 1} onClick={() => moveBlock(target, block.id, i + 1)}><ArrowDown className="h-4 w-4" aria-hidden /></IconButton>
              <IconButton label="Duplicate" disabled={full} onClick={() => duplicateBlock(target, block.id)}><Copy className="h-4 w-4" aria-hidden /></IconButton>
              <IconButton label="Remove" tone="danger" disabled={atMin} onClick={() => removeBlock(target, block.id)}><Trash2 className="h-4 w-4" aria-hidden /></IconButton>
            </div>
          )}
        />
      )}
      {!full && (
        spec.types.length === 1 ? (
          <button type="button" onClick={() => add(spec.types[0])} className="mt-2 inline-flex min-h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 text-sm font-medium theme-text hover:bg-slate-50">
            <Plus className="h-4 w-4" aria-hidden /> Add {spec.types[0].name.toLowerCase()}
          </button>
        ) : (
          <div className="mt-2">
            <button type="button" aria-expanded={chooser} onClick={() => setChooser(c => !c)} className="inline-flex min-h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 text-sm font-medium theme-text hover:bg-slate-50">
              <Plus className="h-4 w-4" aria-hidden /> Add item
            </button>
            {chooser && (
              <ul className="mt-1 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                {spec.types.map(t => (
                  <li key={t.type}><button type="button" onClick={() => add(t)} className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50">{t.name}</button></li>
                ))}
              </ul>
            )}
          </div>
        )
      )}
    </div>
  );
}
