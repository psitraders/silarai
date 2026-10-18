/**
 * What the AI may build with (SB-R23): a compact text list of the section packs, their layouts, settings
 * and block types. Packs live in frontend code (D2), so the editor sends this with every request and
 * the backend stays schema-agnostic (SB-R4).
 */
import { canUse } from '../../core/canUse';
import type { EditorPack, FieldDef } from '../../core/types';
import { editorPacks } from '../packs';

/** Raw HTML is never AI-written. */
const SKIP = new Set(['custom-html']);
const PRODUCT_ONLY_GROUP = 'Product page';
/** Field types the AI leaves out (it has no uploads or icon names to use). */
const NO_AI_TYPES = new Set<FieldDef['type']>(['image', 'icon', 'html']);

function field(f: FieldDef): string | null {
  if (NO_AI_TYPES.has(f.type)) return null;
  if (f.type === 'select') return `${f.key} (select: ${(f.options ?? []).map(o => o.value).join('|')})`;
  if (f.type === 'list') {
    const items = (f.itemFields ?? []).map(field).filter(Boolean);
    return items.length ? `${f.key} (list of {${items.join(', ')}})` : `${f.key} (list of text)`;
  }
  return `${f.key} (${f.type})`;
}

const fields = (list: FieldDef[]) => list.map(field).filter(Boolean).join(', ');
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

function packEntry(m: EditorPack): string {
  const lines = [`- ${m.id}: ${m.name}${m.description ? ` — ${clip(m.description, 140)}` : ''}`];
  lines.push(`  layouts: ${Object.keys(m.layouts).join(', ')}`);
  const settings = fields(m.fields);
  if (settings) lines.push(`  settings: ${settings}`);
  if (m.blocks?.types.length) {
    const blocks = m.blocks.types.map(b => `${b.type} {${fields(b.fields)}}`).join('; ');
    lines.push(`  blocks (${m.blocks.min ?? 0}-${m.blocks.max ?? 12}): ${blocks}`);
  }
  return lines.join('\n');
}

/**
 * Section packs the AI may use on this page: generic sections, the store's own template widgets,
 * and the product-page group only on product designs.
 */
export function buildCatalogue(opts: { templateId: string | null; productPage: boolean }): string {
  return editorPacks.list('section')
    .filter(m => canUse(m) && !SKIP.has(m.id))
    .filter(m => !m.template || m.template === opts.templateId)
    .filter(m => opts.productPage || m.group !== PRODUCT_ONLY_GROUP)
    .map(packEntry)
    .join('\n');
}
