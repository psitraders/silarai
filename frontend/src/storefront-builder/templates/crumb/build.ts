/**
 * Crumb's documents (catalogue §10.3): theme, header/footer, Home, catalogue, product page and
 * About / FAQ / Contact. Built from the store's own data; layouts hold rules, never prices (SB-R1).
 * Cards show veg / eggless marks from product tags. No sample testimonials or policy claims (SB-R18).
 */
import { registry } from '../../core/registry';
import { image, link, richText } from '../../core/smart';
import { uploadedImage } from '../../core/templates';
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
const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const productBlocks = () => DEFAULT_PRODUCT_BLOCKS.map((b, i) => ({ id: `pb${i + 1}`, type: b.type, settings: b.settings }));
const announcements = (store: StoreInfo) => (store.announcementText?.trim() ? [store.announcementText.trim()] : []);
const phone = (store: StoreInfo) => (store.whatsAppNumber ? `+${store.whatsAppNumber.replace(/^\+/, '')}` : '');

function site(store: StoreInfo): SiteDoc {
  return {
    schemaVersion: 1,
    templateId: 'crumb',
    theme: { styleKit: 'soft', overrides: { foodMarkers: true }, palette: { presetId: 'caramel' }, fontPair: 'bakery-sc' },
    behaviour: {
      productView: 'popup',
      quickviewLayout: 'menu-item',
      cardStyle: 'rounded-center',
      cartStyle: 'bottom-sheet',
      cart: { freeDeliveryAt: 0, upsell: true, coupon: true, autoOpen: true },
      backToTop: true,
      mobileBottomBar: true,
      loader: store.loaderEnabled === false ? 'none' : 'logo',
    },
    header: section('header', 'header', 'two-tier', 'light', {
      announcements: announcements(store),
      announcementStyle: 'static',
      utilityText: '',
      sticky: 'always',
      search: 'icon',
      mobileMenu: 'drawer-left',
      logoSize: 'medium',
      cartIcon: 'basket',
      showAccount: true,
      showWhatsApp: true,
      featuredCategoriesInMenu: true,
    }),
    footer: section('footer', 'footer', 'contact-card', 'contrast', {
      about: store.description ?? '',
      showTrustStrip: false,
      showCategories: true,
      showReturnPolicy: true,
      showSocial: true,
      showPayments: true,
      contactPhone: phone(store),
    }),
    menus: { main: [], footer: [] },
  };
}

function home(store: StoreInfo): PageLayout {
  return page([
    section('hero', 'hero', 'split-right', 'soft', {
      eyebrow: 'Baked fresh',
      image: image(uploadedImage(store.bannerUrl)),
      primaryLabel: 'See today’s menu',
      primaryLink: link('#section-menu'),
      showWhatsApp: true,
      showHighlights: false,
      height: 'regular',
    }),
    section('today', 'todays-bake', 'cards', 'accent', { eyebrow: 'Fresh today', heading: 'Today’s bake', products: { $products: { source: 'featured', limit: 4 } }, cutoff: '' }),
    section('menu', 'menu-board', 'board', 'light', { eyebrow: 'Our menu', heading: 'Baked fresh', categories: { $categories: { source: 'all', limit: 6 } }, perCategory: 8 }),
    section('occasion', 'product-collection', 'carousel', 'soft', {
      eyebrow: 'For every celebration', title: 'Occasion favourites', products: { $products: { source: 'featured', limit: 12 } }, showViewAll: true,
    }),
    section('cake', 'custom-cake-request', 'split', 'light', {}),
    section('reviews', 'reviews-summary', 'carousel', 'soft', { eyebrow: 'Reviews', heading: 'Sweet words', limit: 6, minRating: 4, showProduct: true }),
    section('visit', 'contact-info', 'card', 'light', { heading: 'Visit or order', phone: phone(store), showWhatsApp: !!store.whatsAppNumber }),
  ]);
}

const collection = (): PageLayout => page([
  section('all-products', 'all-products', 'category-rows', 'light', { showBreadcrumb: true, title: 'Our menu' }),
]);

const product = (): PageLayout => page([
  section('product-main', 'product-main', 'menu-item', 'light', { imageRatio: 'square', zoom: true, infoStyle: 'plain', stickyBar: true, breadcrumbs: true, addOnsHeading: 'Goes well with' }, productBlocks()),
  section('related', 'related-products', 'carousel', 'soft'),
]);

function pages(store: StoreInfo): TemplatePage[] {
  return [
    {
      title: 'Our story', slug: 'about', showInNav: true, showInFooter: true,
      layout: page([
        section('story', 'rich-text', 'narrow', 'light', {
          eyebrow: 'Our story', heading: store.name, align: 'center',
          content: richText(`<p>${escapeHtml(store.description || 'Tell shoppers who bakes, what you bake and what makes it special.')}</p>`),
        }),
        section('slots', 'delivery-slots', 'card', 'soft', { heading: 'When and where we deliver' }, blocksOf('slot', 'slot', [
          { label: 'Morning', time: 'Add your times' },
          { label: 'Evening', time: 'Add your times' },
        ])),
      ]),
    },
    {
      title: 'FAQ', slug: 'faq', showInFooter: true,
      layout: page([
        section('faq', 'faq', 'accordion', 'light', { heading: 'Questions, answered', subtitle: 'Replace these answers with your own policies.' }, blocksOf('q', 'question', [
          { question: 'How early should I order?', answer: 'Say how much notice you need for regular items and for custom cakes.' },
          { question: 'Do you have eggless options?', answer: 'Explain which items can be made eggless. Tag products “eggless” or “veg” to show the marks.' },
          { question: 'Which areas do you deliver to?', answer: 'List the areas you deliver to and any delivery charges.' },
          { question: 'Can I pick up my order?', answer: 'Tell shoppers if and when they can collect from you.' },
        ])),
      ]),
    },
    {
      title: 'Contact', slug: 'contact', showInFooter: true,
      layout: page([
        section('contact', 'contact-info', 'split', 'light', { heading: 'Get in touch', phone: phone(store), showWhatsApp: !!store.whatsAppNumber }),
        section('map', 'map', 'contained', 'light', { heading: 'Find us' }),
      ]),
    },
  ];
}

const build: TemplateBuild = store => ({ site: site(store), home: home(store), collection: collection(), product: product(), pages: pages(store) });

export default build;
