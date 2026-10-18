import { ArrowDown, ArrowUp, Eye, EyeOff, PanelBottom, PanelTop, Plus, Sparkles } from 'lucide-react';
import { editorPacks } from '../packs';
import { sameTarget, useCurrentLayout, useEditor, type Target } from '../state/store';
import { IconButton } from '../ui/controls';
import { SortableList } from '../ui/SortableList';
import { PageSwitcher } from './PageSwitcher';

/** The page outline: header · sections (drag or ↑/↓) · footer, plus "Add section". */
export function OutlinePanel() {
  const layout = useCurrentLayout();
  const selection = useEditor(s => s.selection);
  const site = useEditor(s => s.site);
  const { select, moveSection, updateInstance, openGallery, openAi } = useEditor.getState();
  const isSel = (t: Target) => sameTarget(selection?.target, t);
  const rowCls = (active: boolean) => `flex items-center gap-0.5 rounded-xl border py-1 pr-1 transition-colors ${active ? 'theme-border theme-bg border-2' : 'border-slate-200 bg-white hover:border-slate-300'}`;
  const layoutName = (kind: 'header' | 'footer' | 'section', type: string, layoutId?: string) => {
    const m = editorPacks.get(kind, type);
    return m?.layouts[layoutId ?? m.defaultLayout]?.name ?? m?.layouts[m.defaultLayout]?.name ?? '';
  };

  return (
    <div className="space-y-4 p-4">
      <PageSwitcher />

      {site && (
        <button type="button" onClick={() => select({ target: { kind: 'header' } }, { scroll: true })} className={`${rowCls(isSel({ kind: 'header' }))} w-full cursor-pointer pl-3 text-left`}>
          <PanelTop className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <span className="ml-2 min-w-0 flex-1 py-1.5">
            <span className="block text-sm font-medium text-slate-900">Header</span>
            <span className="block truncate text-xs text-slate-500">{layoutName('header', site.header.type, site.header.layout)} · on every page</span>
          </span>
        </button>
      )}

      <div>
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Sections</p>
        {!layout ? (
          <div className="space-y-1">{[0, 1, 2].map(i => <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />)}</div>
        ) : layout.sections.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">No sections yet. Add any section, in any order.</p>
        ) : (
          <SortableList
            items={layout.sections}
            label="Sections"
            onMove={moveSection}
            renderItem={(section, i, handle) => {
              const target: Target = { kind: 'section', id: section.id };
              const m = editorPacks.get('section', section.type);
              return (
                <div className={rowCls(isSel(target))}>
                  {handle}
                  <button type="button" onClick={() => select({ target }, { scroll: true })} className="min-w-0 flex-1 cursor-pointer py-1 text-left">
                    <span className={`block truncate text-sm font-medium ${section.hidden ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{m?.name ?? `Unknown: ${section.type}`}</span>
                    <span className="block truncate text-xs text-slate-500">{layoutName('section', section.type, section.layout)}{section.visibility && section.visibility !== 'all' ? ` · ${section.visibility} only` : ''}</span>
                  </button>
                  <IconButton label={section.hidden ? 'Show section' : 'Hide section'} onClick={() => updateInstance(target, s => { s.hidden = !s.hidden || undefined; })}>
                    {section.hidden ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                  </IconButton>
                  <IconButton label="Move up" disabled={i === 0} onClick={() => moveSection(section.id, i - 1)}><ArrowUp className="h-4 w-4" aria-hidden /></IconButton>
                  <IconButton label="Move down" disabled={i === layout.sections.length - 1} onClick={() => moveSection(section.id, i + 1)}><ArrowDown className="h-4 w-4" aria-hidden /></IconButton>
                  <IconButton label="Add section below" onClick={() => openGallery(i + 1)}><Plus className="h-4 w-4" aria-hidden /></IconButton>
                </div>
              );
            }}
          />
        )}
        <button type="button" disabled={!layout} onClick={() => openGallery()} className="theme-btn mt-3 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold disabled:opacity-50">
          <Plus className="h-4 w-4" aria-hidden /> Add section
        </button>
        <button type="button" disabled={!layout} onClick={() => openAi('sections')} className="mt-2 inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          <Sparkles className="h-4 w-4" aria-hidden /> Add sections with AI
        </button>
      </div>

      {site && (
        <button type="button" onClick={() => select({ target: { kind: 'footer' } }, { scroll: true })} className={`${rowCls(isSel({ kind: 'footer' }))} w-full cursor-pointer pl-3 text-left`}>
          <PanelBottom className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <span className="ml-2 min-w-0 flex-1 py-1.5">
            <span className="block text-sm font-medium text-slate-900">Footer</span>
            <span className="block truncate text-xs text-slate-500">{layoutName('footer', site.footer.type, site.footer.layout)} · on every page</span>
          </span>
        </button>
      )}
    </div>
  );
}
