import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, AlertCircle, CreditCard, Truck } from 'lucide-react';
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
  isCustomDomain?: boolean;
}

type Step = 'cart' | 'details';
type PaymentMethod = 'razorpay' | 'cod';

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

const BASE_URL = import.meta.env.VITE_API_URL || 'https://silarai-fbahb2bsg4cng3hq.southindia-01.azurewebsites.net/api/v1';

export function CartDrawer({ open, onClose, store, slug, isCustomDomain }: CartDrawerProps) {
  const { items, totalItems, totalAmount, removeItem, updateQty, clearCart } = useCart();
  const navigate  = useNavigate();
  const currency  = store.currency ?? 'INR';
  const tc        = store.themeColor;
  const confirmBase = isCustomDomain ? `/order-confirmation` : `/${slug}/order-confirmation`;

  const [step, setStep]           = useState<Step>('cart');
  const [payMethod, setPayMethod] = useState<PaymentMethod>(store.razorpayEnabled ? 'razorpay' : 'cod');
  const [name, setName]           = useState('');
  const [phone, setPhone]         = useState('');
  const [email, setEmail]         = useState('');
  const [address, setAddress]     = useState('');
  const [paying, setPaying]       = useState(false);
  const [payError, setPayError]   = useState<string | null>(null);
  // COD email OTP
  const [otpStep, setOtpStep]     = useState<'idle' | 'sending' | 'awaiting'>('idle');
  const [otpCode, setOtpCode]     = useState('');
  const [otpError, setOtpError]   = useState<string | null>(null);
  const resetOtp = () => { setOtpStep('idle'); setOtpCode(''); setOtpError(null); };

  // Coupon state
  const [couponCode, setCouponCode]         = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError]       = useState<string | null>(null);
  const [couponLoading, setCouponLoading]   = useState(false);

  const finalAmount = Math.max(0, totalAmount - couponDiscount);

  // OOS detection
  const oosItems = items.filter(i => i.stockQuantity != null && i.stockQuantity <= 0);
  const hasOos   = oosItems.length > 0;

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
    setTimeout(() => {
      setStep('cart'); setPayError(null);
      setCouponCode(''); setCouponDiscount(0); setCouponError(null);
      resetOtp();
    }, 300);
  };

  /** Step 1 — send OTP to email */
  const handleSendOtp = async () => {
    if (!name.trim())  { setPayError('Please enter your name.');          return; }
    if (!phone.trim()) { setPayError('Please enter your phone number.');  return; }
    if (!email.trim()) { setPayError('Please enter your email address.'); return; }
    setPayError(null); setOtpError(null); setOtpStep('sending');
    try {
      const res = await fetch(`${BASE_URL}/public/${slug}/cod-otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), customerName: name.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'Failed to send code.');
      setOtpStep('awaiting');
    } catch (err: any) {
      setPayError(err.message ?? 'Failed to send verification code.');
      setOtpStep('idle');
    }
  };

  /** Step 2 — place order with OTP */
  const handleCodOrder = async () => {
    if (!name.trim())    { setPayError('Please enter your name.');          return; }
    if (!phone.trim())   { setPayError('Please enter your phone number.');  return; }
    if (!email.trim())   { setPayError('Please enter your email address.'); return; }
    if (!otpCode.trim()) { setOtpError('Please enter the 6-digit code.');   return; }
    setPayError(null); setOtpError(null);
    setPaying(true);
    try {
      const res = await fetch(`${BASE_URL}/public/${slug}/cod-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: phone.trim(),
          customerEmail: email.trim(),
          emailOtp: otpCode.trim(),
          deliveryAddress: address.trim() || null,
          notes: null,
          items: items.map(i => ({
            productId: i.productId,
            productTitle: i.productTitle,
            variantInfo: null,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.errors?.[0] ?? data?.message ?? 'Order failed. Please try again.';
        if (msg.toLowerCase().includes('verification code')) {
          setOtpError(msg);
        } else {
          setPayError(msg);
        }
        return;
      }
      clearCart();
      handleClose();
      navigate(`${confirmBase}/${data.orderId}`);
    } catch (err: any) {
      setPayError(err.message ?? 'Order failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const handleRazorpayPay = async () => {
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
            clearCart();
            handleClose();
            navigate(`${confirmBase}/${result.orderId}`);
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={handleClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" style={{ color: tc }} />
            <h2 className="font-bold text-slate-900 text-lg">
              {step === 'cart' ? `Your Cart (${totalItems})` : 'Delivery Details'}
            </h2>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500">
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
              ) : items.map(item => {
                const isOos = item.stockQuantity != null && item.stockQuantity <= 0;
                return (
                  <div
                    key={item.productId}
                    className={`flex gap-3 rounded-2xl p-3 ${isOos ? 'bg-red-50 border border-red-200' : 'bg-slate-50'}`}
                  >
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
                      {isOos ? (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold mt-1">
                          <AlertCircle className="w-3 h-3" /> Out of Stock
                        </span>
                      ) : (
                        <p className="text-sm font-bold mt-1" style={{ color: tc }}>
                          {formatCurrency(item.unitPrice * item.quantity, currency)}
                        </p>
                      )}
                    </div>

                    {/* Quantity + Remove */}
                    <div className="flex flex-col items-end justify-between gap-1">
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1 text-slate-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {!isOos && (
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
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Footer */}
            {items.length > 0 && (
              <div className="border-t border-slate-100 px-5 py-4 space-y-3">
                {hasOos && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-xs text-red-600 font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Remove out-of-stock items before checking out.
                  </div>
                )}

                {/* Coupon input */}
                {!hasOos && (
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
                )}
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

                <button
                  onClick={() => setStep('details')}
                  disabled={hasOos}
                  className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: tc }}
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>

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

              {/* Payment method selector */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-900">Payment Method</p>
                <div className="grid grid-cols-2 gap-2">
                  {store.razorpayEnabled && (
                    <button
                      type="button"
                      onClick={() => { setPayMethod('razorpay'); resetOtp(); }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-colors ${
                        payMethod === 'razorpay' ? 'border-current text-white' : 'border-slate-200 text-slate-600 bg-white'
                      }`}
                      style={payMethod === 'razorpay' ? { backgroundColor: tc, borderColor: tc } : undefined}
                    >
                      <CreditCard className="w-5 h-5" />
                      Online Payment
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { setPayMethod('cod'); resetOtp(); }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-colors ${
                      payMethod === 'cod' ? 'border-current text-white' : 'border-slate-200 text-slate-600 bg-white'
                    } ${!store.razorpayEnabled ? 'col-span-2' : ''}`}
                    style={payMethod === 'cod' ? { backgroundColor: tc, borderColor: tc } : undefined}
                  >
                    <Truck className="w-5 h-5" />
                    Cash on Delivery
                  </button>
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
                  <label className="text-xs font-medium text-slate-600 mb-1 block">
                    Email {payMethod === 'cod' ? '* (required for order verification)' : '(optional)'}
                  </label>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    type="email"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': tc } as any}
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

              {/* OTP awaiting step */}
              {payMethod === 'cod' && otpStep === 'awaiting' ? (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-3 text-xs text-amber-800">
                    📧 A 6-digit code was sent to <strong>{email}</strong>. Enter it below to confirm your order.
                  </div>
                  <input
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={e => { setOtpCode(e.target.value.replace(/\D/g,'').slice(0,6)); setOtpError(null); }}
                    maxLength={6}
                    inputMode="numeric"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-center tracking-[0.4em] font-bold focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': tc } as any}
                  />
                  {otpError && <p className="text-xs text-red-500 text-center">{otpError}</p>}
                  <button
                    onClick={handleCodOrder}
                    disabled={paying || otpCode.length !== 6}
                    className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                    style={{ backgroundColor: tc }}
                  >
                    {paying ? 'Placing order...' : `✅ Verify & Place Order · ${formatCurrency(finalAmount, currency)} COD`}
                  </button>
                  <button
                    onClick={() => { resetOtp(); }}
                    className="w-full py-2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    ← Change email or resend code
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={payMethod === 'cod' ? handleSendOtp : handleRazorpayPay}
                    disabled={paying || otpStep === 'sending' || !name || !phone || (payMethod === 'cod' && !email)}
                    className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                    style={{ backgroundColor: tc }}
                  >
                    {otpStep === 'sending'
                      ? 'Sending code...'
                      : paying
                        ? 'Opening payment...'
                        : payMethod === 'cod'
                          ? `Continue · Send Verification Code`
                          : `Pay ${formatCurrency(finalAmount, currency)} securely`}
                  </button>
                  {payMethod === 'cod' && (
                    <p className="text-[10px] text-center text-slate-400">
                      🔒 A one-time code will be sent to your email to prevent fake orders
                    </p>
                  )}
                  {payMethod === 'razorpay' && (
                    <p className="text-[10px] text-center text-slate-400">🔒 Secured by Razorpay</p>
                  )}
                  <button
                    onClick={() => { setStep('cart'); setPayError(null); resetOtp(); }}
                    className="w-full py-2 text-sm text-slate-500 hover:text-slate-700"
                  >
                    ← Back to cart
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
