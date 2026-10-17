/**
 * Noor's documents (catalogue §10.1): theme, header/footer, Home, catalogue, product page and
 * About / FAQ / Contact. Built from the store's own data; layouts hold rules, never prices (SB-R1).
 * Policy-type copy (delivery, returns) is written as guidance for the merchant to replace.
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

function site(store: StoreInfo): SiteDoc {
  return {
    schemaVersion: 1,
    templateId: 'noor',
    theme: { styleKit: 'luxe', overrides: {}, palette: { presetId: 'luxe-gold' }, fontPair: 'luxury-serif' },
    behaviour: {
      productView: 'page',
      quickviewLayout: 'immersive',
      cardStyle: 'editorial',
      cartStyle: 'drawer-right',
      cart: { freeDeliveryAt: 0, upsell: true, coupon: true, autoOpen: true },
      backToTop: true,
      mobileBottomBar: false,
      loader: store.loaderEnabled === false ? 'none' : 'logo',
    },
    header: section('header', 'header', 'stacked-centered', 'light', {
      announcements: store.announcementText?.trim() ? [store.announcementText.trim()] : [],
      announcementStyle: 'static',
      sticky: 'scroll-up',
      search: 'icon',
      mobileMenu: 'fullscreen',
      logoSize: 'large',
      cartIcon: 'bag',
      showAccount: true,
      showWhatsApp: false,
      featuredCategoriesInMenu: true,
    }),
    footer: section('footer', 'footer', 'big-wordmark', 'contrast', {
      about: store.description ?? '',
      showTrustStrip: false,
      showCategories: true,
      showReturnPolicy: true,
      showSocial: true,
      showPayments: true,
    }),
    menus: { main: [], footer: [] },
  };
}

function home(store: StoreInfo): PageLayout {
  return page([
    section('hero', 'hero', 'full-bleed', 'contrast', {
      eyebrow: 'Handcrafted for you',
      image: image(uploadedImage(store.bannerUrl)),
      primaryLabel: 'Shop the collection',
      primaryLink: link('/products'),
      showWhatsApp: false,
      showHighlights: false,
      height: 'tall',
    }),
    section('spotlight', 'collection-spotlight', 'framed', 'soft', {
      eyebrow: 'The collection',
      category: { $categories: { source: 'featured', limit: 1 } },
      buttonLabel: 'Explore the collection',
    }),
    section('new-in', 'product-collection', 'large-first', 'light', {
      eyebrow: 'New in',
      title: 'Latest pieces',
      products: { $products: { source: 'newest', limit: 7 } },
      showViewAll: true,
    }),
    section('making', 'craftsmanship-story', 'steps', 'soft', {
      eyebrow: 'The making',
      heading: 'From sketch to sparkle',
      subtitle: 'Tell shoppers how your pieces are made — edit these steps to match your craft.',
    }, blocksOf('step', 'step', [
      { title: 'Design', text: 'Every piece starts as a hand sketch.' },
      { title: 'Crafting', text: 'Shaped and finished by skilled artisans.' },
      { title: 'Detailing', text: 'Stones and details are set by hand.' },
      { title: 'Finishing', text: 'Polished, checked and packed with care.' },
    ])),
    section('look', 'shop-the-look', 'hotspots', 'light', {
      eyebrow: 'Shop the look',
      heading: 'Styled for the evening',
      image: image(''),
    }),
    section('reviews', 'reviews-summary', 'carousel', 'contrast', { eyebrow: 'Kind words', heading: 'From our customers', limit: 6, minRating: 4, showProduct: true }),
    section('promise', 'certification-strip', 'strip', 'light', { heading: 'Our promise' }, blocksOf('badge', 'badge', [
      { icon: 'hand', title: 'Handcrafted', detail: 'Made by skilled artisans' },
      { icon: 'gift', title: 'Gift-ready', detail: 'Packed to be given' },
      { icon: 'shield', title: 'Secure payments', detail: 'Pay safely online' },
      { icon: 'chat', title: 'Help on WhatsApp', detail: 'Real people, quick replies' },
    ])),
    ...(store.whatsAppNumber ? [section('concierge', 'concierge', 'card', 'soft', {})] : []),
  ]);
}

const collection = (): PageLayout => page([
  section('all-products', 'all-products', 'editorial-2col', 'light', { showBreadcrumb: true, title: 'The collection' }),
]);

const product = (): PageLayout => page([
  section('product-main', 'product-main', 'split-screen', 'light', { imageRatio: 'portrait', zoom: true, infoStyle: 'accordion', stickyBar: true, breadcrumbs: true },
    DEFAULT_PRODUCT_BLOCKS.map((b, i) => ({ id: `pb${i + 1}`, type: b.type, settings: b.settings }))),
  section('related', 'related-products', 'carousel', 'soft'),
  section('recent', 'recently-viewed', 'carousel', 'light'),
]);

function pages(store: StoreInfo): TemplatePage[] {
  const about: TemplatePage = {
    title: 'Our story',
    slug: 'about',
    showInNav: true,
    showInFooter: true,
    layout: page([
      section('story', 'rich-text', 'narrow', 'light', {
        eyebrow: 'Our story',
        heading: store.name,
        content: richText(`<p>${escapeHtml(store.description || 'Tell shoppers who you are, where your pieces come from and what makes them special.')}</p>`),
        align: 'center',
      }),
      section('making', 'craftsmanship-story', 'alternating', 'soft', { eyebrow: 'The making', heading: 'How each piece is made', subtitle: '' },
        blocksOf('step', 'step', [
          { title: 'Designed by hand', text: 'Describe where your designs come from.' },
          { title: 'Made by artisans', text: 'Introduce the people who make your pieces.' },
        ])),
      ...(store.whatsAppNumber ? [section('concierge', 'concierge', 'banner', 'contrast', {})] : []),
    ]),
  };
  const faq: TemplatePage = {
    title: 'FAQ',
    slug: 'faq',
    showInFooter: true,
    layout: page([
      section('faq', 'faq', 'accordion', 'light', { heading: 'Questions, answered', subtitle: 'Replace these answers with your own policies.' }, blocksOf('q', 'question', [
        { question: 'How long does delivery take?', answer: 'Tell shoppers how long delivery usually takes and where you ship.' },
        { question: 'Can I return or exchange a piece?', answer: 'Explain your return and exchange policy, including any time limit.' },
        { question: 'How should I care for my jewellery?', answer: 'Share simple care tips so pieces stay beautiful.' },
        { question: 'Do you offer gift wrapping?', answer: 'Say whether pieces come gift-ready and if you add notes.' },
      ])),
      ...(store.whatsAppNumber ? [section('help', 'whatsapp-cta', 'card', 'soft', { heading: 'Still have a question?', buttonLabel: 'Ask us on WhatsApp' })] : []),
    ]),
  };
  const contact: TemplatePage = {
    title: 'Contact',
    slug: 'contact',
    showInFooter: true,
    layout: page([
      section('contact', 'contact-info', 'split', 'light', { heading: 'Visit or write to us', phone: store.whatsAppNumber ? `+${store.whatsAppNumber.replace(/^\+/, '')}` : '', showWhatsApp: !!store.whatsAppNumber }),
    ]),
  };
  return [about, faq, contact];
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const build: TemplateBuild = store => ({ site: site(store), home: home(store), collection: collection(), product: product(), pages: pages(store) });

export default build;
