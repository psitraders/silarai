import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ShoppingBag, Search, MessageCircle, X, Star,
  Send, Bot, SlidersHorizontal, ArrowUpDown,
  Mail, Package, Sparkles, ChevronLeft, ChevronRight,
  Menu, Heart, Shield, Zap, Users, Flame,
  CheckCircle, BadgeCheck, Download,
  Truck, Lock, RotateCcw, ShieldCheck, UserCircle,
} from 'lucide-react';
import { StorefrontAuthProvider, useStorefrontAuth } from '../../context/StorefrontAuthContext';

// Lazy-load heavy overlay panels — not needed for first paint
const CustomerAuthModal = React.lazy(() =>
  import('../../components/storefront/CustomerAuthModal').then(m => ({ default: m.CustomerAuthModal }))
);
const MyAccountPanel = React.lazy(() =>
  import('../../components/storefront/MyAccountPanel').then(m => ({ default: m.MyAccountPanel }))
);

/** Instagram brand icon — lucide-react v1.x doesn't include it */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

/** Official WhatsApp brand icon (filled path from Font Awesome) */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}
import axios from 'axios';
import { formatCurrency } from '../../utils/formatCurrency';
import { generateWhatsAppLink, generateProductInquiryMessage } from '../../utils/whatsappLink';
import { optimizeImage } from '../../utils/imageUrl';
// PageLoader removed — replaced by inline branded loading screen
import { paymentApi } from '../../api/payment.api';
import { useCart } from '../../context/CartContext';
const CartDrawer = React.lazy(() =>
  import('../../components/storefront/CartDrawer').then(m => ({ default: m.CartDrawer }))
);

const BASE_URL = import.meta.env.VITE_API_URL || 'https://silarai-fbahb2bsg4cng3hq.southindia-01.azurewebsites.net/api/v1';

// Safe GA4 event helper — no-ops if gtag hasn't loaded yet
function gtagEvent(eventName: string, params?: Record<string, unknown>) {
  try {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', eventName, params);
    }
  } catch { /* ignore */ }
}

