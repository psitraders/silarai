/**
 * Starter — the built-in default design (SB-R5). Used by every store that has
 * not published a design yet. It mirrors the previous fixed storefront, now
 * made of builder sections, and uses the store's own brand colours.
 */
import { isHex } from '../../core/theme/color';
import { image, link } from '../../core/smart';
import type { PageLayout, SiteDoc, StoreInfo, TemplateManifest } from '../../core/types';
import { DEFAULT_PRODUCT_BLOCKS } from '../../ui/product/blockTypes';

const pick = (value: string | undefined, fallback: string) => (isHex(value) ? value! : fallback);

function site(store: StoreInfo): SiteDoc {
  return {
    schemaVersion: 1,
    templateId: 'starter',
    theme: {
      styleKit: 'soft',
      overrides: { corners: 'soft', imageCorners: 'soft', buttonShape: 'rounded', headingWeight: 'black' },
      palette: {
        custom: {
          primary: pick(store.themeColor, '#0F766E'),
          secondary: pick(store.secondaryColor, '#134E4A'),
          accent: pick(store.accentColor, '#D97706'),
          background: '#F8FAFC',
          text: '#0F172A',
        },
      },
      fontPair: 'inter',
    },
    behaviour: {
      productView: 'popup',
      quickviewLayout: 'classic-split',
      cardStyle: 'standard',
      cartStyle: 'drawer-right',
      cart: { freeDeliveryAt: 0, upsell: false, coupon: true, autoOpen: true },
      backToTop: true,
      mobileBottomBar: true,
      loader: store.loaderEnabled === false ? 'none' : 'logo',
    },
    header: {
      id: 'header',
      type: 'header',
      layout: 'classic',
      scheme: 'light',
      v: 2,
      settings: {
        announcements: store.announcementText?.trim() ? [store.announcementText.trim()] : [],
        announcementStyle: 'marquee',
        sticky: 'always',
        search: 'icon',
        showAccount: true,
        showWhatsApp: true,
        featuredCategoriesInMenu: true,
      },
    },
    footer: {
      id: 'footer',
      type: 'footer',
      layout: 'columns',
      scheme: 'contrast',
      settings: { showTrustStrip: true, showCategories: true, showReturnPolicy: true },
    },
    menus: { main: [], footer: [] },
  };
}

function home(store: StoreInfo): PageLayout {
  const sections: PageLayout['sections'] = [
    {
      id: 'hero',
      type: 'hero',
      layout: store.bannerUrl ? 'full-bleed' : 'centered',
      scheme: 'brand',
      settings: {
        image: image(store.bannerUrl),
        primaryLabel: 'Shop now',
        primaryLink: link('#all-products'),
        showWhatsApp: true,
        showHighlights: true,
      },
    },
    { id: 'trust', type: 'trust-badges', layout: 'ribbon', scheme: 'light' },
    {
      id: 'categories',
      type: 'category-grid',
      layout: 'icon-rail',
      scheme: 'light',
      settings: { title: 'Shop by category', categories: { $categories: { source: 'all', limit: 24 } } },
    },
    {
      id: 'trending',
      type: 'product-collection',
      layout: 'carousel',
      scheme: 'soft',
      settings: {
        eyebrow: 'Hot right now',
        title: 'Trending products',
        subtitle: 'Loved by our customers this week',
        products: { $products: { source: 'featured', limit: 12 } },
        showRank: true,
      },
    },
    { id: 'all-products', type: 'all-products', layout: 'grid-filters', scheme: 'light' },
  ];
  if (store.whatsAppNumber) {
    sections.push({ id: 'whatsapp', type: 'whatsapp-cta', layout: 'banner', scheme: 'light' });
  }
  return { schemaVersion: 1, sections };
}

function collection(): PageLayout {
  return {
    schemaVersion: 1,
    sections: [{ id: 'all-products', type: 'all-products', layout: 'grid-filters', scheme: 'light', settings: { showBreadcrumb: true } }],
  };
}

/** Product page (and popup content): gallery + product blocks, then related and recently viewed. */
function product(): PageLayout {
  return {
    schemaVersion: 1,
    sections: [
      {
        id: 'product-main',
        type: 'product-main',
        layout: 'classic',
        scheme: 'light',
        blocks: DEFAULT_PRODUCT_BLOCKS.map((b, i) => ({ id: `pb${i + 1}`, type: b.type, settings: b.settings })),
      },
      { id: 'related', type: 'related-products', layout: 'carousel', scheme: 'soft' },
      { id: 'recent', type: 'recently-viewed', layout: 'carousel', scheme: 'light' },
    ],
  };
}

const starter: TemplateManifest = {
  id: 'starter',
  name: 'Starter',
  description: 'A clean, conversion-focused store using your brand colours.',
  tier: 'free',
  mood: 'Clean and simple — works for any shop',
  shopTypes: [],
  palettes: [],
  fontPair: 'inter',
  styleKit: 'soft',
  build: store => ({ site: site(store), home: home(store), collection: collection(), product: product() }),
};

export default starter;
