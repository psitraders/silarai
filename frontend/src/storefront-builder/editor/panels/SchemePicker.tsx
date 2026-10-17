import { useMemo } from 'react';
import { resolveTheme } from '../../core/theme/buildTheme';
import { buildSchemes } from '../../core/theme/schemes';
import { SCHEME_IDS, type SchemeId } from '../../core/types';
import { useEditor } from '../state/store';
import { SCHEME_NAMES } from './schemeNames';

/** The palette's 5 colour schemes as real swatches (bg · text · button). */
export function SchemePicker({ value, onChange }: { value: SchemeId; onChange: (s: SchemeId) => void }) {
  const theme = useEditor(s => s.site?.theme);
  const schemes = useMemo(() => buildSchemes(resolveTheme(theme).palette), [theme]);
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">Colour scheme</p>
      <div role="radiogroup" aria-label="Colour scheme" className="grid grid-cols-5 gap-2">
        {SCHEME_IDS.map(id => {
          const s = schemes[id];
          const active = id === value;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              title={SCHEME_NAMES[id]}
              onClick={() => onChange(id)}
              className="group flex cursor-pointer flex-col items-center gap-1 focus-visible:outline-none"
            >
              <span
                className={`flex h-11 w-full flex-col items-center justify-center gap-1 rounded-lg ring-offset-2 transition-shadow group-focus-visible:ring-2 group-focus-visible:ring-[var(--rc-primary)] ${active ? 'ring-2 ring-[var(--rc-primary)]' : 'ring-1 ring-slate-200'}`}
                style={{ background: s.bg, color: s.text }}
              >
                <span className="text-xs font-bold leading-none">Aa</span>
                <span className="h-1.5 w-5 rounded-full" style={{ background: s.button }} />
              </span>
              <span className={`text-[11px] ${active ? 'theme-text font-semibold' : 'text-slate-500'}`}>{SCHEME_NAMES[id]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