// ── Markdown cleaner — strips AI formatting before displaying in chat ──────────
function cleanReply(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')          // **bold** → plain
    .replace(/\*(.*?)\*/g, '$1')               // *italic* → plain
    .replace(/^#{1,6}\s+/gm, '')               // # Heading → plain
    .replace(/^[-*+]\s+/gm, '• ')              // markdown bullets → •
    .replace(/`([^`]+)`/g, '$1')               // `code` → plain
    // Insert line break before numbered list items so "1. A 2. B" → "1. A\n2. B"
    .replace(/\s{1,3}(\d+\.\s+)/g, '\n$1')
    .trim();
}

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
  themeColor: string;       // primary brand colour
  secondaryColor?: string;  // secondary / gradient-end colour
  accentColor?: string;     // optional 3rd accent colour
  whatsAppCtaLabel?: string;
  razorpayEnabled?: boolean;
  announcementText?: string;       // null = hide bar entirely
  allowsCustomBranding?: boolean;  // true = hide "Powered by Silarai"
  ga4MeasurementId?: string;       // G-XXXXXXXXXX for gtag embed
  faviconUrl?: string;             // dedicated favicon (falls back to logoUrl)
  loaderEnabled?: boolean;         // show branded 2-second loading screen
  allowPublicInquiries?: boolean;  // allow inquiry button on public store
}

interface SubCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isFeatured?: boolean;
  subCategories?: SubCategory[];
}

interface Product {
  id: string;
  title: string;
  description?: string;
  basePrice: number;
  discountedPrice?: number;
  /** Lowest price when variants have price adjustments (base/discounted + min adjustment) */
  minVariantPrice?: number;
  isFeatured: boolean;
  stockQuantity?: number;
  /** True when the admin has explicitly set the product to OutOfStock status */
  isOutOfStock?: boolean;
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
  /** Set when the backend placed a COD order from the chat */
  orderDetails?: {
    orderId: string;
    orderNumber: string;
    totalAmount: number;
    slug: string;
  };
  /** Set when the customer chose online payment — frontend must redirect */
  onlineCart?: {
    items: { productId: string; title: string; variantInfo?: string; qty: number; unitPrice: number }[];
    customerName?: string;
    customerPhone?: string;
    address?: string;
  };
  /** Set when AI collected all order details but email OTP is still needed */
  pendingCodOrder?: {
    name: string;
    phone: string;
    address: string;
    totalAmount: number;
    cart: { productId: string; title: string; variantInfo?: string; qty: number; unitPrice: number }[];
  };
}

// ── Chatbot logic ─────────────────────────────────────────────────────────────
// (keyword bot replaced by AI RAG endpoint — see Chatbot component below)

// ── Social proof helpers ──────────────────────────────────────────────────────

function getProductBadge(product: Product): { label: string; bg: string } | null {
  const seed = product.id.charCodeAt(product.id.length - 1) % 5;
  if (product.isFeatured && product.discountedPrice) return { label: '🔥 Hot Deal', bg: 'bg-rose-500' };
  if (product.isFeatured && seed < 2) return { label: '⭐ Popular', bg: 'bg-amber-500' };
  if (product.isFeatured) return { label: '🏆 Best Seller', bg: 'bg-violet-500' };
  if (product.discountedPrice) return { label: '🏷️ On Sale', bg: 'bg-red-500' };
  if (seed === 0) return { label: '🆕 New', bg: 'bg-blue-500' };
  if (seed === 1) return { label: '👀 Trending', bg: 'bg-teal-600' };
  return null;
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
  const hasVariants = product.minVariantPrice != null;
  const price = hasVariants ? product.minVariantPrice! : (product.discountedPrice ?? product.basePrice);
  const discount = !hasVariants && product.discountedPrice
    ? Math.round((1 - product.discountedPrice / product.basePrice) * 100) : 0;
  const outOfStock = product.isOutOfStock === true
    || (product.stockQuantity !== undefined && product.stockQuantity !== null && product.stockQuantity <= 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;
    onAddToCart(product);
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 1400);
  };

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden cursor-pointer flex flex-col border border-slate-100/80 transition-all duration-300 hover:-translate-y-2"
      onClick={() => onSelect(product)}
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)', '--hover-shadow': `0 12px 36px ${themeColor}28` } as React.CSSProperties}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 36px ${themeColor}28, 0 2px 8px rgba(0,0,0,0.08)`; (e.currentTarget as HTMLElement).style.borderColor = themeColor + '30'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = ''; }}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden flex-shrink-0">
        {product.primaryImage ? (
          <>
            {/* Primary image — fades out on hover only when a second image exists */}
            <img
              src={optimizeImage(product.primaryImage, 400)}
              alt={product.title}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out ${
                product.allImages && product.allImages.length > 1
                  ? 'group-hover:opacity-0'
                  : 'group-hover:scale-105'
              }`}
              loading="lazy"
              decoding="async"
              width={400}
              height={500}
            />
            {/* Secondary image — shown on hover if it exists */}
            {product.allImages && product.allImages.length > 1 && (
              <img
                src={optimizeImage(product.allImages[1], 400)}
                alt={`${product.title} — alternate view`}
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
                loading="lazy"
                decoding="async"
                width={400}
                height={500}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <ShoppingBag className="w-12 h-12 text-slate-200" />
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {outOfStock && (
            <span className="bg-slate-800/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              Sold Out
            </span>
          )}
          {!outOfStock && product.isFeatured && (
            <span className="text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm" style={{ backgroundColor: themeColor }}>
              ⭐ Featured
            </span>
          )}
          {!outOfStock && discount > 0 && (
            <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={e => { e.stopPropagation(); setLiked(l => !l); }}
          className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
          style={liked ? { opacity: 1 } : {}}
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
        </button>
        {/* Mobile wishlist — always visible */}
        <button
          onClick={e => { e.stopPropagation(); setLiked(l => !l); }}
          className="sm:hidden absolute top-2 right-2 z-10 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-md"
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
        </button>

        {/* Desktop quick-add — slides up from bottom on hover */}
        {!outOfStock && (
          <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hidden sm:block">
            <button
              onClick={handleAddToCart}
              className={`w-full py-2 rounded-xl text-xs font-bold shadow-lg transition-all ${
                addedFlash ? 'bg-green-500 text-white' : 'bg-white text-slate-800 hover:bg-slate-50'
              }`}
            >
              {addedFlash ? '✓ Added to Cart' : '🛒 Add to Cart'}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        {product.categoryName && (
          <span className="text-[9px] font-black uppercase tracking-[0.12em] mb-1 inline-block px-1.5 py-0.5 rounded-md w-fit"
            style={{ color: themeColor, background: themeColor + '12' }}>
            {product.categoryName}
          </span>
        )}
        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug flex-1">
          {product.title}
        </h3>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2 flex-wrap">
          <span className="text-base font-black" style={{ color: themeColor }}>
            {hasVariants && <span className="text-xs font-semibold mr-0.5 opacity-70">from</span>}
            {formatCurrency(price, currency)}
          </span>
          {!hasVariants && product.discountedPrice && (
            <span className="text-xs text-slate-300 line-through">{formatCurrency(product.basePrice, currency)}</span>
          )}
        </div>

        {/* Mobile add-to-cart */}
        {!outOfStock ? (
          <div className="sm:hidden mt-2.5">
            <button
              onClick={handleAddToCart}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                addedFlash ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-800 active:bg-slate-200'
              }`}
            >
              {addedFlash ? '✓ Added!' : '+ Add'}
            </button>
          </div>
        ) : (
          <div className="mt-2.5 py-1.5 rounded-xl text-center text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-100">
            Out of Stock
          </div>
        )}
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
  product, store, themeColor, onClose, slug, isCustomDomain,
}: { product: Product; store: StoreData; themeColor: string; onClose: () => void; slug: string; isCustomDomain: boolean }) {
  const navigate = useNavigate();
  const [imgIdx, setImgIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const [showInquiry, setShowInquiry] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [payMethod, setPayMethod] = useState<'razorpay' | 'cod'>(store.razorpayEnabled ? 'razorpay' : 'cod');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  // COD email OTP
  const [otpStep, setOtpStep]   = useState<'idle' | 'sending' | 'awaiting'>('idle');
  const [otpCode, setOtpCode]   = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  // selected variant: map of variantName -> variantValue
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const currency = store.currency ?? 'INR';
  // isCustomDomain = true  → floraved.com  → route is /order-confirmation/:id
  // isCustomDomain = false → Silarai.app → route is /:slug/order-confirmation/:id
  const confirmBase = isCustomDomain ? `/order-confirmation` : `/${slug}/order-confirmation`;

  // Always use React Router navigate — pure SPA navigation, no HTTP request.
  // window.location.href (full reload) was fragile: required Azure SWA to serve
  // the path correctly, which broke on every new deployment. navigate() is
  // immune to server-side routing because the app is already loaded in memory.
  const goToConfirmation = (orderId: string) => {
    navigate(`${confirmBase}/${orderId}`);
  };

  // Reviews state
  const [showReviewForm, setShowReviewForm]     = useState(false);
  const [reviewName, setReviewName]             = useState('');
  const [reviewEmail, setReviewEmail]           = useState('');
  const [reviewPhone, setReviewPhone]           = useState('');
  const [reviewRating, setReviewRating]         = useState(5);
  const [reviewComment, setReviewComment]       = useState('');
  const [reviewSubmitted, setReviewSubmitted]   = useState(false);
  const [reviewError, setReviewError]           = useState<string | null>(null);

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
    setReviewError(null);
    try {
      await axios.post(`${BASE_URL}/public/${slug}/products/${product.id}/reviews`, {
        reviewerName:  reviewName,
        reviewerEmail: reviewEmail || undefined,
        reviewerPhone: reviewPhone.trim() || undefined,
        rating:        reviewRating,
        comment:       reviewComment || undefined,
      });
      setReviewSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.[0] ?? err?.response?.data?.message ?? 'Failed to submit review.';
      setReviewError(msg);
    }
  };

  // Group variants by name: { Size: [{value:'S',priceAdj:0},{value:'M',...}], Color: [...] }
  const variantGroups: Record<string, ProductVariant[]> = {};
  if (productDetail?.variants) {
    for (const v of productDetail.variants as ProductVariant[]) {
      if (!variantGroups[v.name]) variantGroups[v.name] = [];
      variantGroups[v.name].push(v);
    }
  }

  // Auto-select the first (smallest) variant in each group when product detail loads
  useEffect(() => {
    if (!productDetail?.variants?.length) return;
    const groups: Record<string, ProductVariant[]> = {};
    for (const v of productDetail.variants as ProductVariant[]) {
      if (!groups[v.name]) groups[v.name] = [];
      groups[v.name].push(v);
    }
    setSelectedVariants(prev => {
      const next = { ...prev };
      for (const [groupName, variants] of Object.entries(groups)) {
        if (!next[groupName] && variants.length > 0) {
          next[groupName] = variants[0].value; // first = default/smallest
        }
      }
      return next;
    });
  }, [productDetail]);

  // All variant groups must have a selection before order actions are enabled
  const hasVariants = Object.keys(variantGroups).length > 0;
  const allVariantsSelected = !hasVariants || Object.keys(variantGroups).every(g => Boolean(selectedVariants[g]));
  // First unselected group name (for the hint label)
  const missingVariant = Object.keys(variantGroups).find(g => !selectedVariants[g]);

  // Total price adjustment from selected variants
  const priceAdjustment = Object.entries(selectedVariants).reduce((sum, [groupName, value]) => {
    const variant = variantGroups[groupName]?.find(v => v.value === value);
    return sum + (variant?.priceAdjustment ?? 0);
  }, 0);

  const images = product.allImages?.length ? product.allImages : product.primaryImage ? [product.primaryImage] : [];
  const basePrice = product.discountedPrice ?? product.basePrice;
  const price = basePrice + priceAdjustment;
  const discount = product.discountedPrice ? Math.round((1 - product.discountedPrice / product.basePrice) * 100) : 0;
  const outOfStock = product.isOutOfStock === true
    || (product.stockQuantity !== undefined && product.stockQuantity !== null && product.stockQuantity <= 0);

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
            gtagEvent('purchase', {
              transaction_id: result.orderId,
              value: price,
              currency: store.currency ?? 'INR',
              payment_type: 'online',
              items: [{ item_id: product.id, item_name: product.title, price, quantity: 1 }],
            });
            goToConfirmation(result.orderId);
            onClose();
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

  /** Step 1 — send OTP to email */
  const handleSendOtp = async () => {
    if (!name.trim())  { setPayError('Please enter your name.');         return; }
    if (!phone.trim()) { setPayError('Please enter your phone number.'); return; }
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
  const handleCodCheckout = async () => {
    if (!name.trim()) { setPayError('Please enter your name.'); return; }
    if (!phone.trim()) { setPayError('Please enter your phone number.'); return; }
    if (!email.trim()) { setPayError('Please enter your email address.'); return; }
    if (!otpCode.trim()) { setOtpError('Please enter the 6-digit code.'); return; }
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
          items: [{ productId: product.id, productTitle: product.title, variantInfo: variantInfo || null, quantity: 1, unitPrice: price }],
        }),
      });
      const text = await res.text();
      let data: any = {};
      try { if (text) data = JSON.parse(text); } catch { /* non-JSON */ }
      if (!res.ok) {
        const msg = data?.errors?.[0] ?? data?.message ?? `Order failed (${res.status}).`;
        if (msg.toLowerCase().includes('verification code')) {
          setOtpError(msg); // show inline under OTP input
        } else {
          setPayError(msg);
        }
        return;
      }
      gtagEvent('purchase', {
        transaction_id: data.orderId,
        value: price,
        currency: store.currency ?? 'INR',
        payment_type: 'cod',
        items: [{ item_id: product.id, item_name: product.title, price, quantity: 1 }],
      });
      goToConfirmation(data.orderId);
      onClose();
    } catch (err: any) {
      setPayError(err.message ?? 'Order failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const resetOtp = () => { setOtpStep('idle'); setOtpCode(''); setOtpError(null); };

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
      <div className="relative bg-white w-full sm:max-w-5xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[95vh] flex flex-col sm:flex-row">
        {/* ── Image gallery ── */}
        <div className="sm:w-[46%] flex-shrink-0 flex flex-col bg-slate-50">

          {/* Main image */}
          <div
            className="relative flex-1 overflow-hidden"
            style={{ minHeight: '320px' }}
            onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={e => {
              if (touchStartX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              if (Math.abs(dx) > 40) {
                if (dx < 0) setImgIdx(i => Math.min(images.length - 1, i + 1));
                else         setImgIdx(i => Math.max(0, i - 1));
              }
              touchStartX.current = null;
            }}
          >
            {/* Crossfade layers — one per image, only active one is visible */}
            {images.length > 0 ? images.map((img, i) => (
              <img
                key={img + i}
                src={optimizeImage(img, 900)}
                alt={product.title}
                decoding="async"
                loading={i === 0 ? 'eager' : 'lazy'}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-400 ease-in-out"
                style={{ opacity: i === imgIdx ? 1 : 0 }}
              />
            )) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingBag className="w-20 h-20 text-slate-200" />
              </div>
            )}

            {/* Discount badge */}
            {discount > 0 && (
              <span className="absolute top-3 left-3 z-10 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                {discount}% OFF
              </span>
            )}

            {/* Image counter badge */}
            {images.length > 1 && (
              <span className="absolute top-3 right-3 z-10 bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                {imgIdx + 1} / {images.length}
              </span>
            )}

            {/* Nav arrows — large, glass-morphism */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx(i => Math.max(0, i - 1))}
                  disabled={imgIdx === 0}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center disabled:opacity-20 hover:bg-white hover:scale-110 transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>
                <button
                  onClick={() => setImgIdx(i => Math.min(images.length - 1, i + 1))}
                  disabled={imgIdx === images.length - 1}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center disabled:opacity-20 hover:bg-white hover:scale-110 transition-all duration-200"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 p-2.5 bg-white border-t border-slate-100 overflow-x-auto scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 focus:outline-none"
                  style={{
                    borderColor: i === imgIdx ? themeColor : 'transparent',
                    opacity: i === imgIdx ? 1 : 0.5,
                    transform: i === imgIdx ? 'scale(1.05)' : 'scale(1)',
                  }}
                  aria-label={`View image ${i + 1}`}
                >
                  <img
                    src={optimizeImage(img, 120)}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
          <button onClick={onClose} aria-label="Close product" className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 z-10">
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
          <div className="flex flex-col gap-3 mt-auto">

              {/* Variant selection hint */}
              {hasVariants && !allVariantsSelected && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  <span className="text-amber-500 text-sm">👆</span>
                  <span className="text-sm text-amber-700 font-medium">
                    Please select a {missingVariant} to continue
                  </span>
                </div>
              )}

              {/* Buy Now */}
              {!outOfStock && (
                <button
                  onClick={() => {
                    if (!allVariantsSelected) return;
                    setShowCheckout(s => !s); setShowInquiry(false); setPayError(null);
                  }}
                  disabled={!allVariantsSelected}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold text-sm transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: themeColor }}
                >
                  💳 Buy Now — {formatCurrency(price, currency)}{variantInfo ? ` · ${variantInfo}` : ''}
                </button>
              )}

              {store.whatsAppNumber && !outOfStock && (
                <a
                  href={allVariantsSelected
                    ? generateWhatsAppLink(store.whatsAppNumber, generateProductInquiryMessage(product.title, store.name))
                    : undefined}
                  onClick={e => { if (!allVariantsSelected) e.preventDefault(); }}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-sm font-semibold transition-opacity ${!allVariantsSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
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

          {/* Checkout form */}
          {showCheckout && (
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <p className="text-sm font-semibold text-slate-900">Complete your order</p>

              {/* Payment method */}
              <div className="grid grid-cols-2 gap-2">
                {store.razorpayEnabled && (
                  <button
                    type="button"
                    onClick={() => { setPayMethod('razorpay'); resetOtp(); }}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 text-xs font-semibold transition-colors ${
                      payMethod === 'razorpay' ? 'text-white' : 'border-slate-200 text-slate-600'
                    }`}
                    style={payMethod === 'razorpay' ? { backgroundColor: themeColor, borderColor: themeColor } : undefined}
                  >
                    💳 Online Payment
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setPayMethod('cod'); resetOtp(); }}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 text-xs font-semibold transition-colors ${
                    payMethod === 'cod' ? 'text-white' : 'border-slate-200 text-slate-600'
                  } ${!store.razorpayEnabled ? 'col-span-2' : ''}`}
                  style={payMethod === 'cod' ? { backgroundColor: themeColor, borderColor: themeColor } : undefined}
                >
                  <Truck className="w-3.5 h-3.5" /> Cash on Delivery
                </button>
              </div>

              {payError && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{payError}</p>}

              {/* ── OTP awaiting step ─────────────────────────────────────── */}
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
                    style={{ '--tw-ring-color': themeColor } as any}
                  />
                  {otpError && <p className="text-xs text-red-500">{otpError}</p>}
                  <button
                    onClick={handleCodCheckout}
                    disabled={paying || otpCode.length !== 6}
                    className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ backgroundColor: themeColor }}
                  >
                    {paying ? 'Placing order...' : `✅ Verify & Place Order · ${formatCurrency(price, currency)} COD`}
                  </button>
                  <button
                    onClick={() => { setOtpStep('idle'); setOtpCode(''); setOtpError(null); }}
                    className="w-full text-xs text-slate-400 hover:text-slate-600 py-1"
                  >
                    ← Change email or resend code
                  </button>
                </>
              ) : (
                <>
                  <input placeholder="Your name *" value={name} onChange={e => setName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': themeColor } as any} />
                  <input placeholder="Phone number *" value={phone} onChange={e => setPhone(e.target.value)}
                    type="tel"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2" />
                  <input
                    placeholder={payMethod === 'cod' ? 'Email address * (for order verification)' : 'Email (optional)'}
                    value={email} onChange={e => setEmail(e.target.value)}
                    type="email"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                  />
                  <input placeholder="Delivery address (optional)" value={address} onChange={e => setAddress(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2" />
                  <button
                    onClick={payMethod === 'cod' ? handleSendOtp : handleRazorpayCheckout}
                    disabled={paying || otpStep === 'sending' || !name || !phone || (payMethod === 'cod' && !email)}
                    className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ backgroundColor: themeColor }}
                  >
                    {otpStep === 'sending'
                      ? 'Sending code...'
                      : paying
                        ? 'Opening payment...'
                        : payMethod === 'cod'
                          ? `Continue · Send Verification Code`
                          : `Pay ${formatCurrency(price, currency)} securely`}
                  </button>
                  {payMethod === 'cod' && (
                    <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                      <Lock className="w-2.5 h-2.5 flex-shrink-0" /> A one-time code will be sent to your email to prevent fake orders
                    </p>
                  )}
                  {payMethod === 'razorpay' && (
                    <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1"><ShieldCheck className="w-2.5 h-2.5" /> Secured by Razorpay</p>
                  )}
                </>
              )}
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
                <p className="text-[11px] text-slate-500">Enter your phone number to verify your purchase.</p>
                {reviewError && (
                  <p className="text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1.5">{reviewError}</p>
                )}
                <input
                  placeholder="Your name *"
                  value={reviewName}
                  onChange={e => setReviewName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-white"
                  style={{ '--tw-ring-color': themeColor } as any}
                />
                <input
                  placeholder="Phone number (used to verify purchase)"
                  value={reviewPhone}
                  onChange={e => setReviewPhone(e.target.value)}
                  type="tel"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-white"
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
                    disabled={!reviewName.trim() || !reviewPhone.trim()}
                    className="flex-1 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50 transition-opacity"
                    style={{ backgroundColor: themeColor }}
                  >
                    Submit Review
                  </button>
                  <button
                    onClick={() => { setShowReviewForm(false); setReviewError(null); }}
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

// ── Product carousel inside chat (arrow-button navigation, no scrollbar) ───────

function ProductCarousel({
  children, count,
}: { children: React.ReactNode; count: number }) {
  const scrollRef  = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);           // which card is leftmost
  const CARD_W = 186;                             // w-44 (176) + gap-2.5 (10)

  const totalPages = Math.max(0, count - 2);     // how many times we can scroll right
  const canLeft    = page > 0;
  const canRight   = page < totalPages;

  const go = (dir: -1 | 1) => {
    const next = Math.min(Math.max(page + dir, 0), totalPages);
    setPage(next);
    scrollRef.current?.scrollTo({ left: next * CARD_W, behavior: 'smooth' });
  };

  if (count <= 2) {
    return (
      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex gap-2.5">{children}</div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Left arrow */}
      <button
        onClick={() => go(-1)}
        disabled={!canLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center disabled:opacity-0 disabled:pointer-events-none transition-opacity"
        style={{ marginLeft: '-14px' }}
      >
        <ChevronLeft className="w-4 h-4 text-slate-600" />
      </button>

      {/* Track — scrollbar fully hidden; arrows are the only nav */}
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto scrollbar-hide px-1"
      >
        <div className="flex gap-2.5" style={{ width: 'max-content' }}>{children}</div>
      </div>

      {/* Right arrow */}
      <button
        onClick={() => go(1)}
        disabled={!canRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center disabled:opacity-0 disabled:pointer-events-none transition-opacity"
        style={{ marginRight: '-14px' }}
      >
        <ChevronRight className="w-4 h-4 text-slate-600" />
      </button>

      {/* Dot indicators */}
      {totalPages > 0 && (
        <div className="flex justify-center gap-1 mt-2">
          {Array.from({ length: totalPages + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setPage(i); scrollRef.current?.scrollTo({ left: i * CARD_W, behavior: 'smooth' }); }}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === page ? 'bg-slate-500' : 'bg-slate-200'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Product card inside chat ──────────────────────────────────────────────────

function ProductChatCard({
  product, themeColor, store, onSend, onViewProduct, onAddToCart,
}: {
  product: any;
  themeColor: string;
  store: StoreData;
  onSend: (msg: string) => void;
  onViewProduct?: (id: string) => void;
  onAddToCart?: (p: any) => void;
}) {
  const price     = product.minVariantPrice ?? product.discountedPrice ?? product.basePrice;
  const hasDisc   = !product.minVariantPrice && !!product.discountedPrice;
  const fromLabel = product.minVariantPrice != null;
  const [addedFlash, setAddedFlash] = useState(false);
  const outOfStock = product.isOutOfStock === true
    || (product.stockQuantity !== undefined && product.stockQuantity !== null && product.stockQuantity <= 0);

  const handleAddToCart = () => {
    if (outOfStock || !onAddToCart) return;
    onAddToCart(product);
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 1400);
  };

  return (
    <div className="w-44 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden flex-shrink-0 flex flex-col">
      {/* Image */}
      <div
        className="h-32 bg-slate-100 overflow-hidden relative flex-shrink-0 cursor-pointer"
        onClick={() => onViewProduct && onViewProduct(product.id)}
      >
        {product.primaryImage
          ? <img src={optimizeImage(product.primaryImage, 400)} alt={product.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" width={400} height={400} />
          : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-8 h-8 text-slate-300" /></div>
        }
        {product.isFeatured && !outOfStock && (
          <span className="absolute top-1.5 left-1.5 bg-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
            ⭐ Featured
          </span>
        )}
        {outOfStock && (
          <span className="absolute top-1.5 left-1.5 bg-slate-700/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            Sold Out
          </span>
        )}
        {hasDisc && !outOfStock && (
          <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            Sale
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 flex flex-col flex-1">
        <p className="text-[11px] font-semibold text-slate-800 leading-snug line-clamp-2 mb-0.5">{product.title}</p>
        {product.categoryName && (
          <p className="text-[9px] text-slate-400 uppercase tracking-wide mb-1">{product.categoryName}</p>
        )}
        <div className="mb-2.5 mt-auto">
          <p className="text-sm font-bold" style={{ color: themeColor }}>
            {fromLabel && <span className="text-[10px] font-medium mr-0.5">from</span>}
            {formatCurrency(price, store.currency ?? 'INR')}
          </p>
          {hasDisc && (
            <p className="text-[10px] text-slate-400 line-through">
              {formatCurrency(product.basePrice, store.currency ?? 'INR')}
            </p>
          )}
        </div>

        {/* Buttons */}
        {outOfStock ? (
          <div className="text-center py-1.5 rounded-xl bg-slate-50 text-[10px] font-semibold text-slate-400 border border-slate-100">
            Out of Stock
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-1.5 rounded-xl text-[10px] font-semibold border transition-all ${
                addedFlash
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
              }`}
            >
              {addedFlash ? '✓ Added!' : '🛒 Add to Cart'}
            </button>
            {/* Buy Now */}
            <button
              onClick={() => onSend(`I want to buy ${product.title}`)}
              className="w-full py-1.5 rounded-xl text-[10px] font-semibold text-white transition-opacity hover:opacity-85"
              style={{ backgroundColor: themeColor }}
            >
              Buy Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Chatbot ───────────────────────────────────────────────────────────────────

function Chatbot({ store, themeColor, slug, onOpenCart, onViewProduct }: {
  store: StoreData;
  themeColor: string;
  slug: string;
  onOpenCart: () => void;
  onViewProduct?: (productId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      text: `👋 Hi! I'm the AI shopping assistant for ${store.name}. I can help you browse products, check prices, or place an order right here in the chat! What are you looking for? 🛍️`,
      quickReplies: ['🔥 Featured products', '💰 Any deals?', '🚚 Delivery info', '🛒 How to order'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const { addItem, clearCart } = useCart();

  // Chat COD OTP state (lives here so only one active form at a time)
  const [chatOtpEmail,   setChatOtpEmail]   = useState('');
  const [chatOtpStep,    setChatOtpStep]     = useState<'idle' | 'sending' | 'awaiting' | 'placing'>('idle');
  const [chatOtpCode,    setChatOtpCode]     = useState('');
  const [chatOtpError,   setChatOtpError]    = useState<string | null>(null);
  const [chatOtpMsgIdx,  setChatOtpMsgIdx]   = useState<number | null>(null); // which message owns the form

  // Slide-in animation
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setPanelVisible(true));
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      setPanelVisible(false);
    }
  }, [open]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, isTyping]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;
    setMessages(m => [...m, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${BASE_URL}/public/${slug}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text }),
      });
      const data = await res.json();
      if (data.sessionId) setSessionId(data.sessionId);

      const hasOrder   = !!data.orderPlaced;
      const hasOnline  = !!data.onlinePaymentCart;
      const hasPending = !!data.pendingCodOrder;

      let quickReplies: string[] | undefined;
      if (data.leadCreated && !hasOrder && !hasOnline && !hasPending)
        quickReplies = ['🛒 Place an order', '🔥 Browse products', '💬 Open WhatsApp'];
      else if (hasOrder)
        quickReplies = ['🛍️ Shop more products', '💬 Open WhatsApp'];

      setMessages(m => [...m, {
        role: 'bot',
        text: cleanReply(data.reply ?? 'Sorry, something went wrong. Please try WhatsApp! 📱'),
        products:         data.mentionedProducts?.length ? data.mentionedProducts : undefined,
        orderDetails:     hasOrder   ? { ...data.orderPlaced, slug: data.slug ?? slug } : undefined,
        onlineCart:       hasOnline  ? data.onlinePaymentCart                           : undefined,
        pendingCodOrder:  hasPending ? data.pendingCodOrder                             : undefined,
        quickReplies,
      }]);
    } catch {
      setMessages(m => [...m, {
        role: 'bot',
        text: `I'm having trouble connecting right now 😅 — reach us directly on WhatsApp at ${store.whatsAppNumber ?? 'our WhatsApp'}!`,
        quickReplies: ['💬 Open WhatsApp'],
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [slug, sessionId, isTyping, store.whatsAppNumber]);

  const handleOnlinePayment = useCallback((cart: ChatMessage['onlineCart']) => {
    if (!cart) return;
    clearCart();
    for (const item of cart.items) {
      for (let i = 0; i < item.qty; i++)
        addItem({ productId: item.productId, productTitle: item.title, unitPrice: item.unitPrice, variantInfo: item.variantInfo });
    }
    setOpen(false);
    onOpenCart();
  }, [addItem, clearCart, onOpenCart]);

  /** Send OTP to customer email for chat COD order */
  const handleChatSendOtp = useCallback(async (pending: ChatMessage['pendingCodOrder'], msgIdx: number) => {
    if (!chatOtpEmail.trim()) { setChatOtpError('Please enter your email address.'); return; }
    setChatOtpError(null);
    setChatOtpStep('sending');
    setChatOtpMsgIdx(msgIdx);
    try {
      const res = await fetch(`${BASE_URL}/public/${slug}/cod-otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: chatOtpEmail.trim(), customerName: pending?.name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'Failed to send code.');
      setChatOtpStep('awaiting');
    } catch (err: any) {
      setChatOtpError(err.message ?? 'Failed to send verification code. Please try again.');
      setChatOtpStep('idle');
    }
  }, [chatOtpEmail, slug]);

  /** Verify OTP and place the COD order */
  const handleChatConfirmOrder = useCallback(async (pending: ChatMessage['pendingCodOrder']) => {
    if (!pending) return;
    if (!chatOtpCode.trim()) { setChatOtpError('Please enter the 6-digit code.'); return; }
    setChatOtpError(null);
    setChatOtpStep('placing');
    try {
      const res = await fetch(`${BASE_URL}/public/${slug}/chat/confirm-cod-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName:    pending.name,
          customerPhone:   pending.phone,
          customerEmail:   chatOtpEmail.trim(),
          emailOtp:        chatOtpCode.trim(),
          deliveryAddress: pending.address,
          cart:            pending.cart,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setChatOtpError(data?.error ?? 'Invalid or expired code. Please try again.');
        setChatOtpStep('awaiting');
        return;
      }
      // Replace the pending message with a confirmed order card
      setMessages(m => m.map((msg, i) =>
        i === chatOtpMsgIdx
          ? { ...msg, pendingCodOrder: undefined, orderDetails: { orderId: data.orderId, orderNumber: data.orderNumber, totalAmount: data.totalAmount, slug: data.slug ?? slug } }
          : msg
      ));
      // Reset OTP state
      setChatOtpStep('idle');
      setChatOtpEmail('');
      setChatOtpCode('');
      setChatOtpMsgIdx(null);
    } catch (err: any) {
      setChatOtpError(err.message ?? 'Something went wrong. Please try again.');
      setChatOtpStep('awaiting');
    }
  }, [chatOtpCode, chatOtpEmail, chatOtpMsgIdx, slug]);

  const whatsappUrl = store.whatsAppNumber
    ? generateWhatsAppLink(store.whatsAppNumber, 'Hi! I came from your online store.')
    : null;
  const initial = (store.name[0] ?? 'S').toUpperCase();

  return (
    <>
      {/* ── Floating button ────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ backgroundColor: themeColor, boxShadow: `0 8px 28px ${themeColor}66` }}
        aria-label={open ? 'Close chat' : 'Chat with us'}
      >
        <div className={`absolute transition-all duration-200 ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <X className="w-6 h-6" />
        </div>
        <div className={`absolute transition-all duration-200 ${open ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
          <Bot className="w-6 h-6" />
        </div>
        {!open && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center shadow">
            {unreadCount}
          </span>
        )}
      </button>

      {/* ── Chat panel ─────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed bottom-24 right-3 left-3 sm:left-auto sm:right-6 sm:w-[420px] z-40 bg-white rounded-3xl overflow-hidden flex flex-col"
          style={{
            maxHeight: '85vh',
            boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
            transform:  panelVisible ? 'translateY(0) scale(1)'    : 'translateY(24px) scale(0.96)',
            opacity:    panelVisible ? 1 : 0,
            transition: 'transform 0.25s cubic-bezier(.21,1.02,.73,1), opacity 0.2s ease',
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3.5 flex items-center gap-3 text-white flex-shrink-0 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}cc 100%)` }}
          >
            {/* Decorative blobs */}
            <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute right-6 top-8 w-10 h-10 rounded-full bg-white/5 pointer-events-none" />

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {store.logoUrl
                ? <div className="w-10 h-10 rounded-xl bg-white overflow-hidden border-2 border-white/60 shadow-sm">
                    <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
                  </div>
                : <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center text-lg font-bold">{initial}</div>
              }
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-tight truncate">{store.name}</p>
              <p className="text-[11px] text-white/75 mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                AI Shopping Assistant · Usually instant
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0 relative">
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noreferrer"
                  className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                  title="Open WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: '#f8fafc' }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                {/* Bot avatar */}
                {msg.role === 'bot' && (
                  <div className={`w-7 h-7 rounded-xl flex-shrink-0 mt-1 overflow-hidden shadow-sm border ${store.logoUrl ? 'bg-white border-slate-200' : 'border-transparent'}`}
                    style={store.logoUrl ? {} : { backgroundColor: themeColor }}>
                    {store.logoUrl
                      ? <img src={optimizeImage(store.logoUrl, 128)} className="w-full h-full object-cover" alt={store.name} />
                      : <div className="w-full h-full flex items-center justify-center"><Bot className="w-3.5 h-3.5 text-white" /></div>
                    }
                  </div>
                )}

                <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end max-w-[88%]' : 'items-start'} ${
                  msg.role === 'bot' && msg.products && msg.products.length > 0 && !msg.orderDetails && !msg.onlineCart
                    ? 'w-full'      // full width so carousel can scroll freely
                    : msg.role === 'bot' ? 'max-w-[88%]' : ''
                }`}>
                  {/* Bubble */}
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'text-white rounded-tr-sm'
                        : 'bg-white text-slate-700 rounded-tl-sm border border-slate-100'
                    } ${msg.role === 'bot' && msg.products?.length && !msg.orderDetails && !msg.onlineCart ? 'self-start max-w-[88%]' : ''}`}
                    style={msg.role === 'user' ? { backgroundColor: themeColor } : {}}
                  >
                    {msg.text}
                  </div>

                  {/* Product carousel — only shown when no order has been placed */}
                  {msg.products && msg.products.length > 0 && !msg.orderDetails && !msg.onlineCart && (
                    <ProductCarousel count={msg.products.length}>
                      {msg.products.map((p: any) => (
                        <ProductChatCard
                          key={p.id}
                          product={p}
                          themeColor={themeColor}
                          store={store}
                          onSend={send}
                          onViewProduct={onViewProduct}
                          onAddToCart={prod => {
                            addItem({
                              productId: prod.id,
                              productTitle: prod.title,
                              unitPrice: prod.minVariantPrice ?? prod.discountedPrice ?? prod.basePrice,
                              variantInfo: undefined,
                            });
                          }}
                        />
                      ))}
                    </ProductCarousel>
                  )}

                  {/* COD order card */}
                  {msg.orderDetails && (
                    <div className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-emerald-800">Order Confirmed! 🎉</p>
                          <p className="text-[11px] text-emerald-600 font-medium">#{msg.orderDetails.orderNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500">Total</p>
                          <p className="text-sm font-bold" style={{ color: themeColor }}>
                            {formatCurrency(msg.orderDetails.totalAmount, store.currency ?? 'INR')}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`${BASE_URL}/public/${msg.orderDetails.slug}/orders/${msg.orderDetails.orderId}/invoice`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border text-xs font-semibold transition-all"
                        style={{ borderColor: themeColor, color: themeColor }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = themeColor; el.style.color = '#fff'; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = ''; el.style.color = themeColor; }}
                      >
                        <Download className="w-3.5 h-3.5" />
                        View / Download Invoice
                      </a>
                    </div>
                  )}

                  {/* Chat COD — email OTP verification card */}
                  {msg.pendingCodOrder && !msg.orderDetails && (
                    <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-base">📧</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-amber-900">Verify your email to confirm order</p>
                          <p className="text-[10px] text-amber-700">
                            Total: <strong>{formatCurrency(msg.pendingCodOrder.totalAmount, store.currency ?? 'INR')}</strong> · COD
                          </p>
                        </div>
                      </div>

                      {chatOtpStep === 'idle' || (chatOtpMsgIdx !== idx && chatOtpStep !== 'placing') ? (
                        <>
                          <input
                            type="email"
                            placeholder="your@email.com"
                            value={chatOtpEmail}
                            onChange={e => { setChatOtpEmail(e.target.value); setChatOtpError(null); }}
                            className="w-full border border-amber-200 bg-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': themeColor } as any}
                          />
                          {chatOtpError && chatOtpMsgIdx === idx && (
                            <p className="text-[11px] text-red-500">{chatOtpError}</p>
                          )}
                          <button
                            onClick={() => handleChatSendOtp(msg.pendingCodOrder, idx)}
                            disabled={chatOtpStep === 'sending'}
                            className="w-full py-2.5 rounded-xl text-white text-xs font-bold disabled:opacity-50"
                            style={{ backgroundColor: themeColor }}
                          >
                            {chatOtpStep === 'sending' && chatOtpMsgIdx === idx ? 'Sending code...' : 'Send Verification Code →'}
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="bg-white border border-amber-200 rounded-xl px-3 py-2 text-[11px] text-amber-800">
                            Code sent to <strong>{chatOtpEmail}</strong> · expires in 10 min
                          </div>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="6-digit code"
                            value={chatOtpCode}
                            onChange={e => { setChatOtpCode(e.target.value.replace(/\D/g,'').slice(0,6)); setChatOtpError(null); }}
                            className="w-full border border-amber-200 bg-white rounded-xl px-3 py-2 text-sm text-center tracking-[0.4em] font-bold focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': themeColor } as any}
                          />
                          {chatOtpError && (
                            <p className="text-[11px] text-red-500 text-center">{chatOtpError}</p>
                          )}
                          <button
                            onClick={() => handleChatConfirmOrder(msg.pendingCodOrder)}
                            disabled={chatOtpStep === 'placing' || chatOtpCode.length !== 6}
                            className="w-full py-2.5 rounded-xl text-white text-xs font-bold disabled:opacity-50"
                            style={{ backgroundColor: themeColor }}
                          >
                            {chatOtpStep === 'placing' ? 'Placing order...' : '✅ Verify & Place Order'}
                          </button>
                          <button
                            onClick={() => { setChatOtpStep('idle'); setChatOtpCode(''); setChatOtpError(null); }}
                            className="w-full text-[11px] text-amber-600 hover:text-amber-800 py-0.5"
                          >
                            ← Change email / resend code
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Online payment card */}
                  {msg.onlineCart && (
                    <div className="w-full bg-violet-50 border border-violet-200 rounded-2xl p-3.5">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Zap className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-violet-800">Ready to Pay Online 💳</p>
                          <p className="text-[11px] text-violet-600">
                            {msg.onlineCart.items.length} item{msg.onlineCart.items.length !== 1 ? 's' : ''} ·{' '}
                            {formatCurrency(msg.onlineCart.items.reduce((s, i) => s + i.qty * i.unitPrice, 0), store.currency ?? 'INR')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOnlinePayment(msg.onlineCart)}
                        className="w-full py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: themeColor }}
                      >
                        Complete Payment →
                      </button>
                    </div>
                  )}

                  {/* Quick reply pills */}
                  {msg.quickReplies && msg.role === 'bot' && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.quickReplies.map(qr => {
                        const isWa = qr.includes('WhatsApp') && whatsappUrl;
                        return isWa ? (
                          <a key={qr} href={whatsappUrl!} target="_blank" rel="noreferrer"
                            className="text-xs px-3 py-1.5 rounded-full border font-medium bg-white shadow-sm transition-all hover:shadow"
                            style={{ borderColor: themeColor, color: themeColor }}>
                            {qr}
                          </a>
                        ) : (
                          <button key={qr} onClick={() => send(qr)}
                            className="text-xs px-3 py-1.5 rounded-full border font-medium bg-white shadow-sm transition-all hover:shadow-md"
                            style={{ borderColor: themeColor, color: themeColor }}
                            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = themeColor; el.style.color = '#fff'; }}
                            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = '#fff'; el.style.color = themeColor; }}
                          >
                            {qr}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* User avatar */}
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 flex-shrink-0 mt-1 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <div className={`w-7 h-7 rounded-xl flex-shrink-0 mt-1 overflow-hidden shadow-sm border ${store.logoUrl ? 'bg-white border-slate-200' : 'border-transparent'}`}
                  style={store.logoUrl ? {} : { backgroundColor: themeColor }}>
                  {store.logoUrl
                    ? <img src={store.logoUrl} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full flex items-center justify-center"><Bot className="w-3.5 h-3.5 text-white" /></div>
                  }
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm mt-1">
                  <div className="flex gap-1.5 items-center h-4">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"
                            style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3.5 pb-3.5 pt-3 border-t border-slate-100 bg-white flex-shrink-0">
            <div
              className="flex items-center gap-2 bg-slate-50 rounded-2xl px-3.5 py-2.5 border transition-colors"
              style={{ borderColor: inputFocused ? themeColor : '#e2e8f0' }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Type a message..."
                className="flex-1 text-sm bg-transparent focus:outline-none text-slate-700 placeholder:text-slate-400"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || isTyping}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0 disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: themeColor }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            {!store?.allowsCustomBranding && (
              <p className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                <Bot className="w-3 h-3" />
                Powered by <span className="font-semibold">Silarai AI</span>
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function PublicStorefrontPage({ overrideSlug }: { overrideSlug?: string } = {}) {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = overrideSlug ?? paramSlug;
  return (
    <StorefrontAuthProvider>
      <PublicStorefrontPageInner slug={slug} isCustomDomain={!!overrideSlug} />
    </StorefrontAuthProvider>
  );
}

function PublicStorefrontPageInner({ slug, isCustomDomain }: { slug: string | undefined; isCustomDomain: boolean }) {
  const overrideSlug = isCustomDomain ? slug : undefined; // keep isCustomDomain=!!overrideSlug logic intact
  const { productId: paramProductId, categorySlug: paramCategorySlug } = useParams<{ productId?: string; categorySlug?: string }>();
  const { totalItems, addItem } = useCart();
  const { customer, isAuthenticated } = useStorefrontAuth();
  const [showAuthModal, setShowAuthModal]         = useState(false);
  const [showAccountPanel, setShowAccountPanel]   = useState(false);
  const [showReturnPolicy, setShowReturnPolicy]   = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [sort, setSort] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // Review aggregate for JSON-LD (fetched when a product modal opens)
  const [productReviews, setProductReviews] = useState<{ averageRating: number; totalCount: number } | null>(null);

  // UI state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [heroTagIdx, setHeroTagIdx] = useState(0);

  // ── Branded loading screen ─────────────────────────────────────────────────
  // Minimum 400ms so the logo doesn't flash for sub-100ms API responses,
  // but we never artificially delay past when data actually arrives.
  const [loaderDone,    setLoaderDone]    = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true); // fade-out trigger

  // PWA install banner removed — was overlapping social CTAs in bottom-right corner

  // Rotate hero collection tag every 3s
  useEffect(() => {
    const t = setInterval(() => setHeroTagIdx(i => i + 1), 3000);
    return () => clearInterval(t);
  }, []);
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
    // GA4 event — currency read at call-time so store doesn't need to be in deps
    gtagEvent('add_to_cart', {
      currency: 'INR',
      value: product.discountedPrice ?? product.basePrice,
      items: [{ item_id: product.id, item_name: product.title, price: product.discountedPrice ?? product.basePrice, quantity: 1 }],
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
    staleTime: 5 * 60 * 1000,  // treat store config as fresh for 5 min
    gcTime:    30 * 60 * 1000, // keep in memory for 30 min
  });

  // Start the 2-second minimum timer as soon as the component mounts.
  // The branded loader hides only when BOTH this timer fires AND store data arrives.
  useEffect(() => {
    const t = setTimeout(() => setLoaderDone(true), 400);
    return () => clearTimeout(t);
  }, []);

  // Skip the loader entirely if store data was already in React Query cache (repeat visit).
  // This lets the page render immediately on return visits, boosting LCP significantly.
  const loaderEnabled = store?.loaderEnabled !== false;
  const hasCachedData = !!store; // if store resolved synchronously from cache, skip loader
  const showBrandedLoader = loaderEnabled && !hasCachedData && (!loaderDone || storeLoading);

  useEffect(() => {
    if (!showBrandedLoader && loaderVisible) {
      // Give the CSS fade-out 400 ms to complete before we stop rendering it
      const t = setTimeout(() => setLoaderVisible(false), 400);
      return () => clearTimeout(t);
    }
  }, [showBrandedLoader, loaderVisible]);

  useEffect(() => {
    if (!store?.name) return;

    const title    = (store as any).seoTitle       || `${store.name} — Shop Online`;
    const desc     = (store as any).seoDescription || store.description || `Shop at ${store.name} on WhatsApp.`;
    const img      = (store as any).seoImage       || (store as any).bannerUrl || (store as any).logoUrl || '';
    const keywords = (store as any).seoKeywords    || '';
    const url      = window.location.href;

    document.title = title;

    // Helper: set or create a <meta> tag
    function setMeta(selector: string, attr: string, value: string) {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr.split('=')[0], attr.split('=')[1] ?? attr);
        el.dataset.storefront = '1';
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    }

    setMeta('meta[name="description"]',         'name=description',         desc);
    if (keywords) setMeta('meta[name="keywords"]', 'name=keywords',          keywords);
    setMeta('meta[property="og:title"]',        'property=og:title',        title);
    setMeta('meta[property="og:description"]',  'property=og:description',  desc);
    setMeta('meta[property="og:url"]',          'property=og:url',          url);
    setMeta('meta[property="og:type"]',         'property=og:type',         'website');
    if (img) setMeta('meta[property="og:image"]', 'property=og:image',      img);
    setMeta('meta[name="twitter:card"]',        'name=twitter:card',        'summary_large_image');
    setMeta('meta[name="twitter:title"]',       'name=twitter:title',       title);
    setMeta('meta[name="twitter:description"]', 'name=twitter:description', desc);
    if (img) setMeta('meta[name="twitter:image"]', 'name=twitter:image',    img);

    // Canonical URL — prevents duplicate content across query param variations
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.dataset.storefront = '1';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + window.location.pathname;

    // Sitemap reference for Googlebot
    const sitemapHref = `${BASE_URL}/public/${slug}/sitemap.xml`;
    let sitemapLink = document.querySelector<HTMLLinkElement>('link[rel="sitemap"]');
    if (!sitemapLink) {
      sitemapLink = document.createElement('link');
      sitemapLink.rel = 'sitemap';
      sitemapLink.type = 'application/xml';
      sitemapLink.dataset.storefront = '1';
      document.head.appendChild(sitemapLink);
    }
    sitemapLink.setAttribute('href', sitemapHref);

    return () => {
      document.title = 'Silarai';
      // Remove dynamically added tags (canonical, sitemap, custom metas)
      document.head.querySelectorAll('[data-storefront="1"]').forEach(el => el.remove());
      // Restore static OG tags
      setMeta('meta[name="description"]',        'name=description',        'Silarai helps social sellers manage WhatsApp orders.');
      setMeta('meta[property="og:title"]',       'property=og:title',       'Silarai — Turn WhatsApp Chats Into Orders');
      setMeta('meta[property="og:description"]', 'property=og:description', 'Silarai helps social sellers manage WhatsApp orders.');
    };
  }, [store?.name, (store as any)?.seoTitle, (store as any)?.seoKeywords]);

  // ── JSON-LD: Organization / OnlineStore schema ────────────────────────────
  useEffect(() => {
    if (!store?.name) return;
    const org: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'OnlineStore',
      name: store.name,
      url: window.location.origin,
    };
    if (store.description)              org.description = store.description;
    if ((store as any).seoKeywords)    org.keywords    = (store as any).seoKeywords;
    if (store.logoUrl)     { org.logo = { '@type': 'ImageObject', url: store.logoUrl }; org.image = store.logoUrl; }
    if (store.whatsAppNumber) {
      org.contactPoint = {
        '@type': 'ContactPoint',
        telephone: `+${store.whatsAppNumber.replace(/\D/g, '')}`,
        contactType: 'customer service',
        availableLanguage: 'en',
      };
    }
    const sameAs: string[] = [];
    if (store.instagramHandle) sameAs.push(`https://www.instagram.com/${store.instagramHandle.replace('@', '')}`);
    if (store.facebookPageUrl) sameAs.push(store.facebookPageUrl);
    if (sameAs.length) org.sameAs = sameAs;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id   = 'ld-json-org';
    script.textContent = JSON.stringify(org);
    document.head.appendChild(script);
    return () => document.getElementById('ld-json-org')?.remove();
  }, [store?.name, store?.description, store?.logoUrl]);

  // ── JSON-LD: Product schema + per-product meta (when modal is open) ───────
  useEffect(() => {
    if (!selectedProduct || !store) return;
    const currency   = store.currency ?? 'INR';
    const price      = (selectedProduct.discountedPrice ?? selectedProduct.basePrice).toFixed(2);
    const productUrl = window.location.origin + window.location.pathname;
    const outOfStock = selectedProduct.isOutOfStock === true
      || (selectedProduct.stockQuantity !== undefined && selectedProduct.stockQuantity !== null && selectedProduct.stockQuantity <= 0);

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        const [a, v] = attr.split('=');
        el.setAttribute(a, v ?? a);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    const productTitle = `${selectedProduct.title} — ${store.name}`;
    const productDesc  = selectedProduct.description
      || `Buy ${selectedProduct.title} at ${store.name}. ${currency} ${price}.`;
    const productImg   = selectedProduct.primaryImage || store.logoUrl || '';

    document.title = productTitle;
    setMeta('meta[name="description"]',          'name=description',          productDesc);
    setMeta('meta[property="og:title"]',         'property=og:title',         productTitle);
    setMeta('meta[property="og:description"]',   'property=og:description',   productDesc);
    setMeta('meta[property="og:type"]',          'property=og:type',          'product');
    setMeta('meta[property="og:url"]',           'property=og:url',           productUrl);
    if (productImg) setMeta('meta[property="og:image"]', 'property=og:image', productImg);
    setMeta('meta[name="twitter:title"]',        'name=twitter:title',        productTitle);
    setMeta('meta[name="twitter:description"]',  'name=twitter:description',  productDesc);
    if (productImg) setMeta('meta[name="twitter:image"]', 'name=twitter:image', productImg);

    const productSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name:  selectedProduct.title,
      url:   productUrl,
      brand: { '@type': 'Brand', name: store.name },
      offers: {
        '@type':         'Offer',
        url:             productUrl,
        priceCurrency:   currency,
        price,
        itemCondition:   'https://schema.org/NewCondition',
        availability:    outOfStock
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      },
    };
    if (selectedProduct.description)       productSchema.description = selectedProduct.description;
    if (selectedProduct.allImages?.length) productSchema.image       = selectedProduct.allImages;
    else if (selectedProduct.primaryImage) productSchema.image       = selectedProduct.primaryImage;
    if (selectedProduct.categoryName)      productSchema.category    = selectedProduct.categoryName;

    // Star ratings in Google search results — only when reviews exist
    if (productReviews && productReviews.totalCount > 0 && productReviews.averageRating > 0) {
      productSchema.aggregateRating = {
        '@type':      'AggregateRating',
        ratingValue:  productReviews.averageRating.toFixed(1),
        reviewCount:  productReviews.totalCount,
        bestRating:   '5',
        worstRating:  '1',
      };
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id   = 'ld-json-product';
    script.textContent = JSON.stringify(productSchema);
    document.head.appendChild(script);

    return () => {
      document.getElementById('ld-json-product')?.remove();
      // Restore store-level meta
      if (store) {
        const storeTitle = (store as any).seoTitle || `${store.name} — Shop Online`;
        document.title = storeTitle;
        const ogTitle = document.head.querySelector<HTMLMetaElement>('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', storeTitle);
        const ogType = document.head.querySelector<HTMLMetaElement>('meta[property="og:type"]');
        if (ogType) ogType.setAttribute('content', 'website');
      }
    };
  }, [selectedProduct?.id, productReviews]);

  // ── Update browser URL when product modal opens/closes (for shareability) ──
  useEffect(() => {
    if (!slug) return;
    if (selectedProduct) {
      const productKey = (selectedProduct as any).slug ?? selectedProduct.id;
      const productPath = isCustomDomain
        ? `/products/${productKey}`
        : `/${slug}/products/${productKey}`;
      window.history.replaceState({ productId: selectedProduct.id }, '', productPath);
      // Update canonical for the product URL
      const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (canonical) canonical.href = window.location.origin + productPath;
    } else {
      const basePath = isCustomDomain ? '/' : `/${slug}`;
      window.history.replaceState({}, '', basePath);
      const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (canonical) canonical.href = window.location.origin + basePath;
    }
  }, [selectedProduct?.id, slug, isCustomDomain]);

  // Dynamically update the browser tab favicon to reflect the store's logo/colour
  useEffect(() => {
    if (!store) return;

    // Build a favicon URL: prefer dedicated faviconUrl, fall back to logoUrl,
    // then fall back to the backend-generated SVG monogram endpoint.
    // IMPORTANT: data: URIs are ignored by Google Search — always use a real HTTP URL.
    const faviconUrl: string =
      store.faviconUrl ||
      store.logoUrl ||
      `${BASE_URL}/public/${slug}/favicon.svg`;

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
  }, [store?.faviconUrl, store?.logoUrl, store?.name, store?.themeColor]);

  // Dynamically inject Google Analytics 4 tag when the store has a Measurement ID
  useEffect(() => {
    const mid = store?.ga4MeasurementId;
    if (!mid) return;

    // Avoid double-injecting if gtag is already on the page
    const existingScript = document.getElementById('gtag-script');
    if (existingScript) return;

    const script1 = document.createElement('script');
    script1.id = 'gtag-script';
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${mid}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.id = 'gtag-inline';
    script2.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${mid}');
    `;
    document.head.appendChild(script2);

    return () => {
      document.getElementById('gtag-script')?.remove();
      document.getElementById('gtag-inline')?.remove();
    };
  }, [store?.ga4MeasurementId]);

  // Inject custom animation keyframes once on mount
  useEffect(() => {
    if (document.getElementById('rc-animations')) return;
    const style = document.createElement('style');
    style.id = 'rc-animations';
    style.textContent = `
      @keyframes rcFadeInUp {
        from { opacity: 0; transform: translateY(22px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes rcFadeInScale {
        from { opacity: 0; transform: scale(0.94); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes rcSlideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes rcShimmer {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      @keyframes marqueeScroll {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById('rc-animations')?.remove(); };
  }, []);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['public-categories', slug],
    queryFn: () => axios.get(`${BASE_URL}/public/${slug}/categories`).then(r => r.data),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime:    30 * 60 * 1000,
  });

  interface NavPage { id: string; title: string; slug: string; showInNav: boolean; showInFooter: boolean; }
  const { data: customPages = [] } = useQuery<NavPage[]>({
    queryKey: ['public-pages-nav', slug],
    queryFn: () => fetch(`${BASE_URL}/public/${slug}/pages`).then(r => r.json()),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
  const navPages    = customPages.filter(p => p.showInNav);
  const footerPages = customPages.filter(p => p.showInFooter);
  const pageBase    = isCustomDomain ? `/p` : `/${slug}/p`;

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['public-products', slug, debouncedSearch, selectedCategory, selectedSubCategory, sort, inStockOnly, page],
    queryFn: () => axios.get(`${BASE_URL}/public/${slug}/products`, {
      params: {
        search: debouncedSearch || undefined,
        categoryId: selectedSubCategory || selectedCategory || undefined,
        sort: sort || undefined,
        inStockOnly: inStockOnly || undefined,
        page,
        pageSize: PAGE_SIZE,
      },
    }).then(r => r.data),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
    gcTime:    10 * 60 * 1000,
  });

  const allProducts: Product[] = productsData?.items ?? [];
  const totalCount: number = productsData?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ── Auto-open product modal when URL contains /products/:slugOrId ──
  useEffect(() => {
    if (!paramProductId || !slug) return;
    // Match by slug first, then fall back to id (for old UUID links)
    const cached = allProducts.find(
      p => (p as any).slug === paramProductId || p.id === paramProductId
    );
    if (cached) { setSelectedProduct(cached); return; }
    if (allProducts.length > 0) return; // products loaded but this one not found
    // Products not loaded yet — fetch the single product directly (backend accepts slug or UUID)
    axios.get(`${BASE_URL}/public/${slug}/products/${paramProductId}`)
      .then(r => setSelectedProduct(r.data))
      .catch(() => {});
  }, [paramProductId, slug, allProducts.length]);

  // ── Fetch review aggregate when a product modal opens (for JSON-LD stars) ──
  useEffect(() => {
    if (!selectedProduct || !slug) { setProductReviews(null); return; }
    axios.get(`${BASE_URL}/public/${slug}/products/${selectedProduct.id}/reviews`)
      .then(r => setProductReviews({
        averageRating: r.data.averageRating,
        totalCount:    r.data.totalCount,
      }))
      .catch(() => setProductReviews(null));
  }, [selectedProduct?.id, slug]);

  // ── Auto-select category from URL /category/:categorySlug ─────────────────
  useEffect(() => {
    if (!paramCategorySlug || !categories?.length) return;
    const cat = (categories as Array<{ id: string; name: string }>).find(
      c => c.name.toLowerCase().replace(/\s+/g, '-') === paramCategorySlug
    );
    if (cat) setSelectedCategory(cat.id);
  }, [paramCategorySlug, categories]);

  // ── Update URL when category filter changes ───────────────────────────────
  useEffect(() => {
    if (!slug || selectedProduct) return; // product URL takes priority
    if (selectedCategory) {
      const cat = (categories as Array<{ id: string; name: string }>)?.find(c => c.id === selectedCategory);
      const catSlug = cat ? cat.name.toLowerCase().replace(/\s+/g, '-') : selectedCategory;
      const catPath = isCustomDomain ? `/category/${catSlug}` : `/${slug}/category/${catSlug}`;
      window.history.replaceState({ categoryId: selectedCategory }, '', catPath);
    } else if (!paramProductId) {
      const basePath = isCustomDomain ? '/' : `/${slug}`;
      window.history.replaceState({}, '', basePath);
    }
  }, [selectedCategory, slug, isCustomDomain, selectedProduct, paramProductId]);

  // Called when the user clicks "View" on a product card inside the chatbot
  const handleChatViewProduct = useCallback(async (productId: string) => {
    // Try the already-loaded list first (instant, no network)
    const cached = allProducts.find(p => p.id === productId);
    if (cached) { setSelectedProduct(cached); return; }
    // Fallback: fetch the full product (with variants) from the API
    try {
      const res = await axios.get(`${BASE_URL}/public/${slug}/products/${productId}`);
      setSelectedProduct(res.data);
    } catch { /* ignore — product card just won't open */ }
  }, [allProducts, slug]);

  // ── Branded loading screen ────────────────────────────────────────────────
  // Shown for a minimum of 2 seconds (or until store data arrives, whichever
  // is longer) when the tenant has loaderEnabled = true (the default).
  if (loaderVisible && (showBrandedLoader || storeLoading)) {
    const tc  = store?.themeColor ?? '#0F766E';
    const sc  = store?.secondaryColor ?? '#134E4A';
    const logo = store?.faviconUrl ?? store?.logoUrl;
    const name = store?.name ?? '';
    const initials = name.slice(0, 2).toUpperCase() || 'RC';
    const fading = !showBrandedLoader && !storeLoading;
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: `linear-gradient(135deg, ${tc} 0%, ${sc} 100%)`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '24px',
          transition: 'opacity 0.4s ease',
          opacity: fading ? 0 : 1,
        }}
      >
        {/* Logo or monogram */}
        {logo ? (
          <img
            src={logo}
            alt={name}
            style={{
              width: 88, height: 88, borderRadius: 20,
              objectFit: 'cover',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              background: 'white',
            }}
          />
        ) : (
          <div style={{
            width: 88, height: 88, borderRadius: 20,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 800, color: 'white',
            letterSpacing: '-1px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
          }}>
            {initials}
          </div>
        )}

        {/* Store name */}
        {name && (
          <p style={{
            color: 'rgba(255,255,255,0.92)',
            fontSize: 18, fontWeight: 700,
            letterSpacing: '-0.3px',
            margin: 0,
            textShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }}>
            {name}
          </p>
        )}

        {/* Spinner ring */}
        <div style={{ position: 'relative', width: 40, height: 40 }}>
          <svg viewBox="0 0 40 40" style={{ width: 40, height: 40 }}>
            <circle cx="20" cy="20" r="16"
              fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3.5" />
            <circle cx="20" cy="20" r="16"
              fill="none" stroke="white" strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="60 40"
              style={{
                transformOrigin: '20px 20px',
                animation: 'rc-spin 0.9s linear infinite',
              }}
            />
          </svg>
          <style>{`@keyframes rc-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

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

  const tc = store.themeColor    ?? '#0f766e';  // primary
  const sc = store.secondaryColor ?? '#134E4A'; // secondary
  // const ac = store.accentColor ?? tc;         // accent — reserved for future use

  const HEADER_H = 68; // px — height of sticky top nav
  const scrollToEl = (el: HTMLElement | null, extra = 0) => {
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - HEADER_H - extra;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  };
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToCategories = () => scrollToEl(categoriesRef.current ?? productsRef.current, 16);
  const scrollToProducts = () => scrollToEl(productsRef.current, 8);
  const scrollToContact = () => scrollToEl(footerRef.current as HTMLElement | null, 16);

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
        <div className="bg-slate-900 text-white text-xs py-2 overflow-hidden relative">
          <div
            className="whitespace-nowrap inline-block"
            style={{ animation: 'marqueeScroll 22s linear infinite' }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="mx-12">✦ {store.announcementText}</span>
            ))}
          </div>
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
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {/* Static nav items */}
            {(['Home', 'Categories', 'All Products', 'About Us'] as const).map(item => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                {item}
              </button>
            ))}

            {/* Featured categories with subcategory dropdowns */}
            {categories.filter(c => c.isFeatured).map(cat => (
              <div key={cat.id} className="relative group">
                <button
                  onClick={() => { setSelectedCategory(cat.id); setSelectedSubCategory(null); setPage(1); scrollToProducts(); }}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  style={{ color: selectedCategory === cat.id ? tc : undefined }}
                >
                  {cat.name}
                  {(cat.subCategories?.length ?? 0) > 0 && (
                    <ChevronRight className="w-3 h-3 rotate-90 opacity-50" />
                  )}
                </button>

                {/* Dropdown — only if subcategories exist */}
                {(cat.subCategories?.length ?? 0) > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                    <button
                      onClick={() => { setSelectedCategory(cat.id); setSelectedSubCategory(null); setPage(1); scrollToProducts(); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 font-medium"
                    >
                      All {cat.name}
                    </button>
                    <div className="border-t border-slate-50 mt-1 pt-1">
                      {cat.subCategories!.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => { setSelectedCategory(cat.id); setSelectedSubCategory(sub.id); setPage(1); scrollToProducts(); }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          style={{ color: selectedSubCategory === sub.id ? tc : undefined }}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Custom pages */}
            {navPages.map(p => (
              <a
                key={p.id}
                href={`${pageBase}/${p.slug}`}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                {p.title}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(o => !o)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600"
              aria-label="Search products"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Cart icon */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600"
              aria-label={`View cart${totalItems > 0 ? ` (${totalItems} items)` : ''}`}
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

            {/* Account button */}
            <button
              onClick={() => isAuthenticated ? setShowAccountPanel(true) : setShowAuthModal(true)}
              className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600"
              aria-label={isAuthenticated ? `My Account (${customer?.name})` : 'Sign In'}
            >
              <UserCircle className="w-5 h-5" />
              {isAuthenticated && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
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
            {(['Home', 'Categories', 'All Products', 'About Us'] as const).map(item => (
              <button
                key={item}
                onClick={() => { handleNavClick(item); setMobileMenuOpen(false); }}
                className="block w-full text-left text-sm py-2 px-3 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
              >
                {item}
              </button>
            ))}

            {/* Featured categories in mobile menu */}
            {categories.filter(c => c.isFeatured).map(cat => (
              <div key={cat.id}>
                <button
                  onClick={() => { setSelectedCategory(cat.id); setSelectedSubCategory(null); setPage(1); scrollToProducts(); setMobileMenuOpen(false); }}
                  className="block w-full text-left text-sm py-2 px-3 rounded-xl font-semibold hover:bg-slate-50"
                  style={{ color: tc }}
                >
                  {cat.name}
                </button>
                {(cat.subCategories?.length ?? 0) > 0 && (
                  <div className="ml-4 border-l-2 border-slate-100 pl-2 space-y-0.5">
                    {cat.subCategories!.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => { setSelectedCategory(cat.id); setSelectedSubCategory(sub.id); setPage(1); scrollToProducts(); setMobileMenuOpen(false); }}
                        className="block w-full text-left text-sm py-1.5 px-3 rounded-xl text-slate-600 hover:bg-slate-50"
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {navPages.map(p => (
              <a
                key={p.id}
                href={`${pageBase}/${p.slug}`}
                className="block text-sm py-2 px-3 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {p.title}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      {store.bannerUrl ? (
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img
            src={optimizeImage(store.bannerUrl, 800)}
            srcSet={`${optimizeImage(store.bannerUrl, 480)} 480w, ${optimizeImage(store.bannerUrl, 800)} 800w, ${optimizeImage(store.bannerUrl, 1200)} 1200w`}
            sizes="100vw"
            alt={`${store.name} store banner`}
            className="w-full h-full object-cover"
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
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
      ) : (() => {
          const heroTags = categories.length > 0
            ? categories.map(c => c.name)
            : ['New Arrivals', 'Best Sellers', 'Featured Collection', 'Handpicked Picks'];
          const currentTag = heroTags[heroTagIdx % heroTags.length];
          return (
            <div
              className="relative min-h-[480px] md:min-h-[580px] flex items-center justify-center overflow-hidden"
              style={{ background: `linear-gradient(150deg, ${sc} 0%, ${tc} 55%, #000 100%)` }}
            >
              {/* Precision grid overlay — futuristic tech feel */}
              <div className="absolute inset-0 opacity-[0.07]" style={{
                backgroundImage: `linear-gradient(${tc}88 1px, transparent 1px), linear-gradient(90deg, ${tc}88 1px, transparent 1px)`,
                backgroundSize: '48px 48px',
              }} />

              {/* Glowing orb — top right */}
              <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20"
                style={{ background: `radial-gradient(circle, ${tc}, transparent 70%)` }} />
              {/* Glowing orb — bottom left */}
              <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-15"
                style={{ background: `radial-gradient(circle, ${tc}cc, transparent 70%)` }} />


              <div className="relative text-center text-white px-6 z-10 max-w-3xl mx-auto">
                {/* Rotating category chip */}
                <div
                  key={currentTag}
                  className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-bold mb-6 tracking-widest uppercase"
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(8px)',
                    animation: 'rcFadeInUp 0.4s ease-out',
                  }}
                >
                  <Sparkles className="w-3 h-3" /> {currentTag}
                </div>

                {/* Store name — bold, gradient highlight on last word */}
                <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight leading-none">
                  {store.name}
                </h1>
                <div className="w-16 h-1 mx-auto mb-5 rounded-full opacity-60" style={{ backgroundColor: tc }} />

                {store.description && (
                  <p className="text-white/75 text-base md:text-lg max-w-lg mx-auto leading-relaxed mb-8 font-medium">
                    {store.description}
                  </p>
                )}

                {/* CTA buttons */}
                <div className="flex items-center justify-center gap-3 flex-wrap mb-10">
                  <button
                    onClick={scrollToProducts}
                    className="px-8 py-3.5 bg-white rounded-2xl font-extrabold text-sm transition-all shadow-2xl hover:shadow-white/30 hover:-translate-y-0.5 flex items-center gap-2"
                    style={{ color: sc }}
                  >
                    <ShoppingBag className="w-4 h-4" /> Shop Now
                  </button>
                  {store.whatsAppNumber && (
                    <a
                      href={generateWhatsAppLink(store.whatsAppNumber, `Hi! I'm visiting ${store.name}'s store.`)}
                      target="_blank" rel="noreferrer"
                      className="px-8 py-3.5 text-white rounded-2xl font-extrabold text-sm transition-all flex items-center gap-2"
                      style={{
                        border: '1.5px solid rgba(255,255,255,0.35)',
                        background: 'rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <MessageCircle className="w-4 h-4" /> Chat with Us
                    </a>
                  )}
                </div>

                {/* Social proof chips */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {totalCount > 0 && (
                    <div className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold"
                      style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)' }}>
                      <Package className="w-3 h-3" /> {totalCount}+ Products
                    </div>
                  )}
                  {store.whatsAppNumber && (
                    <div className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold"
                      style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)' }}>
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />
                      Replies in 5 mins
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold"
                    style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)' }}>
                    <Shield className="w-3 h-3" /> Secure Checkout
                  </div>
                </div>
              </div>

              {/* Bottom fade to page bg */}
              <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-50 to-transparent" />
            </div>
          );
        })()
      }

      {/* ── Trust ribbon ── */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-center gap-5 md:gap-8 flex-wrap">
          {([
            { Icon: Truck,       text: 'Fast Delivery'    },
            { Icon: ShieldCheck, text: 'Secure Payments'  },
            store.whatsAppNumber
              ? { Icon: WhatsAppIcon, text: 'WhatsApp Support' }
              : null,
            { Icon: RotateCcw,   text: 'Easy Returns'    },
            { Icon: BadgeCheck,  text: 'Trusted Seller'  },
          ] as const).filter(Boolean).map((item: any) => (
            <div key={item.text} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <item.Icon className="w-4 h-4 flex-shrink-0" style={{ color: tc }} />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Category Icon Rail ── */}
      {categories.length > 0 && (
        <div ref={categoriesRef} className="pt-8 pb-4" style={{ background: `linear-gradient(180deg, #f8fafb 0%, #fff 100%)` }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase" style={{ letterSpacing: '0.06em' }}>
                  Shop by Category
                </h2>
                <div className="mt-1 h-0.5 w-10 rounded-full" style={{ background: `linear-gradient(90deg, ${tc}, ${sc})` }} />
              </div>
              {selectedCategory && (
                <button onClick={() => { setSelectedCategory(null); setSelectedSubCategory(null); setPage(1); }}
                  className="text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-full transition-all"
                  style={{ color: tc, background: tc + '12', border: `1px solid ${tc}33` }}
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* Icon row — right fade hints at horizontal scroll */}
            <div className="relative">
              <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

              <div className="flex gap-4 overflow-x-auto pb-2 px-1" style={{ scrollbarWidth: 'none' }}>
                {/* All */}
                <button
                  onClick={() => { setSelectedCategory(null); setSelectedSubCategory(null); setPage(1); }}
                  className="flex-shrink-0 flex flex-col items-center gap-2.5 group"
                >
                  <div
                    className="w-[72px] h-[72px] rounded-[20px] flex items-center justify-center transition-all duration-300"
                    style={!selectedCategory
                      ? { background: `linear-gradient(135deg, ${tc}, ${sc})`, boxShadow: `0 8px 24px ${tc}50`, transform: 'translateY(-2px) scale(1.04)' }
                      : { background: '#f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                  >
                    <ShoppingBag className="w-7 h-7" style={{ color: !selectedCategory ? '#fff' : '#94a3b8' }} />
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: !selectedCategory ? tc : '#64748b' }}>All</span>
                </button>

                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setSelectedSubCategory(null); setPage(1); scrollToProducts(); }}
                    className="flex-shrink-0 flex flex-col items-center gap-2.5 group"
                  >
                    <div
                      className="w-[72px] h-[72px] rounded-[20px] overflow-hidden transition-all duration-300"
                      style={selectedCategory === cat.id
                        ? { outline: `3px solid ${tc}`, outlineOffset: '2px', transform: 'translateY(-2px) scale(1.04)', boxShadow: `0 8px 24px ${tc}44` }
                        : { opacity: 0.8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                    >
                      {cat.imageUrl
                        ? <img src={optimizeImage(cat.imageUrl, 300)} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" decoding="async" width={300} height={300} />
                        : (
                          <div className="w-full h-full flex items-center justify-center text-[26px] font-black text-white select-none"
                            style={{ background: `linear-gradient(135deg, ${tc}e0, ${sc}c0)` }}>
                            {cat.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                    </div>
                    <span
                      className="text-[11px] font-bold text-center leading-tight"
                      style={{ color: selectedCategory === cat.id ? tc : '#64748b', maxWidth: 76 }}
                    >
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Featured Products — Trending Now ── */}
      {allProducts.filter(p => p.isFeatured).length > 0 && !selectedCategory && !debouncedSearch && (
        <div className="mt-2 py-10" style={{ background: `linear-gradient(160deg, ${tc}08 0%, ${sc}12 100%)` }}>
          <div className="max-w-6xl mx-auto px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2 text-xs font-bold"
                  style={{ background: tc + '18', color: tc }}>
                  <Flame className="w-3.5 h-3.5" /> Hot Right Now
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">Trending Products</h2>
                <p className="text-sm text-slate-500 mt-0.5">Loved by our customers this week</p>
              </div>
              <button
                onClick={scrollToProducts}
                className="hidden sm:flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all hover:shadow-md"
                style={{ color: tc, background: tc + '12', border: `1.5px solid ${tc}30` }}
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Horizontal card scroll */}
            <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
              {allProducts.filter(p => p.isFeatured).map((p, idx) => {
                const featHasVariants = p.minVariantPrice != null;
                const featPrice = featHasVariants ? p.minVariantPrice! : (p.discountedPrice ?? p.basePrice);
                const featDiscount = !featHasVariants && p.discountedPrice ? Math.round((1 - p.discountedPrice / p.basePrice) * 100) : 0;
                const badge = getProductBadge(p);
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className="flex-shrink-0 w-52 bg-white rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1.5"
                    style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                      {p.primaryImage
                        ? <img src={optimizeImage(p.primaryImage, 300)} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" width={300} height={400} />
                        : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-10 h-10 text-slate-200" /></div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {/* Rank pill top-left */}
                      {idx < 3 ? (
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-white text-[10px] font-extrabold shadow-md">
                          #{idx + 1}
                        </div>
                      ) : badge ? (
                        <span className={`absolute top-2.5 left-2.5 ${badge.bg} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                          {badge.label}
                        </span>
                      ) : null}

                      {/* Discount top-right */}
                      {featDiscount > 0 && (
                        <span className="absolute top-2.5 right-2.5 bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
                          -{featDiscount}%
                        </span>
                      )}

                      {/* Price overlay bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-xs font-semibold line-clamp-1 drop-shadow">{p.title}</p>
                        <p className="text-white font-extrabold text-base drop-shadow mt-0.5">
                          {featHasVariants && <span className="text-xs font-medium opacity-80 mr-0.5">from </span>}
                          {formatCurrency(featPrice, store.currency ?? 'INR')}
                        </p>
                      </div>
                    </div>

                    {/* Add to cart footer */}
                    <div className="px-3 py-2.5">
                      <button
                        onClick={e => { e.stopPropagation(); handleAddToCart(p); }}
                        className="w-full py-2 rounded-xl text-xs font-bold transition-all duration-200 text-white"
                        style={{ background: `linear-gradient(90deg, ${tc}, ${sc})` }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                      >
                        + Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile view-all */}
            <div className="flex justify-center mt-5 sm:hidden">
              <button
                onClick={scrollToProducts}
                className="flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-xl"
                style={{ color: tc, background: tc + '12', border: `1.5px solid ${tc}30` }}
              >
                View All Products <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll anchor — "All Products" nav link and category clicks land here */}
      <div ref={productsRef} aria-hidden />

      {/* ── Sticky Category Tab Bar ── stays locked below header while user browses ── */}
      {categories.length > 1 && (
        <div
          className="sticky z-20 bg-white/97 backdrop-blur-md border-b border-slate-200/70"
          style={{ top: `${HEADER_H}px`, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
        >
          <div className="max-w-6xl mx-auto px-4">
            {/* Parent category tabs */}
            <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <button
                onClick={() => { setSelectedCategory(null); setSelectedSubCategory(null); setPage(1); }}
                className="flex-shrink-0 px-5 py-3.5 text-sm font-bold transition-all duration-200 border-b-2 whitespace-nowrap"
                style={!selectedCategory
                  ? { borderBottomColor: tc, color: tc }
                  : { borderBottomColor: 'transparent', color: '#94a3b8' }}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setSelectedSubCategory(null); setPage(1); scrollToProducts(); }}
                  className="flex-shrink-0 px-5 py-3.5 text-sm font-bold transition-all duration-200 border-b-2 whitespace-nowrap"
                  style={selectedCategory === cat.id
                    ? { borderBottomColor: tc, color: tc }
                    : { borderBottomColor: 'transparent', color: '#94a3b8' }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {/* Subcategory pill row — shows when selected category has subcategories */}
            {(() => {
              const activeCat = categories.find(c => c.id === selectedCategory);
              const subs = activeCat?.subCategories ?? [];
              if (!subs.length) return null;
              return (
                <div
                  className="flex gap-2 overflow-x-auto pb-2.5 pt-1"
                  style={{ scrollbarWidth: 'none' }}
                >
                  <button
                    onClick={() => { setSelectedSubCategory(null); setPage(1); }}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all"
                    style={!selectedSubCategory
                      ? { background: tc, color: '#fff', borderColor: tc }
                      : { background: 'transparent', color: '#64748b', borderColor: '#e2e8f0' }}
                  >
                    All {activeCat?.name}
                  </button>
                  {subs.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => { setSelectedSubCategory(sub.id); setPage(1); scrollToProducts(); }}
                      className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all whitespace-nowrap"
                      style={selectedSubCategory === sub.id
                        ? { background: tc, color: '#fff', borderColor: tc }
                        : { background: 'transparent', color: '#64748b', borderColor: '#e2e8f0' }}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── Products section ── */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-5">

        {/* ── Toolbar ─── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {selectedSubCategory
                ? (() => {
                    const cat = categories.find(c => c.id === selectedCategory);
                    const sub = cat?.subCategories?.find(s => s.id === selectedSubCategory);
                    return sub?.name ?? 'Products';
                  })()
                : selectedCategory
                ? categories.find(c => c.id === selectedCategory)?.name ?? 'Products'
                : debouncedSearch ? `"${debouncedSearch}"`
                : 'All Products'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">{totalCount} items</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); setPage(1); }}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-sm text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="">Featured</option>
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
                <option value="newest">Newest</option>
              </select>
              <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(f => !f)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all"
              style={showFilters || activeFiltersCount > 0
                ? { backgroundColor: tc, color: '#fff', borderColor: tc, boxShadow: `0 2px 10px ${tc}44` }
                : { backgroundColor: '#fff', color: '#475569', borderColor: '#e2e8f0' }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFiltersCount > 0 ? `Filter · ${activeFiltersCount}` : 'Filter'}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-5"
            style={{ animation: 'rcSlideDown 0.25s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

            {/* Category filter */}
            {categories.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2.5">Category</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setSelectedCategory(null); setPage(1); }}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      !selectedCategory
                        ? 'text-white border-transparent'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}
                    style={!selectedCategory ? { backgroundColor: tc, borderColor: tc } : {}}
                  >
                    All
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        selectedCategory === cat.id
                          ? 'text-white border-transparent'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                      }`}
                      style={selectedCategory === cat.id ? { backgroundColor: tc, borderColor: tc } : {}}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sort + Stock row */}
            <div className="flex flex-wrap items-center gap-6">
              {/* Sort */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2.5">Sort by</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Default', value: '' },
                    { label: 'Price: Low → High', value: 'price_asc' },
                    { label: 'Price: High → Low', value: 'price_desc' },
                    { label: 'Newest', value: 'newest' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSort(opt.value); setPage(1); }}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        sort === opt.value
                          ? 'text-white border-transparent'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                      }`}
                      style={sort === opt.value ? { backgroundColor: tc, borderColor: tc } : {}}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* In Stock */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2.5">Stock</p>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => { setInStockOnly(v => !v); setPage(1); }}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${inStockOnly ? '' : 'bg-slate-200'}`}
                    style={inStockOnly ? { backgroundColor: tc } : {}}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${inStockOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm text-slate-600 font-medium">In stock only</span>
                </label>
              </div>
            </div>

            {/* Clear all */}
            {(selectedCategory || sort || inStockOnly) && (
              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => { setSelectedCategory(null); setSelectedSubCategory(null); setSort(''); setInStockOnly(false); setPage(1); }}
                  className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Product grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="aspect-square relative overflow-hidden bg-slate-100">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent" style={{ animation: 'rcShimmer 1.5s infinite', transform: 'translateX(-100%)' }} />
                </div>
                <div className="p-3 space-y-2.5">
                  <div className="h-2.5 bg-slate-100 rounded-full w-1/3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent" style={{ animation: 'rcShimmer 1.5s infinite', animationDelay: '0.2s', transform: 'translateX(-100%)' }} />
                  </div>
                  <div className="h-3.5 bg-slate-100 rounded-full w-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent" style={{ animation: 'rcShimmer 1.5s infinite', animationDelay: '0.3s', transform: 'translateX(-100%)' }} />
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full w-1/2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent" style={{ animation: 'rcShimmer 1.5s infinite', animationDelay: '0.4s', transform: 'translateX(-100%)' }} />
                  </div>
                  <div className="h-8 bg-slate-50 rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent" style={{ animation: 'rcShimmer 1.5s infinite', animationDelay: '0.5s', transform: 'translateX(-100%)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : allProducts.length ? (
          <div
            key={`grid-${debouncedSearch}-${selectedCategory}-${sort}-${inStockOnly}-${page}`}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {allProducts.map((p, i) => (
              <div
                key={p.id}
                style={{
                  opacity: 0,
                  animation: 'rcFadeInUp 0.45s ease forwards',
                  animationDelay: `${Math.min(i, 9) * 55}ms`,
                }}
              >
                <ProductCard
                  product={p}
                  themeColor={tc}
                  store={store}
                  onSelect={setSelectedProduct}
                  onAddToCart={handleAddToCart}
                />
              </div>
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
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div
            className="rounded-3xl p-8 md:p-10 text-white relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${tc} 0%, ${sc} 100%)` }}
          >
            {/* Decorative orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }} />

            <div className="relative flex flex-col md:flex-row items-center gap-8">
              {/* Left text */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-bold mb-4 border border-white/20">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />
                  Usually replies in 5 mins
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
                  Need help choosing?
                </h3>
                <p className="text-white/80 text-base max-w-md leading-relaxed">
                  Chat directly with {store.name} on WhatsApp — get personalized recommendations, check availability & place your order instantly.
                </p>
                {/* Mini social proof */}
                <div className="flex items-center gap-4 mt-5 flex-wrap justify-center md:justify-start">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-white/90">
                    <CheckCircle className="w-4 h-4 text-green-300" /> Fast replies
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-white/90">
                    <CheckCircle className="w-4 h-4 text-green-300" /> Custom orders welcome
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-white/90">
                    <CheckCircle className="w-4 h-4 text-green-300" /> No commitment
                  </div>
                </div>
              </div>

              {/* Right CTA */}
              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                <a
                  href={generateWhatsAppLink(store.whatsAppNumber, `Hi ${store.name}! I need help choosing a product.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 bg-white px-8 py-4 rounded-2xl font-extrabold text-base shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 hover:bg-white/95"
                  style={{ color: tc }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat on WhatsApp
                </a>
                <p className="text-xs text-white/60 text-center">Free • No signup required</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer ref={footerRef} className="bg-slate-900 text-white mt-20">
        {/* Trust footer strip */}
        <div className="border-b border-slate-800 py-6 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { Icon: Truck,        text: 'Worldwide Delivery' },
              { Icon: Lock,         text: 'Secure Checkout'    },
              { Icon: RotateCcw,    text: 'Easy Returns'       },
              { Icon: WhatsAppIcon, text: 'WhatsApp Support'   },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${tc}22`, color: tc }}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-xs font-semibold text-slate-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

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
              <li>
                <button
                  onClick={() => setShowReturnPolicy(true)}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Return Policy
                </button>
              </li>
              {footerPages.map(p => (
                <li key={p.id}>
                  <a href={`${pageBase}/${p.slug}`} className="hover:text-white transition-colors">
                    {p.title}
                  </a>
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
                    <WhatsAppIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {store.whatsAppNumber}
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
                    <InstagramIcon className="w-4 h-4 text-pink-400" /> {store.instagramHandle}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {store.name}.{!store.allowsCustomBranding && <> Powered by <span className="text-slate-400 font-medium">Silarai</span></>}
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

      {/* Sticky mobile bottom bar — WhatsApp + Cart */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 md:hidden z-20"
        style={{ padding: '10px 16px', paddingBottom: 'calc(10px + env(safe-area-inset-bottom))' }}>
        <div className="flex gap-2">
          {/* Cart button — only show when cart has items */}
          {totalItems > 0 && (
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-2xl font-bold text-sm bg-slate-900 text-white shadow-lg flex-shrink-0"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-[9px] font-extrabold flex items-center justify-center shadow"
                style={{ backgroundColor: tc }}>
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            </button>
          )}
          {/* WhatsApp CTA */}
          {store.whatsAppNumber && (
            <a
              href={generateWhatsAppLink(store.whatsAppNumber, `Hi! I'm interested in products at ${store.name}.`)}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg"
              style={{ backgroundColor: tc }}
            >
              <MessageCircle className="w-5 h-5" />
              {store.whatsAppCtaLabel ?? 'Chat on WhatsApp'}
            </a>
          )}
          {/* If no WhatsApp, show Cart as full-width */}
          {!store.whatsAppNumber && totalItems === 0 && null}
        </div>
      </div>

      {/* Chatbot */}
      <Chatbot
        store={store}
        themeColor={tc}
        slug={slug!}
        onOpenCart={() => setCartOpen(true)}
        onViewProduct={handleChatViewProduct}
      />

      {/* Product detail modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          store={store}
          themeColor={tc}
          onClose={() => setSelectedProduct(null)}
          slug={slug ?? ''}
          isCustomDomain={!!overrideSlug}
        />
      )}

      {/* Cart Drawer — lazy: not visible on first paint */}
      <React.Suspense fallback={null}>
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
          isCustomDomain={!!overrideSlug}
        />
      </React.Suspense>

      {/* PWA install banner removed — was overlapping social CTAs */}

      {/* Customer Auth Modal — lazy loaded */}
      {showAuthModal && slug && (
        <React.Suspense fallback={null}>
          <CustomerAuthModal
            slug={slug}
            themeColor={tc}
            onClose={() => setShowAuthModal(false)}
          />
        </React.Suspense>
      )}

      {/* My Account Panel — lazy loaded */}
      {showAccountPanel && slug && store && (
        <React.Suspense fallback={null}>
          <MyAccountPanel
            slug={slug}
            themeColor={tc}
            currency={store.currency}
            onClose={() => setShowAccountPanel(false)}
            onAddToCart={(productId, title, price, imageUrl) => {
              addItem({ productId, productTitle: title, unitPrice: price, primaryImage: imageUrl });
              setCartOpen(true);
              setShowAccountPanel(false);
            }}
          />
        </React.Suspense>
      )}

      {/* ── Return Policy Modal ── */}
      {showReturnPolicy && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowReturnPolicy(false)}
          />
          {/* Panel */}
          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" style={{ color: tc }} />
                <h2 className="font-bold text-slate-900">Return &amp; Refund Policy</h2>
              </div>
              <button
                onClick={() => setShowReturnPolicy(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                aria-label="Close return policy"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            {/* Body — scrollable */}
            <div className="overflow-y-auto px-5 py-5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {(store as any).returnPolicy || `Return & Refund Policy

We want you to be completely satisfied with your purchase. Please read our return policy carefully.

RETURNS
We accept returns within 7 days of delivery. Items must be:
• Unused and in original condition
• In original packaging
• Accompanied by proof of purchase

NON-RETURNABLE ITEMS
• Opened personal care or beauty products
• Items on sale or marked as final sale
• Gift cards

REFUND PROCESS
Once we receive and inspect your return, we will notify you via WhatsApp. If approved, your refund will be processed within 5–7 business days to your original payment method.

HOW TO RETURN
Contact us on WhatsApp with your order number and reason for return. We will guide you through the process.

DAMAGED OR WRONG ITEMS
If you received a damaged or incorrect item, please contact us within 48 hours of delivery with photos of the item and packaging.

EXCHANGE
We offer exchanges for the same product in a different variant (size/colour) subject to availability. Contact us on WhatsApp to arrange.

For any questions, reach out to us on WhatsApp — we're happy to help!`}
            </div>
            {/* Footer */}
            {store.whatsAppNumber && (
              <div className="flex-shrink-0 px-5 pb-5 pt-3 border-t border-slate-100">
                <a
                  href={generateWhatsAppLink(store.whatsAppNumber, `Hi ${store.name}! I have a question about your return policy.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact us on WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

