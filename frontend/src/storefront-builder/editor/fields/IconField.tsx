import { useId } from 'react';
import { ICONS } from '../../ui/iconSet';
import { FieldLabel } from '../ui/controls';

export function IconField({ label, value, onChange }: { label: string; value: unknown; onChange: (v: string) => void }) {
  const id = useId();
  const current = typeof value === 'string' ? value : '';
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div id={id} role="radiogroup" aria-label={label} className="grid grid-cols-8 gap-1">
        {Object.entries(ICONS).map(([key, { label: name, Icon }]) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={current === key}
            aria-label={name}
            title={name}
            onClick={() => onChange(key)}
            className={`flex aspect-square cursor-pointer items-center justify-center rounded-lg border transition-colors ${current === key ? 'theme-border theme-bg theme-text border-2' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </button>
        ))}
      </div>
    </div>
  );
}
