import { ArrowLeft, Copy, Eye, EyeOff, MousePointerClick, Trash2, X } from 'lucide-react';
import { blockSettings } from '../../core/blocks';
import type { SchemeId, Visibility } from '../../core/types';
import { SchemaForm } from '../fields/SchemaForm';
import { settingsFor, useInstance, writeSetting } from '../state/instance';
import { useEditor, type Selection } from '../state/store';
import { IconButton, Segmented } from '../ui/controls';
import { blockSummary } from '../state/blockSummary';
import { BlocksEditor } from './BlocksEditor';
import { LayoutPicker } from './LayoutPicker';
import { SchemePicker } from './SchemePicker';

/** Right panel: settings of the selected header, footer, section or item. */
export function Inspector() {
  const selection = useEditor(s => s.selection);
  if (!selection) return <NothingSelected />;
  return selection.blockId ? <BlockInspector selection={selection} /> : <InstanceInspector selection={selection} />;
}

function NothingSelected() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <span className="theme-bg theme-text inline-flex h-12 w-12 items-center justify-center rounded-full"><MousePointerClick className="h-6 w-6" aria-hidden /></span>
      <p className="text-sm font-semibold text-slate-900">Select something to edit</p>
      <p className="text-sm text-slate-600">Click any part of the preview — or a row in the Sections list — to change its layout, colours and content.</p>
    </div>
  );
}

function PanelHeader({ title, subtitle, onBack, onClose }: { title: string; subtitle?: string; onBack?: () => void; onClose?: () => void }) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-100 bg-white px-3 py-3">
      {onBack && <IconButton label="Back" onClick={onBack}><ArrowLeft className="h-4 w-4" aria-hidden /></IconButton>}
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
      </div>
      {onClose && <IconButton label="Close" onClick={onClose}><X className="h-4 w-4" aria-hidden /></IconButton>}
    </div>
  );
}

function InstanceInspector({ selection }: { selection: Selection }) {
  const { target } = selection;
  const { instance, manifest } = useInstance(target);
  const { select, updateInstance, duplicateSection, removeSection } = useEditor.getState();
  if (!instance || !manifest) {
    return <div className="p-6 text-sm text-slate-600">This item no longer exists. <button type="button" className="theme-text cursor-pointer font-medium underline" onClick={() => select(null)}>Close</button></div>;
  }
  const values = settingsFor(manifest, instance);
  const layoutId = instance.layout && manifest.layouts[instance.layout] ? instance.layout : manifest.defaultLayout;
  const isSection = target.kind === 'section';

  return (
    <div>
      <PanelHeader
        title={manifest.name}
        subtitle={target.kind === 'section' ? manifest.description : `${manifest.description ?? ''}`}
        onClose={() => select(null)}
      />
      <div className="space-y-5 px-4 py-4">
        <LayoutPicker target={target} manifest={manifest} current={layoutId} />
        <SchemePicker value={instance.scheme ?? 'light'} onChange={(scheme: SchemeId) => updateInstance(target, i => { i.scheme = scheme; })} />
        {isSection && (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Show on</p>
            <Segmented<Visibility>
              label="Show on"
              value={instance.visibility ?? 'all'}
              options={[{ value: 'all', label: 'All devices' }, { value: 'desktop', label: 'Desktop' }, { value: 'mobile', label: 'Mobile' }]}
              onChange={v => updateInstance(target, i => { i.visibility = v === 'all' ? undefined : v; })}
              size="sm"
            />
          </div>
        )}
      </div>
      {manifest.fields.length > 0 && (
        <div className="border-t border-slate-100">
          <SchemaForm grouped scope={`${target.kind}:${instance.id}`} fields={manifest.fields} values={{ ...values, $layout: instance.layout ?? manifest.defaultLayout }} onChange={(k, v) => writeSetting(target, manifest, k, v)} />
        </div>
      )}
      {manifest.blocks && (
        <div className="border-t border-slate-100 px-4 py-4">
          <BlocksEditor target={target} manifest={manifest} instance={instance} />
        </div>
      )}
      {isSection && (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-4">
          <button type="button" onClick={() => duplicateSection(target.id)} className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Copy className="h-4 w-4" aria-hidden /> Duplicate
          </button>
          <button type="button" onClick={() => updateInstance(target, i => { i.hidden = !i.hidden || undefined; })} className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
            {instance.hidden ? <><Eye className="h-4 w-4" aria-hidden /> Show</> : <><EyeOff className="h-4 w-4" aria-hidden /> Hide</>}
          </button>
          <button type="button" onClick={() => removeSection(target.id)} className="ml-auto inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" aria-hidden /> Remove section
          </button>
        </div>
      )}
    </div>
  );
}

function BlockInspector({ selection }: { selection: Selection }) {
  const { target, blockId } = selection;
  const { instance, manifest } = useInstance(target);
  const { select, updateInstance } = useEditor.getState();
  const block = instance?.blocks?.find(b => b.id === blockId);
  const def = block && manifest?.blocks?.types.find(t => t.type === block.type);
  if (!instance || !manifest || !block || !def) return <InstanceInspector selection={{ target }} />;
  const values = blockSettings(def.defaults, block);

  return (
    <div>
      <PanelHeader title={blockSummary(def, block.settings)} subtitle={`${def.name} in ${manifest.name}`} onBack={() => select({ target })} />
      <div className="px-4 py-4">
        <SchemaForm
          scope={`block:${block.id}`}
          fields={def.fields}
          values={values}
          onChange={(k, v) => updateInstance(target, inst => {
            const b = inst.blocks?.find(x => x.id === block.id);
            if (b) b.settings = { ...(b.settings ?? {}), [k]: v };
          })}
        />
      </div>
    </div>
  );
}
