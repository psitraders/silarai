/**
 * Auto-registry (plan §5.2). Packs are discovered by file convention — adding a
 * folder with a `manifest.ts` registers it; there is no central list to edit.
 *
 *   packs/<kind-folder>/<id>/manifest.ts        → layout packs (sections, headers, …)
 *   templates/<template>/widgets/<id>/manifest.ts → signature widgets (section packs)
 *   packs/palettes/<id>.ts, packs/fonts/<id>.ts, packs/style-kits/<id>.ts → data packs
 *   templates/<id>/template.ts                  → template packs
 *
 * Manifests are loaded eagerly (they are tiny); layout components load lazily.
 */
import type {
  FontPairDef, PackKind, PackManifest, PaletteDef, StyleKitDef, TemplateManifest,
} from './types';

type AnyManifest = PackManifest<never, never>;
type Module<T> = { default: T };

const layoutPackModules = {
  ...import.meta.glob<Module<AnyManifest>>('../packs/*/*/manifest.ts', { eager: true }),
  ...import.meta.glob<Module<AnyManifest>>('../templates/*/widgets/*/manifest.ts', { eager: true }),
};
const paletteModules  = import.meta.glob<Module<PaletteDef>>('../packs/palettes/*.ts', { eager: true });
const fontModules     = import.meta.glob<Module<FontPairDef>>('../packs/fonts/*.ts', { eager: true });
const styleKitModules = import.meta.glob<Module<StyleKitDef>>('../packs/style-kits/*.ts', { eager: true });
const templateModules = import.meta.glob<Module<TemplateManifest>>('../templates/*/template.ts', { eager: true });

function index<T extends { id: string }>(modules: Record<string, Module<T>>, label: string, keyOf: (item: T) => string = i => i.id): Map<string, T> {
  const map = new Map<string, T>();
  for (const [path, mod] of Object.entries(modules)) {
    const item = mod.default;
    if (!item?.id) {
      if (import.meta.env.DEV) console.warn(`[storefront-builder] ${path} has no default export with an id`);
      continue;
    }
    const key = keyOf(item);
    if (map.has(key) && import.meta.env.DEV) console.warn(`[storefront-builder] duplicate ${label} "${key}" (${path})`);
    map.set(key, item);
  }
  return map;
}

const packs     = index(layoutPackModules, 'pack', m => `${m.kind}:${m.id}`);
const palettes  = index(paletteModules, 'palette');
const fonts     = index(fontModules, 'font pair');
const styleKits = index(styleKitModules, 'style kit');
const templates = index(templateModules, 'template');

export const registry = {
  /** Typed lookup — callers know which props their kind of pack takes. */
  getPack<S, P>(kind: PackKind, id: string): PackManifest<S, P> | undefined {
    return packs.get(`${kind}:${id}`) as unknown as PackManifest<S, P> | undefined;
  },
  listPacks(kind: PackKind): PackManifest[] {
    return [...packs.values()].filter(p => p.kind === kind) as unknown as PackManifest[];
  },
  getPalette: (id: string) => palettes.get(id),
  listPalettes: () => [...palettes.values()],
  getFontPair: (id: string) => fonts.get(id),
  listFontPairs: () => [...fonts.values()],
  getStyleKit: (id: string) => styleKits.get(id),
  listStyleKits: () => [...styleKits.values()],
  getTemplate: (id: string) => templates.get(id),
  listTemplates: () => [...templates.values()],
};
