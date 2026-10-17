import { Search } from 'lucide-react';
import { useId } from 'react';
import type { HeaderState } from './useHeader';
import { useSearchSubmit } from './useHeader';

/** Inline search field (search-first layout, "always-visible bar" option). */
export function SearchField({ className = '', autoFocus = false, onDone }: { className?: string; autoFocus?: boolean; onDone?: () => void }) {
  const id = useId();
  const { term, setTerm, submit } = useSearchSubmit(onDone);
  return (
    <form role="search" onSubmit={submit} className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">Search products</label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 sf-muted" aria-hidden />
      <input
        id={id}
        type="search"
        autoFocus={autoFocus}
        value={term}
        onChange={e => setTerm(e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape') onDone?.(); }}
        placeholder="Search products…"
        className="sf-input" style={{ paddingLeft: "2.25rem" }}
        enterKeyHint="search"
      />
    </form>
  );
}

/** Drop-down search row under the bar (opened by the search icon). */
export function SearchPanel({ state }: { state: HeaderState }) {
  if (!state.searchOpen) return null;
  return (
    <div className="sf-slide-down" style={{ borderTop: '1px solid var(--sf-border)' }}>
      <div className="sf-container py-3">
        <SearchField autoFocus onDone={() => state.setSearchOpen(false)} />
      </div>
    </div>
  );
}
