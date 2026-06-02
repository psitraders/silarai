import { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { paymentApi } from '../../api/payment.api';

interface StoreData {
  name: string;
  logoUrl?: string;
  currency?: string;
  themeColor: string;
  razorpayEnabled?: boolean;
  razorpayKeyId?: string;
  whatsAppNumber?: string;
  whatsAppCtaLabel?: string;
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  store: StoreData;
  slug: string;
}

type Step = 'cart' | 'details' | 'success';

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const script  = document.createElement('script');
    script.src    = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export function CartDrawer({ open, onClose, store, slug }: CartDrawerProps) {
  const { items, totalItems, totalAmount, removeItem, updateQty, clearCart } = useCart();
  const currency = store.currency ?? 'INR';
  const tc       = store.themeColor;

  const [step, setStep]             = useState<Step>('cart');
  const [name, setName]             = useState('');
  const [phone, setPhone]           = useState('');
  const [email, setEmail]           = useState('');
  const [address, setAddress]       = useState('');
  const [paying, setPaying]         = useState(false);
  const [payError, setPayError]     = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  // Coupon state
  const [couponCode, setCouponCode]       = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError]     = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const finalAmount = Math.max(0, totalAmount - couponDiscount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await fetch(`${BASE_URL}/public/${slug}/validate-coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), orderTotal: totalAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.errors?.[0] ?? data?.detail ?? data?.title ?? 'Invalid coupon code');
      setCouponDiscount(data.discount ?? 0);
    } catch (err: any) {
      setCouponError(err.message ?? 'Invalid coupon code');
      setCouponDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setStep('cart'); setPayError(null);
      setCouponCode(''); setCouponDiscount(0); setCouponError(null);
    }, 300);
  };

  const handlePay = async () => {
    if (!name.trim()) { setPayError('Please enter your name.'); return; }
    if (!phone.trim()) { setPayError('Please enter your phone number.'); return; }
    setPayError(null);
    setPaying(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Could not load payment gateway. Please check your internet connection.');

      const order = await paymentApi.createOrder(slug, finalAmount, name, phone);

      const options = {
        key:         order.keyId,
        amount:      order.amount,
        currency:    order.currency,
        name:        order.businessName,
        description: `Order from ${order.businessName}`,
        image:       store.logoUrl,
        order_id:    order.razorpayOrderId,
        prefill:     { name, contact: phone, email },
        theme:       { color: tc },
        handler: async (response: any) => {
          try {
            const result = await paymentApi.verifyPayment(slug, {
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              customerName:      name,
              customerPhone:     phone,
              customerEmail:     email || undefined,
              deliveryAddress:   address || undefined,
              items: items.map(i => ({
                productId:    i.productId,
                productTitle: i.productTitle,
                variantInfo:  undefined,
                quantity:     i.quantity,
                unitPrice:    i.unitPrice,
              })),
            });
            setOrderNumber(result.orderNumber);
            setStep('success');
            clearCart();
          } catch {
            setPayError('Payment received but order confirmation failed. Please contact the store on WhatsApp.');
          } finally {
            setPaying(false);
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setPayError(err?.message ?? 'Payment failed. Please try again.');
      setPaying(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" style={{ color: tc }} />
            <h2 className="font-bold text-slate-900 text-lg">
              {step === 'cart' ? `Your Cart (${totalItems})` :
               step === 'details' ? 'Delivery Details' :
               'Order Confirmed!'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Cart Step ── */}
        {step === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <ShoppingBag className="w-14 h-14 text-slate-200 mb-4" />
                  <p className="text-slate-500 font-medium">Your cart is empty</p>
                  <p className="text-xs text-slate-400 mt-1">Add products to get started</p>
                </div>
              ) : items.map(item => (
                <div key={item.productId} className="flex gap-3 bg-slate-50 rounded-2xl p-3">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                    {item.primaryImage
                      ? <img src={item.primaryImage} alt={item.productTitle} className="w-full h-full object-cover" />
                      : <ShoppingBag className="w-8 h-8 text-slate-300 m-auto mt-4" />}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    {item.categoryName && (
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">{item.categoryName}</p>
                    )}
                    <p className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">{item.productTitle}</p>
                    <p className="text-sm font-bold mt-1" style={{ color: tc }}>
                      {formatCurrency(item.unitPrice * item.quantity, currency)}
                    </p>
                  </div>

                  {/* Quantity + Remove */}
                  <div className="flex flex-col items-end justify-between gap-1">
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-1 text-slate-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                        disabled={item.stockQuantity != null && item.quantity >= item.stockQuantity}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Footer */}
            {items.length > 0 && (
              <div className="border-t border-slate-100 px-5 py-4 space-y-3">
                {/* Coupon input */}
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={e => { setCouponCode(e.target.value); setCouponDiscount(0); setCouponError(null); }}
                    placeholder="Coupon code"
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 uppercase"
                    style={{ '--tw-ring-color': tc } as any}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-3 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
                    style={{ backgroundColor: tc }}
                  >
                    {couponLoading ? '…' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                {couponDiscount > 0 && (
                  <p className="text-xs text-green-600 font-medium">✓ Coupon applied! You save {formatCurrency(couponDiscount, currency)}</p>
                )}

                {/* Totals */}
                {couponDiscount > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-700">
                    <span>Discount</span>
                    <span>-{formatCurrency(couponDiscount, currency)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Total</span>
                  <span className="text-xl font-bold" style={{ color: tc }}>
                    {formatCurrency(finalAmount, currency)}
                  </span>
                </div>

                {store.razorpayEnabled ? (
                  <button
                    onClick={() => setStep('details')}
                    className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
                    style={{ backgroundColor: tc }}
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-center text-slate-400">Online payment not enabled for this store</p>
                    {store.whatsAppNumber && (
                      <a
                        href={`https://wa.me/${store.whatsAppNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hi! I'd like to order the following:\n\n${items.map(i => `• ${i.productTitle} x${i.quantity} — ${formatCurrency(i.unitPrice * i.quantity, currency)}`).join('\n')}\n\nTotal: ${formatCurrency(finalAmount, currency)}${couponDiscount > 0 ? ` (Coupon: ${couponCode} applied)` : ''}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2"
                        style={{ backgroundColor: tc }}
                      >
                        Order via WhatsApp
                      </a>
                    )}
                  </div>
                )}
                <p className="text-[10px] text-slate-400 text-center">
                  {store.razorpayEnabled ? '🔒 Secured by Razorpay' : ''}
                </p>
              </div>
            )}
          </>
        )}

        {/* ── Details Step ── */}
        {step === 'details' && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Order summary */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Order Summary</p>
                {items.map(i => (
                  <div key={i.productId} className="flex justify-between text-sm">
                    <span className="text-slate-700 truncate flex-1 mr-2">{i.productTitle} ×{i.quantity}</span>
                    <span className="font-semibold text-slate-900 flex-shrink-0">
                      {formatCurrency(i.unitPrice * i.quantity, currency)}
                    </span>
                  </div>
                ))}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Discount ({couponCode})</span>
                    <span>-{formatCurrency(couponDiscount, currency)}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span style={{ color: tc }}>{formatCurrency(finalAmount, currency)}</span>
                </div>
              </div>

              {/* Customer form */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-900">Your Details</p>

                {payError && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-xs text-red-600">
                    {payError}
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Full Name *</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': tc } as any}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Phone Number *</label>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    type="tel"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Email (optional)</label>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    type="email"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Delivery Address (optional)</label>
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="House no, Street, City, Pincode"
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Checkout Footer */}
            <div className="border-t border-slate-100 px-5 py-4 space-y-2">
              <button
                onClick={handlePay}
                disabled={paying || !name || !phone}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                style={{ backgroundColor: tc }}
              >
                {paying ? 'Opening payment...' : `Pay ${formatCurrency(finalAmount, currency)} securely`}
              </button>
              <button
                onClick={() => setStep('cart')}
                className="w-full py-2 text-sm text-slate-500 hover:text-slate-700"
              >
                ← Back to cart
              </button>
              <p className="text-[10px] text-center text-slate-400">🔒 Secured by Razorpay</p>
            </div>
          </>
        )}

        {/* ── Success Step ── */}
        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10 gap-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: `${tc}22` }}>
              <CheckCircle2 className="w-10 h-10" style={{ color: tc }} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Payment Successful!</h3>
              <p className="text-sm text-slate-500 mt-1">Your order has been placed.</p>
              {orderNumber && (
                <div className="mt-3 bg-slate-50 rounded-xl px-4 py-2 inline-block">
                  <p className="text-xs text-slate-500">Order Number</p>
                  <p className="font-bold text-slate-900">{orderNumber}</p>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500">
              We'll contact you on <strong>{phone}</strong> shortly to confirm your order.
            </p>
            {store.whatsAppNumber && (
              <a
                href={`https://wa.me/${store.whatsAppNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi! I just placed order ${orderNumber}. Looking forward to it!`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-2xl text-white font-semibold text-sm"
                style={{ backgroundColor: tc }}
              >
                Chat on WhatsApp
              </a>
            )}
            <button onClick={handleClose} className="text-sm text-slate-400 hover:text-slate-600">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
