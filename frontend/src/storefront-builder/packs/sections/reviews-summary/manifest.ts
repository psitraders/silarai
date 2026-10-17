import type { PackManifest } from '../../../core/types';

export interface ReviewsSummarySettings {
  eyebrow: string;
  heading: string;
  subtitle: string;
  /** How many recent reviews to show (0–12). */
  limit: number;
  /** Only show reviews with at least this many stars (the average always counts every approved review). */
  minRating: number;
  showDistribution: boolean;
  showProduct: boolean;
}

/**
 * Store-wide review summary: average rating, star distribution and the latest approved
 * reviews from every product (Phase 3 follow-up). Data comes live from approved reviews.
 */
const manifest: PackManifest<ReviewsSummarySettings> = {
  kind: 'section',
  id: 'reviews-summary',
  name: 'Reviews summary',
  version: 1,
  tier: 'free',
  defaults: {
    eyebrow: 'Reviews',
    heading: 'Loved by our customers',
    subtitle: '',
    limit: 6,
    minRating: 4,
    showDistribution: true,
    showProduct: true,
  },
  defaultLayout: 'summary',
  layouts: {
    summary: { name: 'Rating + reviews', load: () => import('./layouts/Summary') },
    carousel: { name: 'Review carousel', load: () => import('./layouts/Carousel') },
    badge: { name: 'Rating badge', load: () => import('./layouts/Badge') },
  },
};

export default manifest;
