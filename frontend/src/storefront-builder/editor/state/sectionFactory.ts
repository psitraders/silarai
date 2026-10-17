import type { EditorPack, SectionInstance, SectionPreset } from '../../core/types';
import { clone, newId } from './ids';

/** A new section instance from a pack preset (or the pack defaults). */
export function sectionFromPreset(manifest: EditorPack, preset?: SectionPreset): SectionInstance {
  const blocks = preset?.blocks?.length
    ? preset.blocks.map(b => ({ id: newId(b.type), type: b.type, settings: clone(b.settings ?? manifest.blocks?.types.find(t => t.type === b.type)?.defaults ?? {}) }))
    : manifest.blocks
      ? Array.from({ length: Math.max(manifest.blocks.min ?? 0, 3) }, () => {
        const def = manifest.blocks!.types[0];
        return { id: newId(def.type), type: def.type, settings: clone(def.defaults) };
      })
      : undefined;
  return {
    id: newId(manifest.id),
    type: manifest.id,
    layout: preset?.layout ?? manifest.defaultLayout,
    scheme: preset?.scheme ?? 'light',
    v: manifest.version,
    settings: clone(preset?.settings ?? {}),
    blocks,
  };
}
