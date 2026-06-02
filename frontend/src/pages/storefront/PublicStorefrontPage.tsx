import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ShoppingBag, Search, MessageCircle, X, Star,
  Send, Bot, SlidersHorizontal, ArrowUpDown,
  Mail, Package, Sparkles, ChevronLeft, ChevronRight,
  Menu, Heart, Plus,
} from 'lucide-react';
import axios from 'axios';
import { formatCurrency } from '../../utils/formatCurrency';
import { generateWhatsAppLink, generateProductInquiryMessage } from '../../utils/whatsappLink';
import { PageLoader } from '../../components/ui/Spinner';
import { paymentApi } from '../../api/payment.api';
import { useCart } from '../../context/CartContext';
import { CartDrawer } from '../../components/storefront/CartDrawer';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// ── Types ─────────────────────────────────────────────────────────────────────

interface StoreData {
  name: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  whatsAppNumber?: string;
  instagramHandle?: string;
  facebookPageUrl?: string;
  currency?: string;
  themeColor: string;
  whatsAppCtaLabel?: string;
  razorpayEnabled?: boolean;
  announcementText?: string;       // null = hide bar entirely
  allowsCustomBranding?: boolean;  // true = hide "Powered by ReplyCart"
}

interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

interface Product {
  id: string;
  title: string;
  description?: string;
  basePrice: number;
  discountedPrice?: number;
  isFeatured: boolean;
  stockQuantity?: number;
  primaryImage?: string;
  allImages?: string[];
  categoryName?: string;
  categoryId?: string;
}

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  products?: Product[];
  quickReplies?: string[];
}

// ── Chatbot logic ─────────────────────────────────────────────────────────────

function buildBotResponse(
  input: string,
  products: Product[],
  store: StoreData,
): ChatMessage {
  const q = input.toLowerCase();

  if (q.match(/hi|hello|hey|namaste/)) {
    return {
      role: 'bot',
      text: `👋 Welcome to ${store.name}! I'm your shopping assistant. How can I help you today?`,
      quickReplies: ['Show featured products', 'What\'s on sale?', 'Help me find something'],
    };
  }
  if (q.match(/sale|discount|offer|deal/)) {
    const onSale = products.filter(p => p.discountedPrice && p.discountedPrice < p.basePrice).slice(0, 4);
    if (onSale.length) {
      return { role: 'bot', text: '🏷️ Here are our current offers:', products: onSale };
    }
    return { role: 'bot', text: 'No active sales right now, but all our products are great value! 😊', quickReplies: ['Show all products', 'Featured items'] };
  }
  if (q.match(/featured|popular|best|top/)) {
    const featured = products.filter(p => p.isFeatured).slice(0, 4);
    return { role: 'bot', text: '⭐ Our most loved items:', products: featured.length ? featured : products.slice(0, 4) };
  }
  if (q.match(/price|cheap|affordable|budget/)) {
    const affordable = [...products].sort((a, b) => (a.discountedPrice ?? a.basePrice) - (b.discountedPrice ?? b.basePrice)).slice(0, 4);
    return { role: 'bot', text: '💰 Here are our most affordable picks:', products: affordable };
  }
  if (q.match(/contact|phone|whatsapp|call|reach/)) {
    return {
      role: 'bot',
      text: `📱 You can reach us on WhatsApp at ${store.whatsAppNumber ?? 'the number listed'}. We typically reply within a few hours!`,
      quickReplies: ['Open WhatsApp', 'Browse products'],
    };
  }
  if (q.match(/return|refund|exchange|policy/)) {
    return { role: 'bot', text: '↩️ Please contact us on WhatsApp for any return or exchange queries. We\'re happy to help!', quickReplies: ['Open WhatsApp'] };
  }
  if (q.match(/delivery|ship|shipping/)) {
    return { role: 'bot', text: '🚚 We deliver across India! Reach out on WhatsApp for delivery timelines and charges.', quickReplies: ['Open WhatsApp'] };
  }

  // Search products
  const matches = products.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.categoryName?.toLowerCase().includes(q) ||
    p.description?.toLowerCase().includes(q)
  ).slice(0, 4);

  if (matches.length) {
    return { role: 'bot', text: `🔍 Found ${matches.length} product(s) matching "${input}":`, products: matches };
  }

  return {
    role: 'bot',
    text: `I couldn't find anything for "${input}" right now. Try browsing our categories or chat with us on WhatsApp!`,
    quickReplies: ['Show all products', 'Contact on WhatsApp'],
  };
}

// ── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({
  product, themeColor, store, onSelect, onAddToCart,
}: {
  product: Product;
  themeColor: string;
  store: StoreData;
  onSelect: (p: Product) => void;
  onAddToCart: (p: Product) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [addedFlash, setAddedFlash] = useState(false);
  const currency = store.currency ?? 'INR';
  const price = product.discountedPrice ?? product.basePrice;
  const discount = product.discountedPrice
    ? Math.round((1 - product.discountedPrice / product.basePrice) * 100)
    : 0;
  const outOfStock = product.stockQuantity !== undefined && product.stockQuantity !== null && product.stockQuantity <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 1200);
  };

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col"
      onClick={() => onSelect(product)}
    >
      <div className="relative aspect-square bg-slate-100 overflow-hidden">
        {product.primaryImage ? (
          <img
            src={product.primaryImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200">
            <ShoppingBag className="w-16 h-16" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5" /> Featured
            </span>
          )}
          {outOfStock && (
            <span className="bg-slate-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={e => { e.stopPropagation(); setLiked(l => !l); }}
          className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
        </button>

        {/* Quick action overlay */}
        <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          {!outOfStock && (
            <div className={`flex gap-1.5 ${store.whatsAppNumber ? '' : 'justify-center'}`}>
              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all ${
                  addedFlash ? 'bg-green-500 text-white' : 'bg-white text-slate-800 border border-slate-200'
                }`}
              >
                {addedFlash ? (
                  <><span>✓</span> Added!</>
                ) : (
                  <><Plus className="w-3 h-3" /> Cart</>
                )}
              </button>
              {/* WhatsApp */}
              {store.whatsAppNumber && (
                <a
                  href={generateWhatsAppLink(store.whatsAppNumber, generateProductInquiryMessage(product.title, store.name))}
                  target="_blank"
                  rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-white text-xs font-semibold shadow-lg"
                  style={{ backgroundColor: themeColor }}
                >
                  <MessageCircle className="w-3 h-3" /> Chat
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1">
        {product.categoryName && (
          <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mb-0.5">
            {product.categoryName}
          </span>
        )}
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 flex-1">{product.title}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold" style={{ color: themeColor }}>
            {formatCurrency(price, currency)}
          </span>
          {product.discountedPrice && (
            <span className="text-xs text-slate-400 line-through">
              {formatCurrency(product.basePrice, currency)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Product Detail Modal ──────────────────────────────────────────────────────

// ── Load Razorpay script lazily ───────────────────────────────────────────────

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface ProductVariant {
  name: string;
  value: string;
  priceAdjustment: number;
}

function ProductModal({
  product, store, themeColor, onClose,
}: { product: Product; store: StoreData; themeColor: string; onClose: () => void }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [showInquiry, setShowInquiry] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  // selected variant: map of variantName -> variantValue
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const currency = store.currency ?? 'INR';
  const slug = window.location.pathname.split('/')[1] ?? '';

  // Reviews state
  const [showReviewForm, setShowReviewForm]     = useState(false);
  const [reviewName, setReviewName]             = useState('');
  const [reviewEmail, setReviewEmail]           = useState('');
  const [reviewRating, setReviewRating]         = useState(5);
  const [reviewComment, setReviewComment]       = useState('');
  const [reviewSubmitted, setReviewSubmitted]   = useState(false);

  // Cart items (for abandoned cart tracking on inquiry)
  const { items: cartItems } = useCart();

  // Fetch full product detail (includes variants) from public endpoint
  const { data: productDetail } = useQuery({
    queryKey: ['public-product', slug, product.id],
    queryFn: () => axios.get(`${BASE_URL}/public/${slug}/products/${product.id}`).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch approved reviews for this product
  const { data: reviewsData } = useQuery({
    queryKey: ['public-reviews', slug, product.id],
    queryFn: () => axios.get(`${BASE_URL}/public/${slug}/products/${product.id}/reviews`).then(r => r.data),
    staleTime: 2 * 60 * 1000,
  });
  const publicReviews: any[] = reviewsData?.items ?? [];
  const avgRating: number    = reviewsData?.averageRating ?? 0;

  const handleSubmitReview = async () => {
    try {
      await axios.post(`${BASE_URL}/public/${slug}/products/${product.id}/reviews`, {
        reviewerName:  reviewName,
        reviewerEmail: reviewEmail || undefined,
        rating:        reviewRating,
        comment:       reviewComment || undefined,
      });
    } catch { /* show success anyway */ }
    setReviewSubmitted(true);
  };

  // Group variants by name: { Size: [{value:'S',priceAdj:0},{value:'M',...}], Color: [...] }
  const variantGroups: Record<string, ProductVariant[]> = {};
  if (productDetail?.variants) {
    for (const v of productDetail.variants as ProductVariant[]) {
      if (!variantGroups[v.name]) variantGroups[v.name] = [];
      variantGroups[v.name].push(v);
    }
  }

  // Total price adjustment from selected variants
  const priceAdjustment = Object.entries(selectedVariants).reduce((sum, [groupName, value]) => {
    const variant = variantGroups[groupName]?.find(v => v.value === value);
    return sum + (variant?.priceAdjustment ?? 0);
  }, 0);

  const images = product.allImages?.length ? product.allImages : product.primaryImage ? [product.primaryImage] : [];
  const basePrice = product.discountedPrice ?? product.basePrice;
  const price = basePrice + priceAdjustment;
  const discount = product.discountedPrice ? Math.round((1 - product.discountedPrice / product.basePrice) * 100) : 0;
  const outOfStock = product.stockQuantity !== undefined && product.stockQuantity !== null && product.stockQuantity <= 0;

  // Build variantInfo string for order e.g. "Size: M, Color: Red"
  const variantInfo = Object.entries(selectedVariants)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ') || undefined;

  const handleRazorpayCheckout = async () => {
    if (!name.trim()) { setPayError('Please enter your name.'); return; }
    if (!phone.trim()) { setPayError('Please enter your phone number.'); return; }
    setPayError(null);
    setPaying(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Could not load Razorpay. Check your internet connection.');

      const order = await paymentApi.createOrder(slug, price, name, phone);

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: order.businessName,
        description: product.title,
        image: store.logoUrl,
        order_id: order.razorpayOrderId,
        prefill: { name, contact: phone, email },
        theme: { color: themeColor },
        handler: async (response: any) => {
          try {
            const result = await paymentApi.verifyPayment(slug, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              customerName: name,
              customerPhone: phone,
              customerEmail: email || undefined,
              deliveryAddress: address || undefined,
              items: [{ productId: product.id, productTitle: product.title, variantInfo, quantity: 1, unitPrice: price }],
            });
            setOrderSuccess(result.orderNumber);
            setShowCheckout(false);
          } catch {
            setPayError('Payment verified but order creation failed. Please contact us on WhatsApp.');
          } finally { setPaying(false); }
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

  const handleInquiry = async () => {
    try {
      await axios.post(`${BASE_URL}/public/${slug}/inquiry`, {
        customerName:  name,
        customerPhone: phone,
        channel:       1, // WhatsApp
        productId:     product.id,
        message:       msg || `I'm interested in ${product.title}`,
        // Include cart items so the backend can track this as an abandoned cart
        cartItems: cartItems.length > 0
          ? cartItems.map(i => ({
              productTitle: i.productTitle,
              unitPrice:    i.unitPrice,
              quantity:     i.quantity,
              variantInfo:  i.variantInfo,
            }))
          : undefined,
      });
    } catch { /* fall through — show success either way */ }
    setSent(true);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[95vh] flex flex-col sm:flex-row">
        {/* Image gallery */}
        <div className="relative sm:w-1/2 bg-slate-100 aspect-square sm:aspect-auto sm:min-h-full flex-shrink-0">
          {images[imgIdx] ? (
            <img src={images[imgIdx]} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-20 h-20 text-slate-200" />
            </div>
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={() => setImgIdx(i => Math.max(0, i - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setImgIdx(i => Math.min(images.length - 1, i + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-white w-4' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}

          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 z-10">
            <X className="w-4 h-4" />
          </button>

          <div>
            {product.categoryName && (
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">{product.categoryName}</span>
            )}
            <h2 className="text-xl font-bold text-slate-900 mt-1">{product.title}</h2>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold" style={{ color: themeColor }}>{formatCurrency(price, currency)}</span>
            {product.discountedPrice && (
              <span className="text-base text-slate-400 line-through">{formatCurrency(product.basePrice, currency)}</span>
            )}
          </div>

          {product.description && (
            <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
          )}

          {/* Variant selectors */}
          {Object.entries(variantGroups).map(([groupName, variants]) => (
            <div key={groupName}>
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                {groupName}
                {selectedVariants[groupName] && (
                  <span className="ml-2 font-normal text-slate-500 normal-case tracking-normal">
                    — {selectedVariants[groupName]}
                    {(variantGroups[groupName].find(v => v.value === selectedVariants[groupName])?.priceAdjustment ?? 0) !== 0 &&
                      ` (${(variantGroups[groupName].find(v => v.value === selectedVariants[groupName])!.priceAdjustment > 0 ? '+' : '')}${formatCurrency(variantGroups[groupName].find(v => v.value === selectedVariants[groupName])!.priceAdjustment, currency)})`
                    }
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map(v => {
                  const isSelected = selectedVariants[groupName] === v.value;
                  return (
                    <button
                      key={v.value}
                      onClick={() => setSelectedVariants(prev => ({ ...prev, [groupName]: v.value }))}
                      className={`px-3 py-1.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-current text-white'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                      style={isSelected ? { borderColor: themeColor, backgroundColor: themeColor } : {}}
                    >
                      {v.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {outOfStock && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Package className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-500 font-medium">Out of Stock</span>
            </div>
          )}

          {/* Actions */}
          {orderSuccess ? (
            <div className="mt-auto border border-green-200 bg-green-50 rounded-2xl p-4 text-center space-y-1">
              <p className="text-green-700 font-semibold text-sm">🎉 Order Placed!</p>
              <p className="text-green-600 text-xs">Order #{orderSuccess} confirmed. We'll contact you shortly.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-auto">
              {/* Buy Now — Razorpay */}
              {!outOfStock && (
                <button
                  onClick={() => { setShowCheckout(s => !s); setShowInquiry(false); setPayError(null); }}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold text-sm"
                  style={{ backgroundColor: themeColor }}
                >
                  💳 Buy Now — {formatCurrency(price, currency)}{variantInfo ? ` · ${variantInfo}` : ''}
                </button>
              )}

              {store.whatsAppNumber && !outOfStock && (
                <a
                  href={generateWhatsAppLink(store.whatsAppNumber, generateProductInquiryMessage(product.title, store.name))}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-sm font-semibold"
                  style={{ borderColor: themeColor, color: themeColor }}
                >
                  <MessageCircle className="w-4 h-4" />
                  {store.whatsAppCtaLabel ?? 'Order on WhatsApp'}
                </a>
              )}

              <button
                onClick={() => { setShowInquiry(s => !s); setShowCheckout(false); }}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50"
              >
                <Mail className="w-4 h-4" />
                Send Inquiry
              </button>
            </div>
          )}

          {/* Razorpay checkout form */}
          {showCheckout && !orderSuccess && (
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <p className="text-sm font-semibold text-slate-900">Enter your details to pay</p>
              {payError && <p className="text-xs text-red-500">{payError}</p>}
              <input placeholder="Your name *" value={name} onChange={e => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': themeColor } as any} />
              <input placeholder="Phone number *" value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2" />
              <input placeholder="Email (optional)" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2" />
              <input placeholder="Delivery address (optional)" value={address} onChange={e => setAddress(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2" />
              <button
                onClick={handleRazorpayCheckout}
                disabled={paying || !name || !phone}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: themeColor }}
              >
                {paying ? 'Opening payment...' : `Pay ${formatCurrency(price, currency)} securely`}
              </button>
              <p className="text-[10px] text-slate-400 text-center">Secured by Razorpay 🔒</p>
            </div>
          )}

          {/* Inquiry form */}
          {showInquiry && !sent && (
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <p className="text-sm font-semibold text-slate-900">Send us a message</p>
              <input placeholder="Your name *" value={name} onChange={e => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <input placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <textarea placeholder="Your message..." value={msg} onChange={e => setMsg(e.target.value)} rows={2}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              <button onClick={handleInquiry} disabled={!name}
                className="w-full py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: themeColor }}>
                Submit Inquiry
              </button>
            </div>
          )}
          {sent && (
            <div className="border-t border-slate-100 pt-4 text-center">
              <p className="text-green-600 text-sm font-medium">✅ Inquiry sent! We'll reach out soon.</p>
            </div>
          )}

          {/* ── Reviews Section ── */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Customer Reviews</p>
                {avgRating > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                    <span className="text-xs text-slate-500 ml-1">{avgRating.toFixed(1)} · {publicReviews.length} review{publicReviews.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              {!showReviewForm && !reviewSubmitted && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="text-xs font-medium px-3 py-1.5 rounded-xl border transition-colors hover:opacity-80"
                  style={{ borderColor: themeColor, color: themeColor }}
                >
                  Write a Review
                </button>
              )}
            </div>

            {/* Existing reviews */}
            {publicReviews.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {publicReviews.map((r: any) => (
                  <div key={r.id} className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-800">{r.reviewerName}</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}

            {publicReviews.length === 0 && !showReviewForm && (
              <p className="text-xs text-slate-400">No reviews yet. Be the first to share your experience!</p>
            )}

            {/* Review submission form */}
            {showReviewForm && !reviewSubmitted && (
              <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-slate-700">Your Review</p>
                <input
                  placeholder="Your name *"
                  value={reviewName}
                  onChange={e => setReviewName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-white"
                  style={{ '--tw-ring-color': themeColor } as any}
                />
                <input
                  placeholder="Email (optional)"
                  value={reviewEmail}
                  onChange={e => setReviewEmail(e.target.value)}
                  type="email"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-white"
                />
                {/* Star picker */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setReviewRating(s)} type="button" className="p-0.5 transition-transform hover:scale-110">
                      <Star className={`w-5 h-5 ${s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                  <span className="text-xs text-slate-500 ml-1">{reviewRating}/5</span>
                </div>
                <textarea
                  placeholder="Tell others about this product (optional)"
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-white resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitReview}
                    disabled={!reviewName.trim()}
                    className="flex-1 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50 transition-opacity"
                    style={{ backgroundColor: themeColor }}
                  >
                    Submit Review
                  </button>
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {reviewSubmitted && (
              <p className="text-xs text-green-600 font-medium bg-green-50 rounded-xl px-3 py-2">
                ✅ Thank you! Your review is pending approval and will appear shortly.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Chatbot ───────────────────────────────────────────────────────────────────

function Chatbot({ store, products, themeColor }: { store: StoreData; products: Product[]; themeColor: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      text: `👋 Hi! I'm your shopping assistant at ${store.name}. How can I help you?`,
      quickReplies: ['Show featured products', 'What\'s on sale?', 'Delivery info', 'Contact us'],
    },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = useCallback((text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text };
    const botMsg = buildBotResponse(text, products, store);
    setMessages(m => [...m, userMsg, botMsg]);
    setInput('');
  }, [products, store]);

  const whatsappUrl = store.whatsAppNumber
    ? generateWhatsAppLink(store.whatsAppNumber, 'Hi! I came from your online store.')
    : null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-transform hover:scale-110"
        style={{ backgroundColor: themeColor }}
        title="Chat with us"
      >
        {open ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center">
            1
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
          style={{ maxHeight: '70vh' }}>
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-3 text-white" style={{ backgroundColor: themeColor }}>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{store.name}</p>
              <p className="text-[10px] text-white/70 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" /> Online now
              </p>
            </div>
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noreferrer"
                className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                title="Open WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-1`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'text-white rounded-br-sm'
                      : 'bg-white text-slate-700 shadow-sm rounded-bl-sm border border-slate-100'
                  }`}
                  style={msg.role === 'user' ? { backgroundColor: themeColor } : {}}
                >
                  {msg.text}
                </div>

                {/* Product mini-cards in bot messages */}
                {msg.products && msg.products.length > 0 && (
                  <div className="w-full space-y-1.5 mt-1">
                    {msg.products.map(p => (
                      <div key={p.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-2 flex gap-2 items-center">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          {p.primaryImage
                            ? <img src={p.primaryImage} alt={p.title} className="w-full h-full object-cover" />
                            : <ShoppingBag className="w-5 h-5 text-slate-300 m-auto mt-2.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-900 truncate">{p.title}</p>
                          <p className="text-xs font-bold" style={{ color: themeColor }}>
                            {formatCurrency(p.discountedPrice ?? p.basePrice, store.currency ?? 'INR')}
                          </p>
                        </div>
                        {store.whatsAppNumber && (
                          <a
                            href={generateWhatsAppLink(store.whatsAppNumber, generateProductInquiryMessage(p.title, store.name))}
                            target="_blank"
                            rel="noreferrer"
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0"
                            style={{ backgroundColor: themeColor }}
                          >
                            <MessageCircle className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick reply pills */}
                {msg.quickReplies && msg.role === 'bot' && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {msg.quickReplies.map(qr => (
                      qr === 'Open WhatsApp' && whatsappUrl
                        ? <a key={qr} href={whatsappUrl} target="_blank" rel="noreferrer"
                            className="text-xs px-2.5 py-1 rounded-full border font-medium transition-colors"
                            style={{ borderColor: themeColor, color: themeColor }}>
                            {qr}
                          </a>
                        : <button key={qr} onClick={() => send(qr)}
                            className="text-xs px-2.5 py-1 rounded-full border font-medium transition-colors hover:text-white"
                            style={{ borderColor: themeColor, color: themeColor }}
                            onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = themeColor; (e.target as HTMLElement).style.color = '#fff'; }}
                            onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = ''; (e.target as HTMLElement).style.color = themeColor; }}
                          >
                            {qr}
                          </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send(input)}
                placeholder="Type a message..."
                className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white disabled:opacity-40"
                style={{ backgroundColor: themeColor }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            {!store?.allowsCustomBranding && (
              <p className="text-[10px] text-slate-400 text-center mt-1.5">Powered by ReplyCart AI 🤖</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function PublicStorefrontPage() {
  const { slug } = useParams<{ slug: string }>();
  const { totalItems, addItem } = useCart();

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sort, setSort] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // UI state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  // Add to cart handler
  const handleAddToCart = useCallback((product: Product) => {
    addItem({
      productId: product.id,
      productTitle: product.title,
      unitPrice: product.discountedPrice ?? product.basePrice,
      primaryImage: product.primaryImage,
      categoryName: product.categoryName,
      stockQuantity: product.stockQuantity,
    });
    setCartOpen(true);
  }, [addItem]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: store, isLoading: storeLoading } = useQuery<StoreData>({
    queryKey: ['public-store', slug],
    queryFn: () => axios.get(`${BASE_URL}/public/${slug}`).then(r => r.data),
    enabled: !!slug,
  });

  useEffect(() => {
    if (store?.name) {
      document.title = `${store.name} — Shop Online`;
    }
    return () => { document.title = 'ReplyCart'; };
  }, [store?.name]);

  // Dynamically update the browser tab favicon to reflect the store's logo/colour
  useEffect(() => {
    if (!store) return;

    // Build a favicon URL: use the store's logo if available, else an SVG icon
    // with the store's theme colour and first two letters of the name.
    let faviconUrl: string;
    if (store.logoUrl) {
      faviconUrl = store.logoUrl;
    } else {
      const initials = (store.name ?? 'S').slice(0, 2).toUpperCase();
      const color = (store.themeColor ?? '#0f766e').replace('#', '');
      faviconUrl = `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
        `<rect width="32" height="32" rx="8" fill="#${color}"/>` +
        `<text x="16" y="22" font-size="14" font-family="sans-serif" font-weight="bold" ` +
        `fill="white" text-anchor="middle">${initials}</text></svg>`
      )}`;
    }

    // Update every <link rel="icon"> (and shortcut icon) in the document head
    const links = document.querySelectorAll<HTMLLinkElement>("link[rel~='icon']");
    const originals: { el: HTMLLinkElement; href: string }[] = [];
    links.forEach(link => {
      originals.push({ el: link, href: link.href });
      link.href = faviconUrl;
    });

    // If none exist, create one
    if (links.length === 0) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = faviconUrl;
      document.head.appendChild(link);
      return () => { document.head.removeChild(link); };
    }

    return () => {
      originals.forEach(({ el, href }) => { el.href = href; });
    };
  }, [store?.logoUrl, store?.name, store?.themeColor]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['public-categories', slug],
    queryFn: () => axios.get(`${BASE_URL}/public/${slug}/categories`).then(r => r.data),
    enabled: !!slug,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['public-products', slug, debouncedSearch, selectedCategory, sort, inStockOnly, page],
    queryFn: () => axios.get(`${BASE_URL}/public/${slug}/products`, {
      params: {
        search: debouncedSearch || undefined,
        categoryId: selectedCategory || undefined,
        sort: sort || undefined,
        inStockOnly: inStockOnly || undefined,
        page,
        pageSize: PAGE_SIZE,
      },
    }).then(r => r.data),
    enabled: !!slug,
  });

  const allProducts: Product[] = productsData?.items ?? [];
  const totalCount: number = productsData?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (storeLoading) return <PageLoader />;
  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-slate-300" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Store not found</h1>
          <p className="text-slate-500 mt-2">This store link may be incorrect or the store may have been removed.</p>
        </div>
      </div>
    );
  }

  const tc = store.themeColor ?? '#0f766e';

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToCategories = () => (categoriesRef.current ?? productsRef.current)?.scrollIntoView({ behavior: 'smooth' });
  const scrollToProducts = () => productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  const scrollToContact = () => footerRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleNavClick = (item: string) => {
    if (item === 'Home') scrollToTop();
    else if (item === 'Categories') scrollToCategories();
    else if (item === 'All Products') scrollToProducts();
    else if (item === 'About Us') scrollToContact();
  };

  const activeFiltersCount = [selectedCategory, sort, inStockOnly].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Announcement Bar — only shown when the business has set announcement text ── */}
      {store.announcementText && (
        <div className="bg-slate-900 text-white text-xs py-2 px-4 text-center overflow-hidden">
          <span>{store.announcementText}</span>
        </div>
      )}

      {/* ── Sticky Header ── */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-9 object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                  style={{ backgroundColor: tc }}
                >
                  {store.name?.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-bold text-slate-900 text-base hidden sm:block">{store.name}</span>
              </div>
            )}
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
            {['Home', 'Categories', 'All Products', 'About Us'].map(item => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(o => !o)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart icon */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600"
              title="View cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: tc }}
                >
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* WhatsApp CTA (desktop) */}
            {store.whatsAppNumber && (
              <a
                href={generateWhatsAppLink(store.whatsAppNumber, `Hi! I'm visiting ${store.name}'s store.`)}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-sm font-medium"
                style={{ backgroundColor: tc }}
              >
                <MessageCircle className="w-4 h-4" />
                Chat
              </a>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-slate-100 px-4 py-3 bg-white">
            <div className="max-w-6xl mx-auto flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search products, categories..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
            {['Home', 'Categories', 'All Products', 'About Us'].map(item => (
              <button
                key={item}
                onClick={() => { handleNavClick(item); setMobileMenuOpen(false); }}
                className="block w-full text-left text-sm py-2 px-3 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      {store.bannerUrl ? (
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img src={store.bannerUrl} alt="Store banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex items-end pb-10 px-6 max-w-6xl mx-auto left-0 right-0">
            <div className="text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg">{store.name}</h1>
              {store.description && <p className="text-white/80 text-base md:text-lg max-w-xl">{store.description}</p>}
              <button
                onClick={scrollToProducts}
                className="mt-4 px-6 py-2.5 rounded-2xl text-white font-semibold text-sm border border-white/40 hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                Shop Now →
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="relative h-64 md:h-96 flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${tc}ee 0%, ${tc}99 100%)` }}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/3" />

          <div className="relative text-center text-white px-4 z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Premium Collection
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-3 drop-shadow-sm">{store.name}</h1>
            {store.description && (
              <p className="text-white/80 text-base md:text-xl max-w-2xl mx-auto">{store.description}</p>
            )}
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={scrollToProducts}
                className="px-7 py-3 bg-white text-slate-900 rounded-2xl font-semibold text-sm hover:bg-white/90 transition shadow-lg"
              >
                Shop Now
              </button>
              {store.whatsAppNumber && (
                <a
                  href={generateWhatsAppLink(store.whatsAppNumber, `Hi! I'm visiting ${store.name}'s store.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-7 py-3 border border-white/40 text-white rounded-2xl font-semibold text-sm hover:bg-white/10 transition backdrop-blur-sm flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Chat with Us
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Stats strip ── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-center gap-6 text-sm text-slate-500 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium" style={{ color: tc }}>
            <Package className="w-4 h-4" />
            <span>{totalCount > 0 ? `${totalCount} Products` : 'New Store'}</span>
          </span>
          {store.whatsAppNumber && (
            <>
              <span className="w-px h-4 bg-slate-200" />
              <span className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" /> WhatsApp Support
              </span>
            </>
          )}
          <span className="w-px h-4 bg-slate-200" />
          <span className="flex items-center gap-1.5">🔒 Secure Checkout</span>
          {categories.length > 0 && (
            <>
              <span className="w-px h-4 bg-slate-200" />
              <span className="flex items-center gap-1.5"><span>{categories.length} Categories</span></span>
            </>
          )}
        </div>
      </div>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <div ref={categoriesRef} className="max-w-6xl mx-auto px-4 pt-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Shop by Category</h2>
              <p className="text-sm text-slate-400 mt-0.5">Find exactly what you're looking for</p>
            </div>
          </div>
          {/* If any category has an image, show cards; else show pills */}
          {categories.some(c => c.imageUrl) ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              <button
                onClick={() => { setSelectedCategory(null); setPage(1); }}
                className={`relative rounded-2xl overflow-hidden aspect-square flex items-end p-3 transition-all ${!selectedCategory ? 'ring-2' : 'opacity-80 hover:opacity-100'}`}
                style={!selectedCategory ? { outline: `2px solid ${tc}`, outlineOffset: '2px' } : {}}
              >
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${tc}cc, ${tc}66)` }} />
                <span className="relative text-white font-bold text-sm drop-shadow">All</span>
                {!selectedCategory && <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: tc }} /></div>}
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setPage(1); scrollToProducts(); }}
                  className={`relative rounded-2xl overflow-hidden aspect-square flex items-end p-3 transition-all ${selectedCategory === cat.id ? 'ring-2' : 'opacity-90 hover:opacity-100 hover:scale-[1.02]'}`}
                  style={selectedCategory === cat.id ? { outline: `2px solid ${tc}`, outlineOffset: '2px' } : {}}
                >
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${tc}99, ${tc}44)` }} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <span className="relative text-white font-bold text-sm drop-shadow">{cat.name}</span>
                  {selectedCategory === cat.id && <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: tc }} /></div>}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => { setSelectedCategory(null); setPage(1); }}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-all ${!selectedCategory ? 'text-white border-transparent shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                style={!selectedCategory ? { backgroundColor: tc, borderColor: tc } : {}}
              >All</button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setPage(1); scrollToProducts(); }}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-all ${selectedCategory === cat.id ? 'text-white border-transparent shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                  style={selectedCategory === cat.id ? { backgroundColor: tc, borderColor: tc } : {}}
                >{cat.name}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Featured Products ── */}
      {allProducts.filter(p => p.isFeatured).length > 0 && !selectedCategory && !debouncedSearch && (
        <div className="max-w-6xl mx-auto px-4 pt-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">⭐ Featured Products</h2>
              <p className="text-sm text-slate-400 mt-0.5">Handpicked favourites</p>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
            {allProducts.filter(p => p.isFeatured).map(p => {
              const featPrice = p.discountedPrice ?? p.basePrice;
              const featDiscount = p.discountedPrice ? Math.round((1 - p.discountedPrice / p.basePrice) * 100) : 0;
              return (
                <div
                  key={p.id}
                  className="flex-shrink-0 w-44 bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <div
                    className="relative aspect-square bg-slate-100 overflow-hidden"
                    onClick={() => setSelectedProduct(p)}
                  >
                    {p.primaryImage
                      ? <img src={p.primaryImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-10 h-10 text-slate-200" /></div>}
                    {featDiscount > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{featDiscount}%</span>
                    )}
                  </div>
                  <div className="p-3" onClick={() => setSelectedProduct(p)}>
                    <p className="text-xs text-slate-400 font-medium mb-0.5 truncate">{p.categoryName ?? ''}</p>
                    <p className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">{p.title}</p>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-sm font-bold" style={{ color: tc }}>{formatCurrency(featPrice, store.currency ?? 'INR')}</span>
                      {p.discountedPrice && <span className="text-xs text-slate-400 line-through">{formatCurrency(p.basePrice, store.currency ?? 'INR')}</span>}
                    </div>
                  </div>
                  {/* Add to cart button */}
                  <div className="px-3 pb-3">
                    <button
                      onClick={e => { e.stopPropagation(); handleAddToCart(p); }}
                      className="w-full py-1.5 rounded-xl text-xs font-semibold border-2 transition-colors hover:text-white"
                      style={{ borderColor: tc, color: tc }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = tc; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; (e.currentTarget as HTMLElement).style.color = tc; }}
                    >
                      + Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Trust Badges — conditional on real store data ── */}
      {(() => {
        const badges = [
          store.razorpayEnabled && { icon: '🔒', title: 'Secure Payments', sub: 'Powered by Razorpay' },
          { icon: '🚚', title: 'Fast Delivery', sub: 'Pan-India shipping' },
          { icon: '↩️', title: 'Easy Returns', sub: 'Hassle-free policy' },
          store.whatsAppNumber && { icon: '💬', title: 'WhatsApp Support', sub: `Chat on WhatsApp` },
        ].filter(Boolean) as { icon: string; title: string; sub: string }[];

        if (badges.length === 0) return null;

        return (
          <div className="max-w-6xl mx-auto px-4 pt-8">
            <div className={`grid gap-3 ${badges.length <= 2 ? 'grid-cols-2' : badges.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
              {badges.map(b => (
                <div key={b.title} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
                  <span className="text-2xl">{b.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{b.title}</p>
                    <p className="text-xs text-slate-400">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── Products section ── */}
      <div ref={productsRef} className="max-w-6xl mx-auto px-4 py-8 space-y-5">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name ?? 'Products' : debouncedSearch ? `Results for "${debouncedSearch}"` : 'All Products'}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">{totalCount} products</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); setPage(1); }}
                className="appearance-none bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
              <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                showFilters || activeFiltersCount > 0
                  ? 'text-white border-transparent'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
              style={showFilters || activeFiltersCount > 0 ? { backgroundColor: tc } : {}}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-white/30 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">Stock:</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => { setInStockOnly(e.target.checked); setPage(1); }}
                  className="rounded"
                />
                <span className="text-sm text-slate-600">In stock only</span>
              </label>
            </div>
            {(selectedCategory || sort || inStockOnly) && (
              <button
                onClick={() => { setSelectedCategory(null); setSort(''); setInStockOnly(false); setPage(1); }}
                className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Product grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                <div className="aspect-square bg-slate-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : allProducts.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {allProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                themeColor={tc}
                store={store}
                onSelect={setSelectedProduct}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <ShoppingBag className="w-14 h-14 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No products found</h3>
            <p className="text-sm text-slate-400">
              {debouncedSearch ? `No results for "${debouncedSearch}". Try a different search.` : 'No products available in this category yet.'}
            </p>
            {(debouncedSearch || selectedCategory) && (
              <button
                onClick={() => { setSearch(''); setSelectedCategory(null); }}
                className="mt-4 text-sm font-medium hover:underline"
                style={{ color: tc }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page === 1}
              className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => Math.abs(p - page) < 3).map(p => (
              <button
                key={p}
                onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="w-9 h-9 rounded-xl text-sm font-medium border transition-all"
                style={p === page ? { backgroundColor: tc, color: 'white', borderColor: tc } : { borderColor: '#e2e8f0', color: '#475569' }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── WhatsApp CTA Banner ── */}
      {store.whatsAppNumber && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div
            className="rounded-3xl p-8 text-center text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${tc}ee 0%, ${tc}bb 100%)` }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />
            <div className="relative">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="text-2xl font-bold mb-2">Need help choosing?</h3>
              <p className="text-white/80 mb-6 max-w-md mx-auto">
                Chat with us on WhatsApp and we'll help you find the perfect product. Quick replies guaranteed!
              </p>
              <a
                href={generateWhatsAppLink(store.whatsAppNumber, `Hi ${store.name}! I need help choosing a product.`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-shadow"
                style={{ color: tc }}
              >
                <MessageCircle className="w-5 h-5" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer ref={footerRef} className="bg-slate-900 text-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm mb-3"
              style={{ backgroundColor: tc }}
            >
              {store.name?.slice(0, 2).toUpperCase()}
            </div>
            <h3 className="font-bold text-lg mb-1">{store.name}</h3>
            {store.description && <p className="text-slate-400 text-sm leading-relaxed">{store.description}</p>}
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-slate-300">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><button onClick={scrollToProducts} className="hover:text-white transition-colors">All Products</button></li>
              {categories.slice(0, 4).map(c => (
                <li key={c.id}>
                  <button
                    onClick={() => { setSelectedCategory(c.id); scrollToProducts(); }}
                    className="hover:text-white transition-colors"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-slate-300">Contact Us</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              {store.whatsAppNumber && (
                <li>
                  <a
                    href={generateWhatsAppLink(store.whatsAppNumber, `Hi ${store.name}!`)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> {store.whatsAppNumber}
                  </a>
                </li>
              )}
              {store.instagramHandle && (
                <li>
                  <a
                    href={`https://instagram.com/${store.instagramHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <span className="text-xs">@</span> {store.instagramHandle}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {store.name}.{!store.allowsCustomBranding && <> Powered by <span className="text-slate-400 font-medium">ReplyCart</span></>}
        </div>
      </footer>

      {/* ── Scroll to top ── */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-24 right-4 z-20 w-10 h-10 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all md:bottom-6"
        title="Scroll to top"
      >
        <ChevronLeft className="w-4 h-4 rotate-90" />
      </button>

      {/* Sticky mobile WhatsApp bar */}
      {store.whatsAppNumber && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-100 md:hidden z-20" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
          <a
            href={generateWhatsAppLink(store.whatsAppNumber, `Hi! I'm interested in products at ${store.name}.`)}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold text-sm shadow-lg"
            style={{ backgroundColor: tc }}
          >
            <MessageCircle className="w-5 h-5" />
            {store.whatsAppCtaLabel ?? 'Chat on WhatsApp'}
          </a>
        </div>
      )}

      {/* Chatbot */}
      <Chatbot store={store} products={allProducts} themeColor={tc} />

      {/* Product detail modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          store={store}
          themeColor={tc}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        store={{
          name: store.name,
          logoUrl: store.logoUrl,
          currency: store.currency,
          themeColor: store.themeColor,
          razorpayEnabled: store.razorpayEnabled,
          whatsAppNumber: store.whatsAppNumber,
          whatsAppCtaLabel: store.whatsAppCtaLabel,
        }}
        slug={slug ?? ''}
      />
    </div>
  );
}
