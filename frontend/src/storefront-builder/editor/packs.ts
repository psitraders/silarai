/**
 * Editor view of the pack registry: each runtime manifest merged with the
 * editor-only metadata in its sibling `editor.ts` (fields, blocks, presets,
 * gallery info, layout thumbnails). Only the editor and dev gallery import
 * this, so shoppers never download that metadata.
 */
import { registry } from '../core/registry';
import type { EditorPack, LayoutProps, PackEditorMeta, PackKind, PackManifest, Settings } from '../core/types';

type Module<T> = { default: T };
type AnyManifest = PackManifest<never, never>;

const folder = (path: string) => path.slice(0, path.lastIndexOf('/'));

// Same modules the runtime registry loads — pairing here by folder keeps ids and folder names independent.
const manifestModules = {
  ...import.meta.glob<Module<AnyManifest>>('../packs/*/*/manifest.ts', { eager: true }),
  ...import.meta.glob<Module<AnyManifest>>('../templates/*/widgets/*/manifest.ts', { eager: true }),
};
const metaModules = {
  ...import.meta.glob<Module<PackEditorMeta>>('../packs/*/*/editor.ts', { eager: true }),
  ...import.meta.glob<Module<PackEditorMeta>>('../templates/*/widgets/*/editor.ts', { eager: true }),
};

const metaByFolder = new Map(Object.entries(metaModules).map(([path, mod]) => [folder(path), mod.default]));
const metaByManifest = new Map<AnyManifest, PackEditorMeta>();
for (const [path, mod] of Object.entries(manifestModules)) {
  const meta = metaByFolder.get(folder(path));
  if (meta) metaByManifest.set(mod.default, meta);
  else if (import.meta.env.DEV) console.warn(`[storefront-builder] ${path} has no sibling editor.ts`);
}

const merged = new Map<AnyManifest, EditorPack>();

function merge(manifest: AnyManifest): EditorPack {
  const cached = merged.get(manifest);
  if (cached) return cached;
  const { layouts: layoutMeta, ...meta } = metaByManifest.get(manifest) ?? { fields: [] };
  const layouts = Object.fromEntries(
    Object.entries(manifest.layouts).map(([id, def]) => [id, { ...def, ...layoutMeta?.[id] }]),
  );
  const pack = { ...(manifest as unknown as PackManifest), ...meta, layouts } as EditorPack;
  merged.set(manifest, pack);
  return pack;
}

export const editorPacks = {
  get<S = Settings, P = LayoutProps<S>>(kind: PackKind, id: string): EditorPack<S, P> | undefined {
    const m = registry.getPack<never, never>(kind, id);
    return m ? (merge(m) as unknown as EditorPack<S, P>) : undefined;
  },
  list(kind: PackKind): EditorPack[] {
    return registry.listPacks(kind).map(m => merge(m as unknown as AnyManifest));
  },
};
