/**
 * Bloom's documents (catalogue §10.2): theme, header/footer, Home, catalogue, product page and
 * About / FAQ / Contact. Built from the store's own data; layouts hold rules, never prices (SB-R1).
 * No sample testimonials or policy claims (SB-R18).
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
    templateId: 'bloom',
    theme: { styleKit: 'editorial', overrides: {}, palette: { presetId: 'rose-gold' }, fontPair: 'classic-elegant' },
    behaviour: {
      productView: 'popup',
      quickviewLayout: 'story',
      cardStyle: 'overlay',
      cartStyle: 'drawer-right',
      cart: { freeDeliveryAt: 0, upsell: true, coupon: true, autoOpen: true },
      backToTop: true,
      mobileBottomBar: false,
      loader: store.loaderEnabled === false ? 'none' : 'logo',
    },
    header: section('header', 'header', 'centered-logo', 'light', {
      announcements: announcements(store),
      announcementStyle: 'marquee',
      sticky: 'scroll-up',
      search: 'icon',
      mobileMenu: 'drawer-left',
      logoSize: 'medium',
      cartIcon: 'bag',
      showAccount: true,
      showWhatsApp: true,
      featuredCategoriesInMenu: true,
    }),
    footer: section('footer', 'footer', 'instagram-strip', 'soft', {
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
    section('hero', 'slideshow', 'full', 'contrast', { autoplay: true, interval: 6, height: 'tall' }, blocksOf('slide', 'slide', [
      { image: image(uploadedImage(store.bannerUrl)), eyebrow: 'New season', heading: store.name, text: '', buttonLabel: 'Shop new arrivals', buttonLink: link('/products'), align: 'left' },
      { image: image(''), eyebrow: 'The edit', heading: 'Pieces we love right now', text: '', buttonLabel: 'Explore', buttonLink: link('/products'), align: 'left' },
    ])),
    section('occasions', 'shop-by-occasion', 'arches', 'light', { heading: 'Shop by occasion' }, blocksOf('occ', 'occasion', [
      { label: 'Festive' }, { label: 'Wedding' }, { label: 'Office' }, { label: 'Casual' },
    ])),
    section('trending', 'product-collection', 'carousel', 'soft', {
      eyebrow: 'Trending', title: 'Most loved right now', products: { $products: { source: 'featured', limit: 12 } }, showRank: true, showViewAll: true,
    }),
    section('stories', 'lookbook-stories', 'circles', 'light', { heading: 'Lookbook' }, []),
    section('story', 'image-with-text', 'overlap', 'light', {
      eyebrow: 'Our story',
      heading: 'Made for the way you dress',
      body: richText(`<p>${escapeHtml(store.description || 'Tell shoppers what makes your collection special — fabrics, fits and the people behind it.')}</p>`),
      image: image(''),
      imageRatio: 'portrait',
      buttonLabel: 'About us',
      buttonLink: link('/p/about'),
    }),
    section('insta', 'instagram-grid', 'grid', 'light', { eyebrow: 'As seen on Instagram', heading: 'Styled by you', showHandle: true }, []),
    section('reviews', 'reviews-summary', 'carousel', 'soft', { eyebrow: 'Reviews', heading: 'What shoppers say', limit: 6, minRating: 4, showProduct: true }),
    section('newsletter', 'newsletter', 'band', 'brand', {}),
  ]);
}

const collection = (): PageLayout => page([
  section('all-products', 'all-products', 'masonry', 'light', { showBreadcrumb: true, title: 'Shop all' }),
]);

const product = (): PageLayout => page([
  section('product-main', 'product-main', 'stacked-sticky', 'light', { imageRatio: 'portrait', zoom: true, infoStyle: 'accordion', stickyBar: true, breadcrumbs: true }, productBlocks()),
  section('related', 'related-products', 'carousel', 'soft'),
  section('recent', 'recently-viewed', 'carousel', 'light'),
]);

function pages(store: StoreInfo): TemplatePage[] {
  return [
    {
      title: 'About us', slug: 'about', showInNav: true, showInFooter: true,
      layout: page([
        section('story', 'rich-text', 'narrow', 'light', {
          eyebrow: 'About us', heading: store.name, align: 'center',
          content: richText(`<p>${escapeHtml(store.description || 'Tell shoppers who you are, what inspires your designs and how each piece is made.')}</p>`),
        }),
        section('newsletter', 'newsletter', 'card', 'soft', { askName: true }),
      ]),
    },
    {
      title: 'FAQ', slug: 'faq', showInFooter: true,
      layout: page([
        section('faq', 'faq', 'accordion', 'light', { heading: 'Questions, answered', subtitle: 'Replace these answers with your own policies.' }, blocksOf('q', 'question', [
          { question: 'How do I find my size?', answer: 'Explain how your sizes run and link to your size guide.' },
          { question: 'How long does delivery take?', answer: 'Tell shoppers how long delivery usually takes and where you ship.' },
          { question: 'Can I return or exchange an item?', answer: 'Explain your return and exchange policy, including any time limit.' },
          { question: 'Do you take custom orders?', answer: 'Say whether you alter or make pieces to measure, and how to ask.' },
        ])),
        ...(store.whatsAppNumber ? [section('help', 'whatsapp-cta', 'card', 'soft', { heading: 'Need styling help?', buttonLabel: 'Chat on WhatsApp' })] : []),
      ]),
    },
    {
      title: 'Contact', slug: 'contact', showInFooter: true,
      layout: page([section('contact', 'contact-info', 'split', 'light', { heading: 'Get in touch', phone: phone(store), showWhatsApp: !!store.whatsAppNumber })]),
    },
  ];
}

const build: TemplateBuild = store => ({ site: site(store), home: home(store), collection: collection(), product: product(), pages: pages(store) });

export default build;
