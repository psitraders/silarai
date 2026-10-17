/**
 * Inquiry form state (product "Send inquiry" block and the enquiry-form section).
 * Posts to the existing public inquiry endpoint; the cart rides along so the
 * merchant can follow up on an abandoned cart, as before.
 */
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { useStorefront } from '../storefront-context';
import { apiError, commerceApi } from './api';
import type { ProductReviews } from './types';

export interface InquiryFields { name: string; phone: string; email: string; message: string }

export function useInquiry({ productId = null, defaultMessage = '', details = '', preview = false, swallowErrors = false }: {
  productId?: string | null;
  defaultMessage?: string;
  /** Structured details sent above the shopper's message (e.g. a custom cake request's date and size). */
  details?: string;
  preview?: boolean;
  /** Product inquiries always show success (old behaviour); the enquiry form reports errors. */
  swallowErrors?: boolean;
} = {}) {
  const { slug } = useStorefront();
  const { items } = useCart();
  const [fields, setFields] = useState<InquiryFields>({ name: '', phone: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => commerceApi.inquiry(slug, {
      customerName: fields.name.trim(),
      customerPhone: fields.phone.trim() || undefined,
      customerEmail: fields.email.trim() || undefined,
      productId,
      message: [details.trim(), fields.message.trim() || defaultMessage].filter(Boolean).join('\n\n'),
      cartItems: items.length ? items.map(i => ({ productTitle: i.productTitle, unitPrice: i.unitPrice, quantity: i.quantity, variantInfo: i.variantInfo ?? null })) : undefined,
    }),
    onSuccess: () => setSent(true),
    onError: err => { if (swallowErrors) setSent(true); else setError(apiError(err, 'Could not send your message. Please try again.')); },
  });

  const set = (key: keyof InquiryFields, value: string) => { setFields(f => ({ ...f, [key]: value })); setError(null); };
  const submit = () => {
    if (!fields.name.trim()) { setError('Please enter your name.'); return; }
    if (preview) { setError('Messages are not sent from the editor preview.'); return; }
    mutation.mutate();
  };
  const reset = () => { setSent(false); setFields(f => ({ ...f, message: '' })); };

  return { fields, set, submit, sent, reset, error, busy: mutation.isPending };
}

export function useProductReviews(productId: string, enabled = true) {
  const { slug } = useStorefront();
  return useQuery<ProductReviews>({
    queryKey: ['public-reviews', slug, productId],
    queryFn: () => commerceApi.reviews(slug, productId),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

export function useSubmitReview(productId: string, preview = false) {
  const { slug } = useStorefront();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: (body: { reviewerName: string; reviewerEmail?: string; reviewerPhone?: string; rating: number; comment?: string }) =>
      commerceApi.submitReview(slug, productId, body),
    onSuccess: () => setDone(true),
    onError: err => setError(apiError(err, 'Failed to submit review.')),
  });
  return {
    submit: (body: Parameters<typeof mutation.mutate>[0]) => {
      setError(null);
      if (preview) { setError('Reviews are not sent from the editor preview.'); return; }
      mutation.mutate(body);
    },
    done,
    error,
    busy: mutation.isPending,
  };
}
