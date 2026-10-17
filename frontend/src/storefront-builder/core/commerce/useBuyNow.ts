/**
 * "Buy now" checkout for one product line, unchanged in behaviour from the old
 * quick-view: Razorpay online payment, or cash on delivery confirmed with an
 * email OTP (B2B bearer token lets the server apply wholesale prices).
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentApi } from '../../../api/payment.api';
import { useStorefrontAuth } from '../../../context/StorefrontAuthContext';
import { gtagEvent } from '../analytics';
import { useStorefront } from '../storefront-context';
import { apiError, commerceApi } from './api';
import { loadRazorpay, type RazorpayResponse } from './razorpay';
import type { CheckoutCustomer, OrderLine } from './types';
import { useProductSurface, type ProductController } from './useProductController';

export type PayMethod = 'razorpay' | 'cod';
export type OtpStep = 'idle' | 'sending' | 'awaiting';

export interface BuyNow {
  method: PayMethod;
  setMethod: (m: PayMethod) => void;
  canPayOnline: boolean;
  customer: CheckoutCustomer;
  setField: (key: keyof CheckoutCustomer, value: string) => void;
  otpStep: OtpStep;
  otp: string;
  setOtp: (v: string) => void;
  error: string | null;
  otpError: string | null;
  busy: boolean;
  /** Unit and total for the current quantity. */
  unit: number;
  total: number;
  /** Online: opens Razorpay. COD: sends the email code. */
  submit: () => Promise<void>;
  /** COD step 2: places the order with the code. */
  confirm: () => Promise<void>;
  resetOtp: () => void;
}

const PREVIEW_MSG = 'Checkout is turned off in the editor preview.';

export function useBuyNow(ctl: ProductController): BuyNow {
  const { slug, store, links, brandColor } = useStorefront();
  const { customer: account } = useStorefrontAuth();
  const surface = useProductSurface();
  const navigate = useNavigate();
  const canPayOnline = !!store.razorpayEnabled;
  const [method, setMethodState] = useState<PayMethod>(canPayOnline ? 'razorpay' : 'cod');
  const [customer, setCustomer] = useState<CheckoutCustomer>({ name: account?.name ?? '', phone: '', email: account?.email ?? '', address: '' });
  const [otpStep, setOtpStep] = useState<OtpStep>('idle');
  const [otp, setOtpState] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { product, quantity, variantInfo } = ctl;
  const unit = ctl.unitFor(quantity);
  const total = unit * quantity;
  const currency = store.currency ?? 'INR';
  const line: OrderLine = { productId: product.id, productTitle: product.title, variantInfo, quantity, unitPrice: unit };

  const resetOtp = () => { setOtpStep('idle'); setOtpState(''); setOtpError(null); };
  const setMethod = (m: PayMethod) => { setMethodState(m); resetOtp(); setError(null); };
  const setField = (key: keyof CheckoutCustomer, value: string) => { setCustomer(c => ({ ...c, [key]: value })); setError(null); };
  const setOtp = (v: string) => { setOtpState(v.replace(/\D/g, '').slice(0, 6)); setOtpError(null); };

  const validate = (needEmail: boolean) => {
    if (!ctl.allSelected) return `Please choose a ${ctl.missingGroup?.toLowerCase()}.`;
    if (!customer.name.trim()) return 'Please enter your name.';
    if (!customer.phone.trim()) return 'Please enter your phone number.';
    if (needEmail && !customer.email.trim()) return 'Please enter your email address.';
    return null;
  };

  const done = (orderId: string, paymentType: 'online' | 'cod') => {
    gtagEvent('purchase', {
      transaction_id: orderId,
      value: total,
      currency,
      payment_type: paymentType,
      items: [{ item_id: product.id, item_name: product.title, price: unit, quantity }],
    });
    navigate(links.orderConfirmation(orderId));
    surface.close?.();
  };

  const payOnline = async () => {
    setBusy(true);
    try {
      if (!(await loadRazorpay())) throw new Error('Could not load Razorpay. Check your internet connection.');
      const order = await paymentApi.createOrder(slug, total, customer.name, customer.phone);
      const Razorpay = (window as unknown as { Razorpay: new (o: unknown) => { open: () => void } }).Razorpay;
      new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: order.businessName,
        description: product.title,
        image: store.logoUrl,
        order_id: order.razorpayOrderId,
        prefill: { name: customer.name, contact: customer.phone, email: customer.email },
        theme: { color: brandColor },
        handler: async (res: RazorpayResponse) => {
          try {
            const result = await paymentApi.verifyPayment(slug, {
              razorpayOrderId: res.razorpay_order_id,
              razorpayPaymentId: res.razorpay_payment_id,
              razorpaySignature: res.razorpay_signature,
              customerName: customer.name,
              customerPhone: customer.phone,
              customerEmail: customer.email || undefined,
              deliveryAddress: customer.address || undefined,
              items: [line],
            });
            done(result.orderId, 'online');
          } catch {
            setError('Payment verified but order creation failed. Please contact us on WhatsApp.');
          } finally { setBusy(false); }
        },
        modal: { ondismiss: () => setBusy(false) },
      }).open();
    } catch (err) {
      setError(apiError(err, 'Payment failed. Please try again.'));
      setBusy(false);
    }
  };

  const submit = async () => {
    if (ctl.preview) { setError(PREVIEW_MSG); return; }
    const invalid = validate(method === 'cod');
    if (invalid) { setError(invalid); return; }
    setError(null);
    if (method === 'razorpay') { await payOnline(); return; }
    setOtpError(null);
    setOtpStep('sending');
    try {
      await commerceApi.sendCodOtp(slug, customer.email.trim(), customer.name.trim());
      setOtpStep('awaiting');
    } catch (err) {
      setError(apiError(err, 'Failed to send verification code.'));
      setOtpStep('idle');
    }
  };

  const confirm = async () => {
    if (ctl.preview) { setError(PREVIEW_MSG); return; }
    const invalid = validate(true);
    if (invalid) { setError(invalid); return; }
    if (otp.length !== 6) { setOtpError('Please enter the 6-digit code.'); return; }
    setError(null); setOtpError(null); setBusy(true);
    try {
      const data = await commerceApi.placeCodOrder(slug, account?.accessToken, {
        customerName: customer.name.trim(),
        customerPhone: customer.phone.trim(),
        customerEmail: customer.email.trim(),
        emailOtp: otp,
        deliveryAddress: customer.address.trim() || null,
        notes: null,
        items: [line],
      });
      done(data.orderId, 'cod');
    } catch (err) {
      const msg = apiError(err, 'Order failed. Please try again.');
      if (msg.toLowerCase().includes('verification code')) setOtpError(msg); else setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return { method, setMethod, canPayOnline, customer, setField, otpStep, otp, setOtp, error, otpError, busy, unit, total, submit, confirm, resetOtp };
}
