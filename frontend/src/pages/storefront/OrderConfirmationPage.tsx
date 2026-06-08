import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  CheckCircle2, Package, MapPin, Phone, Download,
  ShoppingBag, Clock, Truck, Star, MessageCircle,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://silarai-fbahb2bsg4cng3hq.southindia-01.azurewebsites.net/api/v1';

interface OrderItem {
  productId: string;
  productTitle: string;
  variantInfo?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  notes?: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

export function OrderConfirmationPage({ overrideSlug }: { overrideSlug?: string } = {}) {
  const { slug: paramSlug, orderId } = useParams<{ slug: string; orderId: string }>();
  const slug = overrideSlug ?? paramSlug;
  const isCustomDomain = !!overrideSlug;

  const { data: order, isLoading, isError } = useQuery<OrderDetail>({
    queryKey: ['public-order', slug, orderId],
    queryFn: () =>
      axios.get(`${BASE_URL}/public/${slug}/orders/${orderId}`).then(r => r.data),
    enabled: !!slug && !!orderId,
    staleTime: 60 * 1000,
  });

  const { data: store } = useQuery({
    queryKey: ['public-store', slug],
    queryFn: () => axios.get(`${BASE_URL}/public/${slug}`).then(r => r.data),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const tc = store?.themeColor ?? '#0F766E';
  const currency = store?.currency ?? 'INR';
  const storeName = store?.name ?? '';
  const storeHref = isCustomDomain ? '/' : `/${slug}`;

  // noindex — order pages are private, must not appear in search results
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  // Set browser tab title to store name
  useEffect(() => {
    if (storeName) document.title = `Order Confirmed — ${storeName}`;
    return () => { document.title = 'Silarai'; };
  }, [storeName]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: tc, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 px-4 text-center">
        <Package className="w-14 h-14 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-700">Order not found</h2>
        <p className="text-sm text-slate-500">This order link may have expired or is incorrect.</p>
        <a href={storeHref} className="text-sm font-semibold" style={{ color: tc }}>
          ? Back to Store
        </a>
      </div>
    );
  }

  const isCod = order.paymentStatus === 'Pending';
  const orderDate = new Date(order.createdAt).toLocaleDateString(undefined, {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const orderTime = new Date(order.createdAt).toLocaleTimeString(undefined, {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-16">

      {/* Store navbar */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <a href={storeHref} className="flex items-center gap-3 min-w-0">
          {store?.logoUrl ? (
            <img src={store.logoUrl} alt={storeName}
              className="h-9 w-9 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: tc }}>
              {storeName.charAt(0).toUpperCase() || 'S'}
            </div>
          )}
          <span className="font-semibold text-slate-900 truncate text-sm">{storeName}</span>
        </a>
      </div>

      {/* Hero banner */}
      <div className="text-white px-4 pt-10 pb-16 text-center"
        style={{ background: `linear-gradient(135deg, ${tc} 0%, ${tc}bb 100%)` }}>
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 ring-4 ring-white/30">
          <CheckCircle2 className="w-11 h-11 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          {isCod ? '?? Order Placed!' : '? Payment Successful!'}
        </h1>
        <p className="text-white/80 mt-1.5 text-sm max-w-xs mx-auto">
          {isCod
            ? 'Your order is confirmed. Our team will reach out soon!'
            : 'Payment received. Your order is being prepared!'}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-5 py-2 text-sm font-semibold">
          <Package className="w-4 h-4" />
          Order #{order.orderNumber}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-8 space-y-4">

        {/* Summary card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50">
            <h2 className="text-sm font-semibold text-slate-800">Order Summary</h2>
          </div>
          <div className="divide-y divide-slate-50">
            <div className="flex items-center justify-between px-5 py-3 text-sm">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Date &amp; Time
              </span>
              <span className="font-medium text-slate-900">{orderDate}, {orderTime}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-3 text-sm">
              <span className="text-slate-500">Order Status</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                {order.status}
              </span>
            </div>
            <div className="flex items-center justify-between px-5 py-3 text-sm">
              <span className="text-slate-500">Payment</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isCod ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
              }`}>
                {isCod ? '?? Cash on Delivery' : '? Paid'}
              </span>
            </div>
            <div className="flex items-center justify-between px-5 py-3 text-sm">
              <span className="text-slate-500 font-medium">Order Total</span>
              <span className="text-base font-bold" style={{ color: tc }}>
                {formatCurrency(order.totalAmount, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" style={{ color: tc }} />
            <h2 className="text-sm font-semibold text-slate-800">
              Items Ordered ({order.items.reduce((s, i) => s + i.quantity, 0)})
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: tc }}>
                  {item.quantity}×
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 leading-tight">{item.productTitle}</p>
                  {item.variantInfo && (
                    <p className="text-xs text-slate-400 mt-0.5">{item.variantInfo}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatCurrency(item.unitPrice, currency)} each
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-900 flex-shrink-0">
                  {formatCurrency(item.totalPrice, currency)}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center px-5 py-3 bg-slate-50">
              <span className="text-sm font-bold text-slate-900">Total</span>
              <span className="text-base font-bold" style={{ color: tc }}>
                {formatCurrency(order.totalAmount, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery details */}
        {(order.customerName || order.deliveryAddress || order.customerPhone) && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
              <Truck className="w-4 h-4" style={{ color: tc }} />
              <h2 className="text-sm font-semibold text-slate-800">Delivery Details</h2>
            </div>
            <div className="px-5 py-4 space-y-2.5">
              {order.customerName && (
                <p className="text-sm font-semibold text-slate-900">{order.customerName}</p>
              )}
              {order.customerPhone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  {order.customerPhone}
                </div>
              )}
              {order.deliveryAddress && (
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{order.deliveryAddress}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
            <p className="text-xs font-semibold text-amber-700 mb-1">?? Order Notes</p>
            <p className="text-sm text-amber-800">{order.notes}</p>
          </div>
        )}

        {/* What's next — COD timeline */}
        {isCod && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50">
              <h2 className="text-sm font-semibold text-slate-800">What happens next?</h2>
            </div>
            <div className="px-5 py-4 space-y-4">
              {[
                { icon: MessageCircle, label: 'Store confirms your order via WhatsApp/call', done: true },
                { icon: Package,       label: 'Order is packed and dispatched',             done: false },
                { icon: Truck,        label: 'Delivered to your address',                  done: false },
                { icon: Star,         label: 'Pay on delivery & leave a review!',          done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.done ? 'text-white' : 'bg-slate-100 text-slate-400'
                  }`} style={step.done ? { backgroundColor: tc } : {}}>
                    <step.icon className="w-3.5 h-3.5" />
                  </div>
                  <p className={`text-sm leading-relaxed pt-0.5 ${step.done ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2.5 pt-1">
          <a
            href={`${BASE_URL}/public/${slug}/orders/${orderId}/invoice`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 rounded-2xl border-2 font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
            style={{ borderColor: tc, color: tc }}
          >
            <Download className="w-4 h-4" />
            Download Invoice
          </a>

          {store?.whatsAppNumber && (
            <a
              href={`https://wa.me/${store.whatsAppNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                `Hi ${storeName}! I just placed order #${order.orderNumber}. Looking forward to it! ??`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle className="w-4 h-4" />
              Chat with {storeName} on WhatsApp
            </a>
          )}

          <a
            href={storeHref}
            className="w-full py-2.5 text-center text-sm text-slate-400 hover:text-slate-600 block transition-colors"
          >
            ? Continue Shopping
          </a>
        </div>
      </div>
    </div>
  );
}

