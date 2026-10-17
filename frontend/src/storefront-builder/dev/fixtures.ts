/** Offline sample data for the dev gallery — no API needed. */
import type { NavPage, StoreCategory, StoreInfo, StoreProduct } from '../core/types';

const swatch = (hue: number, label: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 70% 72%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360} 60% 52%)"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="52%" font-family="sans-serif" font-size="34" fill="white" text-anchor="middle">${label}</text></svg>`,
  )}`;

export const FIXTURE_STORE: StoreInfo = {
  name: 'Aurora Atelier',
  description: 'Handcrafted pieces made in small batches in Jaipur.',
  whatsAppNumber: '919876543210',
  instagramHandle: '@aurora.atelier',
  currency: 'INR',
  themeColor: '#0F766E',
  secondaryColor: '#134E4A',
  announcementText: 'Free delivery on orders above ₹999',
  allowsCustomBranding: false,
  b2bEnabled: false,
};

const names = ['Silk Scarf', 'Brass Earrings', 'Linen Kurta', 'Block-print Tote', 'Hand-painted Mug', 'Cotton Saree', 'Terracotta Lamp', 'Jute Basket'];

export const FIXTURE_PRODUCTS: StoreProduct[] = names.map((title, i) => ({
  id: `00000000-0000-0000-0000-00000000000${i}`,
  slug: title.toLowerCase().replace(/\s+/g, '-'),
  title,
  basePrice: 799 + i * 350,
  discountedPrice: i % 3 === 0 ? 599 + i * 300 : null,
  isFeatured: i < 5,
  stockQuantity: i === 6 ? 0 : 12,
  isOutOfStock: i === 6,
  primaryImage: swatch(i * 45, title),
  allImages: [swatch(i * 45, title), swatch(i * 45 + 20, `${title} 2`)],
  categoryName: i % 2 ? 'Home' : 'Fashion',
  categoryId: i % 2 ? 'cat-home' : 'cat-fashion',
}));

export const FIXTURE_CATEGORIES: StoreCategory[] = [
  { id: 'cat-fashion', name: 'Fashion', isFeatured: true, imageUrl: swatch(320, 'Fashion'), subCategories: [{ id: 'sub-scarves', name: 'Scarves' }] },
  { id: 'cat-home', name: 'Home', isFeatured: true, imageUrl: swatch(30, 'Home'), subCategories: [] },
  { id: 'cat-gifts', name: 'Gifts', isFeatured: false, imageUrl: null, subCategories: [] },
  { id: 'cat-jewellery', name: 'Jewellery', isFeatured: false, imageUrl: swatch(200, 'Jewellery'), subCategories: [] },
];

export const FIXTURE_PAGES: NavPage[] = [
  { id: 'p1', title: 'Our story', slug: 'our-story', showInNav: true, showInFooter: true },
  { id: 'p2', title: 'Shipping', slug: 'shipping', showInNav: false, showInFooter: true },
];

export const FIXTURE_RICH_TEXT =
  '<h2>Made by hand</h2><p>Every piece is made by artisans we know by name. <a href="/p/our-story">Read our story</a>.</p><ul><li>Natural dyes</li><li>Plastic-free packaging</li></ul>';

/** The product the gallery's product-page sections show (with variants and spec lines). */
export const FIXTURE_PRODUCT = {
  ...FIXTURE_PRODUCTS[0],
  description: 'Soft, breathable and made to last. Hand-finished in small batches.\n\nMaterial: Organic cotton\nFit: Relaxed\nCare: Machine wash cold',
  stockQuantity: 4,
  variants: [
    { name: 'Size', value: 'S', priceAdjustment: 0 },
    { name: 'Size', value: 'M', priceAdjustment: 0 },
    { name: 'Size', value: 'L', priceAdjustment: 100 },
    { name: 'Colour', value: 'Navy', priceAdjustment: 0 },
    { name: 'Colour', value: 'Maroon', priceAdjustment: 0 },
  ],
  tags: [],
};
