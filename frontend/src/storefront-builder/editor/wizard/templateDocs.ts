import { registry } from '../../core/registry';
import { isHex } from '../../core/theme/color';
import type { PaletteChoice, ShopType, StoreInfo, TemplateDocs, TemplateManifest } from '../../core/types';

export const SHOP_TYPES: { id: ShopType; label: string }[] = [
  { id: 'jewellery', label: 'Jewellery' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'food', label: 'Bakery & food' },
  { id: 'grocery', label: 'Grocery' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'other', label: 'Something else' },
];

/** Templates for a shop type: made-for matches first, then the rest, Starter last. */
export function orderTemplates(templates: TemplateManifest[], shopType: ShopType | null): { template: TemplateManifest; recommended: boolean }[] {
  const score = (t: TemplateManifest) => (t.id === 'starter' ? 2 : shopType && t.shopTypes.includes(shopType) ? 0 : 1);
  return templates
    .slice()
    .sort((a, b) => score(a) - score(b) || a.name.localeCompare(b.name))
    .map(template => ({ template, recommended: !!shopType && template.shopTypes.includes(shopType) }));
}

/** "brand" = the store's own colours on the template's default palette background and text. */
export const BRAND_PALETTE = 'brand';

export function hasBrandColours(store: StoreInfo): boolean {
  return isHex(store.themeColor);
}

/** The palette choice for a wizard pick (a preset id or the store's brand colours). */
export function paletteChoice(paletteId: string, template: TemplateManifest, store: StoreInfo): PaletteChoice {
  if (paletteId !== BRAND_PALETTE) return { presetId: paletteId };
  const base = registry.getPalette(template.palettes[0] ?? '') ?? registry.listPalettes()[0];
  const primary = store.themeColor!;
  return {
    custom: {
      ...base.colors,
      primary,
      secondary: isHex(store.secondaryColor) ? store.secondaryColor! : primary,
      accent: isHex(store.accentColor) ? store.accentColor! : base.colors.accent,
    },
  };
}

/** The template's documents with the merchant's palette and font picks applied. */
export function withChoices(docs: TemplateDocs, palette: PaletteChoice, fontPair: string): TemplateDocs {
  const site = structuredClone(docs.site);
  site.theme = { ...site.theme, palette, fontPair };
  return { ...docs, site };
}
