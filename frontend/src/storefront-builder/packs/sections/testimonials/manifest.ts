import type { PackManifest, SmartImage } from '../../../core/types';

export interface TestimonialsSettings { eyebrow: string; heading: string; subtitle: string }
export interface QuoteBlock { quote: string; name: string; detail: string; rating: number; image: SmartImage }
export const QUOTE_DEFAULTS: QuoteBlock = { quote: 'Lovely quality and super quick delivery!', name: 'Happy customer', detail: '', rating: 5, image: { $image: '' } };

const manifest: PackManifest<TestimonialsSettings> = {
  kind: 'section',
  id: 'testimonials',
  name: 'Testimonials',
  version: 1,
  tier: 'free',
  defaults: { eyebrow: '', heading: 'Loved by our customers', subtitle: '' },
  defaultLayout: 'cards',
  layouts: {
    cards: { name: 'Cards', load: () => import('./layouts/Cards') },
    carousel: { name: 'Carousel', load: () => import('./layouts/Carousel') },
    'big-quote': { name: 'Big quote', load: () => import('./layouts/BigQuote') },
  },
};

export default manifest;
