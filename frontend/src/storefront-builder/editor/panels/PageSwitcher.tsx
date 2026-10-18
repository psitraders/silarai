import { usePagesQuery } from '../state/useEditorBoot';
import { useEditor } from '../state/store';
import { INPUT } from '../ui/controls';
import { SYSTEM_PAGE_KEYS, SYSTEM_PAGES } from '../state/systemPages';

/** Which page is being edited: Home, the catalogue / product templates, or a custom page. */
export function PageSwitcher({ className = '' }: { className?: string }) {
  const current = useEditor(s => s.currentPage);
  const setCurrentPage = useEditor(s => s.setCurrentPage);
  const { data: pages = [] } = usePagesQuery();
  const custom = pages.filter(p => p.pageType === 'Custom');
  const designs = pages.filter(p => p.pageType === 'AltProductTemplate');
  return (
    <select aria-label="Page to edit" value={current} onChange={e => setCurrentPage(e.target.value)} className={`${INPUT} ${className}`}>
      <optgroup label="Store pages">
        {SYSTEM_PAGE_KEYS.map(k => <option key={k} value={k}>{SYSTEM_PAGES[k].title}</option>)}
      </optgroup>
      {designs.length > 0 && (
        <optgroup label="Other product designs">
          {designs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </optgroup>
      )}
      {custom.length > 0 && (
        <optgroup label="Your pages">
          {custom.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </optgroup>
      )}
    </select>
  );
}
