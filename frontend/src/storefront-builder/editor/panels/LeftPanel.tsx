import { FileText, LayoutList, Menu, Palette } from 'lucide-react';
import { useEditor, type LeftTab } from '../state/store';
import { MenusPanel } from './MenusPanel';
import { OutlinePanel } from './OutlinePanel';
import { PagesPanel } from './PagesPanel';
import { ThemePanel } from './ThemePanel';

const TABS: { id: LeftTab; label: string; Icon: typeof LayoutList }[] = [
  { id: 'sections', label: 'Sections', Icon: LayoutList },
  { id: 'theme', label: 'Style', Icon: Palette },
  { id: 'pages', label: 'Pages', Icon: FileText },
  { id: 'menus', label: 'Menus', Icon: Menu },
];

export function LeftPanel() {
  const tab = useEditor(s => s.leftTab);
  const setTab = useEditor(s => s.setLeftTab);
  return (
    <div className="flex h-full flex-col">
      <div role="tablist" aria-label="Editor panels" className="grid shrink-0 grid-cols-4 border-b border-slate-200">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`sb-tab-${id}`}
            aria-selected={tab === id}
            aria-controls="sb-left-panel"
            onClick={() => setTab(id)}
            className={`flex min-h-14 cursor-pointer flex-col items-center justify-center gap-0.5 border-b-2 text-xs font-medium transition-colors ${tab === id ? 'theme-text border-[var(--rc-primary)]' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
          >
            <Icon className="h-5 w-5" aria-hidden /> {label}
          </button>
        ))}
      </div>
      <div id="sb-left-panel" role="tabpanel" aria-labelledby={`sb-tab-${tab}`} className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'sections' && <OutlinePanel />}
        {tab === 'theme' && <ThemePanel />}
        {tab === 'pages' && <PagesPanel />}
        {tab === 'menus' && <MenusPanel />}
      </div>
    </div>
  );
}
