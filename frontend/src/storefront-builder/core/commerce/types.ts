import type { StoreProduct } from '../types';

export interface ProductVariant {
  name: string;
  value: string;
  priceAdjustment: number;
}

/** Full product from `/public/{slug}/products/{id}` (normalised to the list shape + variants). */
export interface ProductDetail extends StoreProduct {
  variants: ProductVariant[];
  tags: string[];
}

export interface WholesaleTier {
  id: string;
  minQuantity: number;
  maxQuantity?: number | null;
  pricePerUnit: number;
  label?: string | null;
}

export interface ProductReview {
  id: string;
  reviewerName: string;
  rating: number;
  comment?: string | null;
  createdAt?: string;
}

export interface ProductReviews {
  items: ProductReview[];
  averageRating: number;
  totalCount: number;
}

export interface CheckoutCustomer {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface OrderLine {
  productId: string;
  productTitle: string;
  variantInfo?: string;
  quantity: number;
  unitPrice: number;
}
