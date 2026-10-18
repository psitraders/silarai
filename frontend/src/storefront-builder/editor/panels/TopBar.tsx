import { AlertCircle, ArrowLeft, Check, ExternalLink, History, Link2, Loader2, Monitor, Redo2, Smartphone, Tablet, Undo2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sidePanelOpen, useEditor, type Device } from '../state/store';
import { Segmented } from '../ui/controls';
import { PageSwitcher } from './PageSwitcher';
import { PreviewLinkDialog } from './PreviewLinkDialog';

function SaveStatus({ onRetry }: { onRetry: () => void }) {
  const state = useEditor(s => s.saveState);
  const error = useEditor(s => s.saveError);
  if (state === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600" role="status">
        <AlertCircle className="h-4 w-4" aria-hidden />
        <span className="hidden max-w-56 truncate xl:inline" title={error}>Not saved: {error}</span>
        <span className="xl:hidden">Not saved</span>
        <button type="button" onClick={onRetry} className="cursor-pointer rounded-md px-1.5 py-0.5 underline hover:bg-red-50">Retry</button>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500" role="status" aria-live="polite">
      {state === 'saving' || state === 'dirty' ? <><Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden /> Saving…</> : <><Check className="h-3.5 w-3.5 text-green-600" aria-hidden /> Saved</>}
    </span>
  );
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? '⌘' : 'Ctrl+';

/** Undo / redo for this editing session, plus the version history drawer. */
function HistoryButtons() {
  const canUndo = useEditor(s => s.past.length > 0 && !sidePanelOpen(s));
  const canRedo = useEditor(s => s.future.length > 0 && !sidePanelOpen(s));
  const historyOpen = useEditor(s => s.historyOpen);
  const { undo, redo, setHistoryOpen } = useEditor.getState();
  const btn = 'inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30';
  return (
    <div className="flex items-center">
      <button type="button" onClick={undo} disabled={!canUndo} aria-label="Undo" title={`Undo (${MOD}Z)`} className={btn}><Undo2 className="h-4 w-4" aria-hidden /></button>
      <button type="button" onClick={redo} disabled={!canRedo} aria-label="Redo" title={`Redo (${isMac ? '⇧⌘Z' : 'Ctrl+Y'})`} className={`${btn} max-sm:hidden`}><Redo2 className="h-4 w-4" aria-hidden /></button>
      <button type="button" onClick={() => setHistoryOpen(!historyOpen)} aria-pressed={historyOpen} aria-label="Version history" title="Version history" className={`${btn} ${historyOpen ? 'theme-nav-active' : ''}`}><History className="h-4 w-4" aria-hidden /></button>
    </div>
  );
}

export function TopBar({ onPublish, publishing, onRetry, onExit }: { onPublish: () => void; publishing: boolean; onRetry: () => void; onExit: () => Promise<void> }) {
  const device = useEditor(s => s.device);
  const setDevice = useEditor(s => s.setDevice);
  const slug = useEditor(s => s.slug);
  const store = useEditor(s => s.store);
  const navigate = useNavigate();
  const panelOpen = useEditor(sidePanelOpen);
  const [sharing, setSharing] = useState(false);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-2 sm:px-3">
      <button type="button" onClick={() => { void onExit().then(() => navigate('/storefront')); }} className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl px-2 text-sm font-medium text-slate-600 hover:bg-slate-100" aria-label="Exit the editor">
        <ArrowLeft className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Exit</span>
      </button>
      <div className="hidden min-w-0 border-l border-slate-200 pl-3 md:block">
        <p className="truncate text-sm font-semibold text-slate-900">{store?.name ?? 'Your store'}</p>
        <p className="text-[11px] text-slate-500">Customise store</p>
      </div>
      <div className="ml-2 hidden w-56 lg:block"><PageSwitcher /></div>
      <div className="mx-auto hidden w-56 md:block">
        <Segmented<Device>
          label="Preview size"
          size="sm"
          value={device}
          onChange={setDevice}
          options={[
            { value: 'desktop', label: <Monitor className="h-4 w-4" aria-hidden />, title: 'Desktop' },
            { value: 'tablet', label: <Tablet className="h-4 w-4" aria-hidden />, title: 'Tablet' },
            { value: 'mobile', label: <Smartphone className="h-4 w-4" aria-hidden />, title: 'Phone' },
          ]}
        />
      </div>
      <div className="ml-auto flex items-center gap-2 md:ml-0">
        <HistoryButtons />
        <SaveStatus onRetry={onRetry} />
        <a href={`/${slug}`} target="_blank" rel="noopener noreferrer" className="hidden min-h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:inline-flex" title="Opens the published store in a new tab">
          <ExternalLink className="h-4 w-4" aria-hidden /> View store
        </a>
        <button type="button" onClick={() => setSharing(true)} aria-label="Share a preview" title="Share a preview of your unpublished changes" className="hidden min-h-10 cursor-pointer items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:inline-flex">
          <Link2 className="h-4 w-4" aria-hidden /> <span className="hidden xl:inline">Share preview</span>
        </button>
        <button type="button" onClick={onPublish} disabled={publishing || panelOpen} title={panelOpen ? 'Close the side panel to publish' : undefined} className="theme-btn inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm disabled:opacity-60">
          {publishing && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />} Publish
        </button>
      </div>
      {sharing && <PreviewLinkDialog onClose={() => setSharing(false)} />}
    </header>
  );
}
