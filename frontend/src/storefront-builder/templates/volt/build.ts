/**
 * Volt's documents (catalogue §10.5): theme, header/footer, Home, catalogue, product page and
 * About / FAQ / Contact. Built from the store's own data; layouts hold rules, never prices (SB-R1).
 * Product compare is on (store behaviour). No sample testimonials, EMI or warranty claims (SB-R18).
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
    templateId: 'volt',
    theme: { styleKit: 'bento', overrides: {}, palette: { presetId: 'midnight' }, fontPair: 'geometric' },
    behaviour: {
      productView: 'page',
      quickviewLayout: 'spec-card',
      cardStyle: 'tech',
      cartStyle: 'drawer-right',
      cart: { freeDeliveryAt: 0, upsell: true, coupon: true, autoOpen: true },
      backToTop: true,
      mobileBottomBar: false,
      loader: store.loaderEnabled === false ? 'none' : 'logo',
      compare: true,
    },
    header: section('header', 'header', 'floating-pill', 'contrast', {
      announcements: announcements(store),
      announcementStyle: 'static',
      sticky: 'always',
      search: 'icon',
      mobileMenu: 'fullscreen',
      logoSize: 'medium',
      cartIcon: 'cart',
      showAccount: true,
      showWhatsApp: false,
      featuredCategoriesInMenu: true,
    }),
    footer: section('footer', 'footer', 'mega', 'contrast', {
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

function home(store: StoreInfo): PageLayout {
  return page([
    section('hero', 'hero', 'bold-text', 'contrast', {
      eyebrow: 'New launch',
      image: image(uploadedImage(store.bannerUrl)),
      primaryLabel: 'Shop now',
      primaryLink: link('/products'),
      secondaryLabel: 'Compare models',
      secondaryLink: link('#section-compare'),
      showWhatsApp: false,
      showHighlights: true,
      height: 'tall',
    }),
    section('features', 'feature-bento', 'bento', 'contrast', { eyebrow: 'Why us', heading: 'Built to do more' }, blocksOf('tile', 'tile', [
      { icon: 'zap', title: 'Headline feature', text: 'Describe what makes your products stand out.', size: 'large' },
      { icon: 'verified', title: 'Genuine products', text: 'Say where your stock comes from.', size: 'small' },
      { icon: 'truck', title: 'Fast delivery', text: 'Say how fast you ship.', size: 'small' },
      { icon: 'support', title: 'Real support', text: 'Say how shoppers reach you after buying.', size: 'wide' },
    ])),
    section('latest', 'product-collection', 'grid', 'light', {
      eyebrow: 'Just launched', title: 'Latest products', products: { $products: { source: 'newest', limit: 8 } }, showViewAll: true,
    }),
    section('compare', 'spec-compare', 'table', 'soft', { eyebrow: 'Compare', heading: 'Which one is right for you?' }),
    section('video', 'video-spotlight', 'split', 'contrast', { eyebrow: 'See it in action' }),
    section('assurance', 'warranty-strip', 'strip', 'light', {}, blocksOf('item', 'item', [
      { icon: 'shield', title: 'Warranty', detail: 'As per the brand' },
      { icon: 'card', title: 'Secure payments', detail: 'Pay safely online' },
      { icon: 'verified', title: 'Genuine products', detail: 'Sealed and original' },
      { icon: 'support', title: 'Support', detail: store.whatsAppNumber ? 'Help on WhatsApp' : 'We’re here to help' },
    ])),
    section('reviews', 'reviews-summary', 'summary', 'soft', { eyebrow: 'Reviews', heading: 'Rated by our customers', limit: 6, minRating: 4, showDistribution: true, showProduct: true }),
  ]);
}

const collection = (): PageLayout => page([
  section('all-products', 'all-products', 'bento', 'light', { showBreadcrumb: true, title: 'All products' }),
]);

const product = (): PageLayout => page([
  section('product-main', 'product-main', 'spec-sheet', 'light', { imageRatio: 'square', zoom: true, infoStyle: 'tabs', stickyBar: true, breadcrumbs: true, warranty: '', emi: '' }, productBlocks()),
  section('related', 'related-products', 'carousel', 'soft'),
  section('recent', 'recently-viewed', 'carousel', 'light'),
]);

function pages(store: StoreInfo): TemplatePage[] {
  return [
    {
      title: 'About us', slug: 'about', showInFooter: true,
      layout: page([
        section('story', 'rich-text', 'narrow', 'light', {
          eyebrow: 'About us', heading: store.name, align: 'left',
          content: richText(`<p>${escapeHtml(store.description || 'Tell shoppers who you are, which brands you carry and how you support them after they buy.')}</p>`),
        }),
      ]),
    },
    {
      title: 'FAQ', slug: 'faq', showInFooter: true,
      layout: page([
        section('faq', 'faq', 'two-column', 'light', { heading: 'Questions, answered', subtitle: 'Replace these answers with your own policies.' }, blocksOf('q', 'question', [
          { question: 'Are your products genuine?', answer: 'Explain where your stock comes from and what proof of purchase you give.' },
          { question: 'What warranty do I get?', answer: 'Describe the warranty on your products and how to claim it.' },
          { question: 'How long does delivery take?', answer: 'Tell shoppers how long delivery usually takes and where you ship.' },
          { question: 'Can I return a product?', answer: 'Explain your return policy, including opened or damaged items.' },
        ])),
      ]),
    },
    {
      title: 'Support', slug: 'contact', showInNav: true, showInFooter: true,
      layout: page([
        section('contact', 'contact-info', 'columns', 'light', { heading: 'Support', phone: phone(store), showWhatsApp: !!store.whatsAppNumber }),
        section('ask', 'enquiry-form', 'simple', 'soft', { eyebrow: 'Need help?', heading: 'Ask us anything', buttonLabel: 'Send message' }),
      ]),
    },
  ];
}

const build: TemplateBuild = store => ({ site: site(store), home: home(store), collection: collection(), product: product(), pages: pages(store) });

export default build;
