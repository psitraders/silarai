/**
 * Dev-only pack gallery (plan §5.2): every section / header / footer layout drawn
 * with sample data under any palette × style kit × font × colour scheme, at phone,
 * tablet or desktop width. Route: /__storefront/gallery (development builds only).
 */
import { useQueryClient } from '@tanstack/react-query';
import { CartProvider } from '../../context/CartContext';
import { StorefrontAuthProvider } from '../../context/StorefrontAuthContext';
import { useState } from 'react';
import { registry } from '../core/registry';
import { buildStarter } from '../core/templates';
import { editorPacks } from '../editor/packs';
import { CurrentProductContext } from '../core/commerce/currentProduct';
import { SectionFrame } from '../core/renderer/SectionFrame';
import { StorefrontContext, buildLinks, type StorefrontContextValue } from '../core/storefront-context';
import { resolveTheme } from '../core/theme/buildTheme';
import { themeRootAttributes } from '../core/theme/rootAttributes';
import { ThemeStyle } from '../core/theme/ThemeStyle';
import { SCHEME_IDS, type SchemeId, type SectionInstance, type Settings, type ThemeSettings } from '../core/types';
import { FIXTURE_CATEGORIES, FIXTURE_PAGES, FIXTURE_PRODUCT, FIXTURE_PRODUCTS, FIXTURE_RICH_TEXT, FIXTURE_STORE } from './fixtures';
import { ProductCard } from '../ui/ProductCard';

const SLUG = 'gallery';
const WIDTHS = { phone: 375, tablet: 768, desktop: 1280 } as const;

/** Fill every smart value in the defaults with sample data so sections render offline. */
function withSampleData(settings: Settings): Settings {
  const out: Settings = {};
  for (const [k, v] of Object.entries(settings)) {
    if (v && typeof v === 'object' && '$products' in v) out[k] = { ...v, items: FIXTURE_PRODUCTS };
    else if (v && typeof v === 'object' && '$categories' in v) out[k] = { ...v, items: FIXTURE_CATEGORIES };
    else if (v && typeof v === 'object' && '$richtext' in v) out[k] = { $richtext: (v as { $richtext: string }).$richtext || FIXTURE_RICH_TEXT };
    else if (k === 'endsAt' && !v) out[k] = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 16);
    else if (k === 'address' && !v) out[k] = 'MI Road, Jaipur, Rajasthan';
    else out[k] = v;
  }
  return out;
}

