/**
 * Builds the settings form for any pack from its manifest `fields` (design.md §13
 * rule 5 — no hand-built forms per pack). Fields can be grouped and conditional.
 */
import { useId } from 'react';
import type { FieldDef, Settings } from '../../core/types';
import { FieldLabel, Group, INPUT, Segmented, Toggle } from '../ui/controls';
import { CategoriesField } from './CategoriesField';
import { IconField } from './IconField';
import { ImageField } from './ImageField';
import { LinkField } from './LinkField';
import { ListField } from './ListField';
import { ProductsField } from './ProductsField';
import { RichTextField } from './RichTextField';

export function SchemaForm({ fields, values, onChange, scope, grouped = false }: {
  fields: FieldDef[];
  values: Settings;
  onChange: (key: string, value: unknown) => void;
  /** Unique per instance so field-local state resets when the selection changes. */
  scope: string;
  grouped?: boolean;
}) {
  const visible = fields.filter(f => !f.showIf || f.showIf.equals.includes(values[f.showIf.key]));
  if (!grouped || !visible.some(f => f.group)) {
    return <div className={grouped ? 'space-y-4 p-4' : 'space-y-4'}>{visible.map(f => <Field key={`${scope}:${f.key}`} field={f} value={values[f.key]} onChange={v => onChange(f.key, v)} scope={scope} />)}</div>;
  }
  const groups = [...new Set(visible.map(f => f.group ?? 'Settings'))];
  return (
    <div>
      {groups.map((g, i) => (
        <Group key={g} title={g} defaultOpen={i === 0}>
          {visible.filter(f => (f.group ?? 'Settings') === g).map(f => (
            <Field key={`${scope}:${f.key}`} field={f} value={values[f.key]} onChange={v => onChange(f.key, v)} scope={scope} />
          ))}
        </Group>
      ))}
    </div>
  );
}

function Field({ field, value, onChange, scope }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void; scope: string }) {
  const id = useId();
  const text = typeof value === 'string' ? value : value == null ? '' : String(value);

  switch (field.type) {
    case 'text':
      return (
        <div>
          <FieldLabel htmlFor={id} helper={field.helper}>{field.label}</FieldLabel>
          <input id={id} value={text} placeholder={field.placeholder} onChange={e => onChange(e.target.value)} className={INPUT} />
        </div>
      );
    case 'textarea':
      return (
        <div>
          <FieldLabel htmlFor={id} helper={field.helper}>{field.label}</FieldLabel>
          <textarea id={id} rows={3} value={text} placeholder={field.placeholder} onChange={e => onChange(e.target.value)} className={`${INPUT} resize-y`} />
        </div>
      );
    case 'html':
      return (
        <div>
          <FieldLabel htmlFor={id} helper={field.helper}>{field.label}</FieldLabel>
          <textarea
            id={id}
            rows={10}
            spellCheck={false}
            value={(value as { $richtext?: string })?.$richtext ?? ''}
            onChange={e => onChange({ $richtext: e.target.value })}
            className={`${INPUT} resize-y font-mono text-xs`}
          />
        </div>
      );
    case 'number':
      return (
        <div>
          <FieldLabel htmlFor={id} helper={field.helper}>{field.label}</FieldLabel>
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={field.min}
            max={field.max}
            step={field.step}
            value={typeof value === 'number' ? value : text}
            onChange={e => {
              const n = Number(e.target.value);
              if (e.target.value === '' || Number.isNaN(n)) return;
              onChange(Math.max(field.min ?? -Infinity, Math.min(field.max ?? Infinity, n)));
            }}
            className={INPUT}
          />
        </div>
      );
    case 'date':
      return (
        <div>
          <FieldLabel htmlFor={id} helper={field.helper}>{field.label}</FieldLabel>
          <input id={id} type="datetime-local" value={text} onChange={e => onChange(e.target.value)} className={INPUT} />
        </div>
      );
    case 'toggle':
      return <Toggle checked={!!value} onChange={onChange} label={field.label} helper={field.helper} />;
    case 'select': {
      const options = field.options ?? [];
      const short = options.length <= 3 && options.every(o => o.label.length <= 12);
      return (
        <div>
          <FieldLabel htmlFor={id} helper={field.helper}>{field.label}</FieldLabel>
          {short ? (
            <Segmented label={field.label} value={text} options={options.map(o => ({ value: o.value, label: o.label }))} onChange={onChange} size="sm" />
          ) : (
            <select id={id} value={text} onChange={e => onChange(e.target.value)} className={INPUT}>
              {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}
        </div>
      );
    }
    case 'icon':
      return <IconField label={field.label} value={value} onChange={onChange} />;
    case 'richtext':
      return <RichTextField label={field.label} helper={field.helper} value={value} onChange={onChange} />;
    case 'image':
      return <ImageField label={field.label} helper={field.helper} value={value} onChange={onChange} />;
    case 'link':
      return <LinkField label={field.label} helper={field.helper} value={value} onChange={onChange} />;
    case 'products':
      return <ProductsField label={field.label} helper={field.helper} value={value} onChange={onChange} max={field.max} />;
    case 'categories':
      return <CategoriesField label={field.label} helper={field.helper} value={value} onChange={onChange} />;
    case 'list':
      return <ListField field={field} value={value} onChange={onChange} scope={`${scope}.${field.key}`} />;
    default:
      return null;
  }
}
