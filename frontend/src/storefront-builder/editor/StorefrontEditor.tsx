/**
 * Storefront builder editor (dashboard route /storefront/editor) — replaces the old
 * Pages screen. Three panes: sections / style / pages / menus · live preview ·
 * settings. On phones the panes become tabs. Lazy-loaded; shoppers never download it.
 */
import { Loader2, PanelLeft, Settings2, Smartphone } from 'lucide-react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Inspector } from './panels/Inspector';
import { LeftPanel } from './panels/LeftPanel';
import { SectionGallery } from './panels/SectionGallery';
import { TopBar } from './panels/TopBar';
import { PreviewFrame } from './preview/PreviewFrame';
import { useEditor } from './state/store';
import { useAutosave } from './state/useAutosave';
import { useEditorBoot } from './state/useEditorBoot';
import { useCurrentPageLoader } from './state/usePageLayout';
import { usePublish } from './state/usePublish';
import { ToastHost } from './ui/Toast';
import { TemplateWizard } from './wizard/TemplateWizard';

export default function StorefrontEditor() {
  const [params] = useSearchParams();
  const reset = useEditor(s => s.reset);
  const ready = useEditor(s => s.ready);

  // Fresh editor state on every visit.
  useEffect(() => { reset(); return () => reset(); }, [reset]);

  const { error, retry } = useEditorBoot(params.get('page') ?? 'home');
  const wizard = useEditor(s => !!s.wizard);

  if (error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-slate-50 p-6 text-center">
        <p className="text-lg font-semibold text-slate-900">The editor couldn’t load your store</p>
        <p className="max-w-md text-sm text-slate-600">Check your connection and try again. Nothing has been changed.</p>
        <button type="button" onClick={retry} className="theme-btn min-h-10 cursor-pointer rounded-xl px-5 text-sm font-semibold">Try again</button>
      </div>
    );
  }
  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50" role="status">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400 motion-reduce:animate-none" aria-hidden />
        <span className="sr-only">Loading the editor…</span>
      </div>
    );
  }
  // The template wizard takes the whole screen (pending edits are saved before it opens).
  if (wizard) return <><TemplateWizard /><ToastHost /></>;
  return <EditorLayout />;
}

function EditorLayout() {
  const [params, setParams] = useSearchParams();
  const currentPage = useEditor(s => s.currentPage);
  const mobilePane = useEditor(s => s.mobilePane);
  const setMobilePane = useEditor(s => s.setMobilePane);
  const select = useEditor(s => s.select);
  const { saveNow } = useAutosave();
  const { publish, publishing } = usePublish(saveNow);
  useCurrentPageLoader();

  // Keep ?page= in the URL so the editor can be deep-linked / reloaded on the same page.
  const urlPage = params.get('page');
  useEffect(() => {
    if (urlPage !== currentPage) setParams(p => { p.set('page', currentPage); return p; }, { replace: true });
  }, [currentPage, urlPage, setParams]);

  // Esc clears the selection (when no dialog is open).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !useEditor.getState().gallery && !document.querySelector('[role="dialog"]')) select(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [select]);

  const pane = (id: typeof mobilePane) => (mobilePane === id ? 'flex' : 'hidden');

  return (
    <div className="flex h-dvh flex-col overflow-clip bg-slate-50 text-slate-900">
      <TopBar onPublish={() => { void publish(); }} publishing={publishing} onRetry={() => { void saveNow(); }} onExit={async () => { await saveNow(); }} />
      <div className="flex min-h-0 flex-1">
        <aside aria-label="Sections and style" className={`${pane('left')} w-full shrink-0 flex-col border-r border-slate-200 bg-white lg:flex lg:w-[300px] xl:w-[320px]`}>
          <LeftPanel />
        </aside>
        <main aria-label="Live preview" className={`${pane('preview')} min-w-0 flex-1 lg:flex`}>
          <PreviewFrame />
        </main>
        <aside aria-label="Settings" className={`${pane('right')} w-full shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-white lg:flex lg:w-[340px]`}>
          <Inspector />
        </aside>
      </div>

      {/* Phones / small tablets: the three panes become tabs. */}
      <nav aria-label="Editor panes" className="grid shrink-0 grid-cols-3 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        {([
          { id: 'left', label: 'Sections', Icon: PanelLeft },
          { id: 'preview', label: 'Preview', Icon: Smartphone },
          { id: 'right', label: 'Settings', Icon: Settings2 },
        ] as const).map(({ id, label, Icon }) => (
          <button key={id} type="button" aria-current={mobilePane === id} onClick={() => setMobilePane(id)} className={`flex min-h-14 cursor-pointer flex-col items-center justify-center gap-0.5 text-xs font-medium ${mobilePane === id ? 'theme-text' : 'text-slate-500'}`}>
            <Icon className="h-5 w-5" aria-hidden /> {label}
          </button>
        ))}
      </nav>

      <SectionGallery />
      <ToastHost />
    </div>
  );
}