export default function Gallery() {
  const qc = useQueryClient();
  const [palette, setPalette] = useState('teal-classic');
  const [kit, setKit] = useState('soft');
  const [font, setFont] = useState('inter');
  const [scheme, setScheme] = useState<SchemeId>('light');
  const [width, setWidth] = useState<keyof typeof WIDTHS>('desktop');
  const [filter, setFilter] = useState('');

  // Seed the queries that list-style sections run (categories, all-products).
  useState(() => {
    qc.setQueryData(['public-categories', SLUG], FIXTURE_CATEGORIES);
    qc.setQueryData(['public-products', SLUG, '', null, '', false, 1, 36, null, null, true], { items: FIXTURE_PRODUCTS, totalCount: FIXTURE_PRODUCTS.length, page: 1, pageSize: 36, priceBounds: { min: 249, max: 1899 } });
    return true;
  });

  const theme: ThemeSettings = { styleKit: kit, palette: { presetId: palette }, fontPair: font };
  const starter = buildStarter(FIXTURE_STORE);
  const site = { ...starter.site, theme };
  const ctx: StorefrontContextValue = {
    slug: SLUG, isCustomDomain: false, store: FIXTURE_STORE, site,
    brandColor: resolveTheme(theme).palette.primary, version: 0, isPublished: false,
    navPages: FIXTURE_PAGES, links: buildLinks(SLUG, false),
  };

  const packs = (['header', 'section', 'footer'] as const).flatMap(kind =>
    editorPacks.list(kind).flatMap(p => Object.entries(p.layouts).map(([layoutId, def]) => ({ kind, pack: p, layoutId, layoutName: def.name }))),
  ).filter(x => !filter || `${x.pack.name} ${x.layoutName}`.toLowerCase().includes(filter.toLowerCase()));

  const cardStyles = Object.entries(editorPacks.get('card', 'card')?.layouts ?? {})
    .map(([id, def]) => [id, def.name] as const)
    .filter(([, name]) => !filter || `card ${name}`.toLowerCase().includes(filter.toLowerCase()));

  const select = (label: string, value: string, set: (v: string) => void, options: { id: string; name: string }[]) => (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
      {label}
      <select value={value} onChange={e => set(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900">
        {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </label>
  );

  return (
    <div className="min-h-dvh bg-slate-100">
      <div className="sticky top-0 z-[60] flex flex-wrap items-end gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <h1 className="mr-4 text-base font-bold text-slate-900">Storefront pack gallery</h1>
        {select('Palette', palette, setPalette, registry.listPalettes())}
        {select('Style kit', kit, setKit, registry.listStyleKits())}
        {select('Fonts', font, setFont, registry.listFontPairs())}
        {select('Colour scheme', scheme, v => setScheme(v as SchemeId), SCHEME_IDS.map(id => ({ id, name: id })))}
        {select('Width', width, v => setWidth(v as keyof typeof WIDTHS), Object.keys(WIDTHS).map(id => ({ id, name: `${id} (${WIDTHS[id as keyof typeof WIDTHS]}px)` })))}
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          Filter
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="hero, footer…" className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
        </label>
        <span className="ml-auto text-xs text-slate-500">{packs.length} layouts</span>
      </div>

      <StorefrontAuthProvider slug="sb-gallery">
      <CartProvider storageKey="sb-gallery">
      <StorefrontContext.Provider value={ctx}>
        <CurrentProductContext.Provider value={FIXTURE_PRODUCT}>
        <ThemeStyle theme={theme} scopeId="gallery" />
        <div className="space-y-8 p-6">
          {cardStyles.map(([id, name]) => (
            <div key={`card-${id}`}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">card · {name}</p>
              <div className="mx-auto overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm" style={{ maxWidth: WIDTHS[width] }}>
                <div className="sf-root" data-sf-root="gallery" {...themeRootAttributes(theme)} style={{ minHeight: 0 }}>
                  <div className="sf-scheme sf-cq p-6" data-sf-scheme={scheme}>
                    <ul className="grid grid-cols-2 gap-4 @3xl:grid-cols-4">
                      {FIXTURE_PRODUCTS.slice(4, 8).map((p, i) => <li key={p.id}><ProductCard product={p} index={i === 0 ? 0 : -1} cardStyle={id} context={{ mode: 'gallery', page: 'gallery', isFirst: false }} /></li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {packs.map(({ kind, pack, layoutId, layoutName }) => {
            const instance: SectionInstance = {
              id: `${pack.id}-${layoutId}`,
              type: pack.id,
              layout: layoutId,
              scheme,
              settings: withSampleData({ ...(pack.defaults as Settings), ...(kind === 'header' ? { announcements: [FIXTURE_STORE.announcementText] } : {}) }),
              v: pack.version,
              blocks: pack.presets?.find(p => p.blocks?.length)?.blocks?.map((b, i) => ({ id: `b${i}`, type: b.type, settings: b.settings })),
            };
            return (
              <div key={instance.id}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{kind} · {pack.name} · {layoutName}</p>
                <div className="mx-auto overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm" style={{ maxWidth: WIDTHS[width] }}>
                  <div className="sf-root" data-sf-root="gallery" {...themeRootAttributes(theme)} style={{ minHeight: 0, ['--sf-header-h' as string]: '76px' }}>
                    <SectionFrame instance={instance} kind={kind} context={{ mode: 'gallery', page: 'gallery', isFirst: true }} as="div" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </CurrentProductContext.Provider>
      </StorefrontContext.Provider>
      </CartProvider>
      </StorefrontAuthProvider>
    </div>
  );
}
