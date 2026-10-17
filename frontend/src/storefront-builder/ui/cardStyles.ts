/** Product card styles (catalogue §6) — ids of the `card` pack's layouts. */
export const CARD_STYLES = [
  { value: 'standard', label: 'Standard' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'bordered', label: 'Bordered' },
  { value: 'elevated', label: 'Elevated' },
  { value: 'list-row', label: 'List row (+/− stepper)' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'compact', label: 'Compact' },
  { value: 'rounded-center', label: 'Rounded, centred' },
  { value: 'tech', label: 'Tech (spec chips)' },
];

/** Per-section override field: empty = the store's card style. */
export const CARD_STYLE_FIELD = {
  key: 'cardStyle',
  label: 'Card style',
  type: 'select' as const,
  group: 'Cards',
  options: [{ value: '', label: 'Store default' }, ...CARD_STYLES],
};
