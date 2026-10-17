/**
 * Mandi's documents (catalogue §10.4): theme, header/footer, Home, catalogue, product page and
 * About / FAQ / Contact. Built from the store's own data; layouts hold rules, never prices (SB-R1).
 * Policy-type copy (delivery slots, minimum order) is written as guidance for the merchant to replace.
 * "Reorder favourites" needs order-history data (D12) and is not part of this template yet.
 */
import { registry } from '../../core/registry';
import { richText } from '../../core/smart';
import type { BlockInstance, PageLayout, SchemeId, SectionInstance, Settings, SiteDoc, StoreInfo, TemplateBuild, TemplatePage } from '../../core/types';
import { DEFAULT_PRODUCT_BLOCKS } from '../../ui/product/blockTypes';

/** A section stamped with its pack's current version, so `upgrade()` never runs on fresh settings. */
const section = (id: string, type: string, layout: string, scheme: SchemeId, settings?: Settings, blocks?: BlockInstance[]): SectionInstance => {
  const kind = type === 'header' || type === 'footer' ? type : 'section';
  return { id, type, layout, scheme, v: registry.getPack(kind, type)?.version ?? 1, ...(settings ? { settings } : {}), ...(blocks ? { blocks } : {}) };
};
const blocksOf = (prefix: string, type: string, list: Settings[]): BlockInstance[] =>
  list.map((settings, i) => ({ id: `${prefix}${i + 1}`, type, settings }));
const page = (sections: SectionInstance[]): PageLayout => ({ schemaVersion: 1, sections });

function site(store: StoreInfo): SiteDoc {
  return {
    schemaVersion: 1,
    templateId: 'mandi',
    theme: {
      styleKit: 'minimal',
      overrides: { gridGap: 'tight', sectionSpacing: 'compact', cardPadding: 'tight', productQuickAdd: true },
      palette: { presetId: 'emerald-market' },
      fontPair: 'ecom-clean',
    },
    behaviour: {
      productView: 'popup',
      quickviewLayout: 'compact-quick-add',
      cardStyle: 'compact',
      cartStyle: 'bottom-sheet',
      cart: { freeDeliveryAt: 0, upsell: true, coupon: true, autoOpen: false },
      backToTop: true,
      mobileBottomBar: true,
      loader: store.loaderEnabled === false ? 'none' : 'logo',
    },
    header: section('header', 'header', 'category-rail', 'light', {
      announcements: store.announcementText?.trim() ? [store.announcementText.trim()] : [],
      announcementStyle: 'rotating',
      sticky: 'always',
      search: 'bar',
      mobileMenu: 'drawer-left',
      logoSize: 'small',
      cartIcon: 'basket',
      showAccount: true,
      showWhatsApp: true,
      featuredCategoriesInMenu: true,
    }),
    footer: section('footer', 'footer', 'app-like', 'contrast', {
      about: store.description ?? '',
      showTrustStrip: true,
      showCategories: true,
      showReturnPolicy: true,
      showSocial: true,
      showPayments: true,
    }),
    menus: { main: [], footer: [] },
  };
}

function home(): PageLayout {
  return page([
    section('coupons', 'coupon-strip', 'strip', 'soft', { heading: 'Offers for you', source: 'store' }),
    section('delivery', 'free-delivery-bar', 'bar', 'light', { threshold: 0 }),
    section('categories', 'category-grid', 'circles', 'light', { title: 'Shop by category', categories: { $categories: { source: 'all', limit: 24 } }, showAll: true }),
    section('deal', 'deal-of-the-day', 'spotlight', 'accent', { eyebrow: 'Today only', heading: 'Deal of the day', products: { $products: { source: 'sale', limit: 4 } } }),
    section('rows', 'quick-add-rows', 'rows', 'light', { heading: 'Shop your daily needs', categories: { $categories: { source: 'all', limit: 4 } }, perCategory: 6, showViewAll: true }),
    section('combos', 'combo-packs', 'cards', 'soft', { eyebrow: 'Save time', heading: 'Combo packs', subtitle: 'Pick products for each combo in the editor.' },
      blocksOf('combo', 'combo', [
        { title: 'Breakfast basics', note: '', products: { $products: { source: 'manual', productIds: [], limit: 6 } } },
        { title: 'Monthly staples', note: '', products: { $products: { source: 'manual', productIds: [], limit: 6 } } },
      ])),
    section('trust', 'trust-badges', 'icons-row', 'light'),
  ]);
}

const collection = (): PageLayout => page([
  section('chips', 'category-chip-rail', 'chips', 'light', { showAll: true }),
  section('all-products', 'all-products', 'list', 'light', { showBreadcrumb: true, paging: 'infinite', showCategoryTabs: false }),
]);

const product = (): PageLayout => page([
  section('product-main', 'product-main', 'classic', 'light', { imageRatio: 'square', zoom: true, infoStyle: 'plain', stickyBar: true, breadcrumbs: true },
    DEFAULT_PRODUCT_BLOCKS.map((b, i) => ({ id: `pb${i + 1}`, type: b.type, settings: b.settings }))),
  section('related', 'related-products', 'carousel', 'soft'),
]);

function pages(store: StoreInfo): TemplatePage[] {
  const about: TemplatePage = {
    title: 'About us',
    slug: 'about',
    showInFooter: true,
    layout: page([
      section('story', 'rich-text', 'narrow', 'light', {
        eyebrow: 'About us',
        heading: store.name,
        content: richText(`<p>${escapeHtml(store.description || 'Tell shoppers who you are, where you source from and which areas you deliver to.')}</p>`),
        align: 'left',
      }),
      section('why', 'features', 'cards', 'soft', { heading: 'Why shop with us', align: 'center' }, blocksOf('f', 'feature', [
        { icon: 'leaf', title: 'Fresh stock', text: 'Say how often you restock fresh items.' },
        { icon: 'truck', title: 'Delivery', text: 'Describe your delivery areas and timings.' },
        { icon: 'cod', title: 'Easy payment', text: 'List the ways shoppers can pay.' },
      ])),
    ]),
  };
  const faq: TemplatePage = {
    title: 'FAQ',
    slug: 'faq',
    showInFooter: true,
    layout: page([
      section('faq', 'faq', 'accordion', 'light', { heading: 'Questions, answered', subtitle: 'Replace these answers with your own policies.' }, blocksOf('q', 'question', [
        { question: 'Which areas do you deliver to?', answer: 'List the pin codes or areas you deliver to.' },
        { question: 'When will my order arrive?', answer: 'Explain your delivery slots and order cut-off times.' },
        { question: 'Is there a minimum order?', answer: 'Mention any minimum order value or delivery charge.' },
        { question: 'What if an item is damaged or missing?', answer: 'Tell shoppers how to report it and how you make it right.' },
      ])),
      ...(store.whatsAppNumber ? [section('help', 'whatsapp-cta', 'banner', 'soft', { heading: 'Need help with an order?', buttonLabel: 'Chat on WhatsApp' })] : []),
    ]),
  };
  const contact: TemplatePage = {
    title: 'Contact',
    slug: 'contact',
    showInFooter: true,
    layout: page([
      section('contact', 'contact-info', 'card', 'light', { heading: 'Get in touch', phone: store.whatsAppNumber ? `+${store.whatsAppNumber.replace(/^\+/, '')}` : '', showWhatsApp: !!store.whatsAppNumber }),
      section('map', 'map', 'contained', 'light', { heading: 'Find our store' }),
    ]),
  };
  return [about, faq, contact];
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const build: TemplateBuild = store => ({ site: site(store), home: home(), collection: collection(), product: product(), pages: pages(store) });

export default build;
