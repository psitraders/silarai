import { effectiveSettings } from '../../core/renderer/lazyLayout';
import { editorPacks } from '../packs';
import type { EditorPack, PackKind, SectionInstance, Settings } from '../../core/types';
import { useEditor, type Target } from './store';

export const kindOf = (t: Target): Extract<PackKind, 'section' | 'header' | 'footer'> =>
  t.kind === 'section' ? 'section' : t.kind;

/** The selected header / footer / section instance and its manifest. */
export function useInstance(target: Target | undefined): { instance: SectionInstance | null; manifest: EditorPack | null } {
  const instance = useEditor(s => {
    if (!target || !s.site) return null;
    if (target.kind === 'header') return s.site.header;
    if (target.kind === 'footer') return s.site.footer;
    return s.layouts[s.currentPage]?.sections.find(x => x.id === target.id) ?? null;
  });
  const manifest = instance && target ? editorPacks.get(kindOf(target), instance.type) : undefined;
  return { instance, manifest: manifest ?? null };
}

export function settingsFor(manifest: EditorPack, instance: SectionInstance): Settings {
  return effectiveSettings(manifest, instance.settings, instance.v) as Settings;
}

/**
 * Writes one setting. Settings saved by an older pack version are upgraded first and
 * stamped with the current version, so `upgrade()` never runs twice (SB-R3).
 */
export function writeSetting(target: Target, manifest: EditorPack, key: string, value: unknown) {
  useEditor.getState().updateInstance(target, inst => {
    let settings: Settings = inst.settings ?? {};
    if (manifest.upgrade && inst.settings && (inst.v ?? 1) < manifest.version) settings = manifest.upgrade(settings, inst.v ?? 1);
    inst.settings = { ...settings, [key]: value };
    inst.v = manifest.version;
  });
}
