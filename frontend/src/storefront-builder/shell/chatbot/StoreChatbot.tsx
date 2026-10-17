/**
 * AI shopping assistant (tenant chatbot, `ai-tenant-chatbot` spec) — part of the
 * store shell so it is available on every storefront page (SB-R11).
 * Moved unchanged in behaviour from the old PublicStorefrontPage in Phase 1.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bot, CheckCircle, ChevronLeft, ChevronRight, Download, MessageCircle, Send,
  ShoppingBag, Users, X, Zap,
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { formatCurrency } from '../../../utils/formatCurrency';
import { optimizeImage } from '../../../utils/imageUrl';
import { generateWhatsAppLink } from '../../../utils/whatsappLink';
import { API_BASE_URL as BASE_URL } from '../../core/data/api';
import type { StoreInfo, StoreProduct } from '../../core/types';

type StoreData = StoreInfo;
type Product = StoreProduct;

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
  product: Product;
  themeColor: string;
  store: StoreData;
  onSend: (msg: string) => void;
  onViewProduct?: (id: string) => void;
  onAddToCart?: (p: Product) => void;
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
    setTimeout(() => setAddedFlash(false), 3000);
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

export function StoreChatbot({ store, themeColor, slug, onOpenCart, onViewProduct, categoryId, categoryName, loggedInName, loggedInEmail }: {
  store: StoreData;
  themeColor: string;
  slug: string;
  onOpenCart: () => void;
  onViewProduct?: (productId: string) => void;
  categoryId?: string | null;
  categoryName?: string | null;
  loggedInName?: string | null;
  loggedInEmail?: string | null;
}) {
  const [open, setOpenState] = useState(false);
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
  const { addItem, clearCart, totalItems } = useCart();

  // Chat COD OTP state (lives here so only one active form at a time)
  const [chatOtpEmail,   setChatOtpEmail]   = useState('');
  const [chatOtpStep,    setChatOtpStep]     = useState<'idle' | 'sending' | 'awaiting' | 'placing'>('idle');
  const [chatOtpCode,    setChatOtpCode]     = useState('');
  const [chatOtpError,   setChatOtpError]    = useState<string | null>(null);
  const [chatOtpMsgIdx,  setChatOtpMsgIdx]   = useState<number | null>(null); // which message owns the form

  // Slide-in animation: the panel mounts hidden, then becomes visible on the next frame.
  const setOpen = useCallback((value: boolean) => {
    setOpenState(value);
    if (value) setUnreadCount(0);
    else setPanelVisible(false);
  }, []);
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => setPanelVisible(true));
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = bottomRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'end' });
    // Re-scroll after async content (product cards / images) changes the panel height,
    // so the newest reply is always in view without the user scrolling manually.
    const t = setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'end' }), 250);
    return () => clearTimeout(t);
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
        body: JSON.stringify({ sessionId, message: text, categoryId: categoryId || undefined, categoryName: categoryName || undefined, customerName: loggedInName || undefined, customerEmail: loggedInEmail || undefined }),
      });
      const data = await res.json();
      if (data.sessionId) setSessionId(data.sessionId);

      const hasOrder   = !!data.orderPlaced;
      const hasOnline  = !!data.onlinePaymentCart;
      const hasPending = !!data.pendingCodOrder;

      let quickReplies: string[] | undefined;
      if (data.escalate)
        quickReplies = ['💬 Chat with us on WhatsApp'];
      else if (data.leadCreated && !hasOrder && !hasOnline && !hasPending)
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
  }, [slug, sessionId, isTyping, store.whatsAppNumber, categoryId, categoryName, loggedInName, loggedInEmail]);

  const handleOnlinePayment = useCallback((cart: ChatMessage['onlineCart']) => {
    if (!cart) return;
    clearCart();
    for (const item of cart.items) {
      for (let i = 0; i < item.qty; i++)
        addItem({ productId: item.productId, productTitle: item.title, unitPrice: item.unitPrice, variantInfo: item.variantInfo });
    }
    setOpen(false);
    onOpenCart();
  }, [addItem, clearCart, onOpenCart, setOpen]);

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
    } catch (err) {
      setChatOtpError(err instanceof Error && err.message ? err.message : 'Failed to send verification code. Please try again.');
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
    } catch (err) {
      setChatOtpError(err instanceof Error && err.message ? err.message : 'Something went wrong. Please try again.');
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
        onClick={() => setOpen(!open)}
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
              <button
                onClick={() => { setOpen(false); onOpenCart(); }}
                className="relative w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                title="View cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center border border-white">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
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
                      {msg.products.map(p => (
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
                            style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
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
                            style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
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
