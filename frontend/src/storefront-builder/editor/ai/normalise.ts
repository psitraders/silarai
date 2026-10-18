import { canUse } from '../../core/canUse';
import type { BlockInstance, SectionInstance } from '../../core/types';
import { clone, newId } from '../state/ids';
import { sectionFromPreset } from '../state/sectionFactory';
import { editorPacks } from '../packs';

/**
 * AI sections (already validated by the server) → editor sections: unknown packs are dropped, unknown
 * layouts / block types fall back to the pack's, block settings sit on the block defaults, and every
 * section is stamped with its pack version (SB-R3). Packs that need blocks get their defaults when the
 * AI sent none.
 */
export function normaliseAiSections(raw: SectionInstance[]): SectionInstance[] {
  return raw.flatMap(s => {
    const m = editorPacks.get('section', s.type);
    if (!m || !canUse(m)) return [];
    const layout = s.layout && m.layouts[s.layout] ? s.layout : m.defaultLayout;

    let blocks: BlockInstance[] | undefined;
    if (m.blocks) {
      const defs = new Map(m.blocks.types.map(b => [b.type, b]));
      blocks = (s.blocks ?? [])
        .filter(b => defs.has(b.type))
        .slice(0, m.blocks.max ?? 50)
        .map(b => ({ id: newId(b.type), type: b.type, settings: { ...clone(defs.get(b.type)!.defaults), ...(b.settings ?? {}) } }));
      if (blocks.length < (m.blocks.min ?? 1)) blocks = sectionFromPreset(m).blocks;
    }

    return [{
      id: newId(m.id),
      type: m.id,
      layout,
      scheme: s.scheme ?? 'light',
      v: m.version,
      settings: s.settings ?? {},
      ...(blocks ? { blocks } : {}),
    }];
  });
}
