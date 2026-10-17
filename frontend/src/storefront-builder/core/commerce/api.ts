/**
 * Public commerce endpoints used by product blocks (the same calls the old
 * quick-view made). Packs reach these only through the hooks in this folder.
 */
import axios from 'axios';
import { API_BASE_URL as BASE_URL } from '../data/api';
import type { OrderLine, ProductReviews, WholesaleTier } from './types';

/** Reads the error text our API returns in its different shapes. */
export function apiError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const d = err.response?.data as { errors?: string[]; message?: string; error?: string; detail?: string } | undefined;
    return d?.errors?.[0] ?? d?.message ?? d?.error ?? d?.detail ?? fallback;
  }
  return err instanceof Error && err.message ? err.message : fallback;
}

const bearer = (token?: string | null) => (token ? { Authorization: `Bearer ${token}` } : undefined);

export const commerceApi = {
  wholesaleTiers: (slug: string, productId: string) =>
    axios.get<WholesaleTier[]>(`${BASE_URL}/public/${slug}/products/${productId}/wholesale-tiers`).then(r => r.data ?? []),

  reviews: (slug: string, productId: string) =>
    axios.get<ProductReviews>(`${BASE_URL}/public/${slug}/products/${productId}/reviews`).then(r => r.data),

  submitReview: (slug: string, productId: string, body: { reviewerName: string; reviewerEmail?: string; reviewerPhone?: string; rating: number; comment?: string }) =>
    axios.post(`${BASE_URL}/public/${slug}/products/${productId}/reviews`, body),

  sendCodOtp: (slug: string, email: string, customerName: string) =>
    axios.post(`${BASE_URL}/public/${slug}/cod-otp/send`, { email, customerName }),

  placeCodOrder: (slug: string, token: string | null | undefined, body: {
    customerName: string; customerPhone: string; customerEmail: string; emailOtp: string;
    deliveryAddress: string | null; notes: string | null; items: OrderLine[];
  }) =>
    axios.post<{ orderId: string }>(`${BASE_URL}/public/${slug}/cod-order`, body, { headers: bearer(token) }).then(r => r.data),

  /** WhatsApp-channel inquiry (also records the cart as an abandoned cart when one is sent). */
  inquiry: (slug: string, body: {
    customerName: string; customerPhone?: string; customerEmail?: string; productId?: string | null; message: string;
    cartItems?: { productTitle: string; unitPrice: number; quantity: number; variantInfo?: string | null }[];
  }) =>
    axios.post(`${BASE_URL}/public/${slug}/inquiry`, { ...body, channel: 1 }),
};
