import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X, ShoppingBag, Heart, User, Star, Package, LogOut,
  Loader2, RotateCcw, Trash2
} from 'lucide-react';
import { useStorefrontAuth, useCustomerApi } from '../../context/StorefrontAuthContext';
import { formatCurrency } from '../../utils/formatCurrency';

interface Props {
  slug: string;
  themeColor: string;
  currency?: string;
  onClose: () => void;
  onAddToCart?: (productId: string, title: string, price: number, imageUrl?: string) => void;
}

const STATUS_COLOR: Record<string, string> = {
  New:         'bg-blue-100 text-blue-700',
  Processing:  'bg-yellow-100 text-yellow-700',
  Shipped:     'bg-indigo-100 text-indigo-700',
  Delivered:   'bg-green-100 text-green-700',
  Cancelled:   'bg-red-100 text-red-700',
};

export function MyAccountPanel({ slug, themeColor, currency = 'INR', onClose, onAddToCart }: Props) {
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile'>('orders');
  const { customer, logout }       = useStorefrontAuth();
  const api                        = useCustomerApi(slug);
  const qc                         = useQueryClient();

  const ordersQ   = useQuery({ queryKey: ['sf-orders', slug], queryFn: api.getOrders,   enabled: activeTab === 'orders' });
  const wishlistQ = useQuery({ queryKey: ['sf-wishlist', slug], queryFn: api.getWishlist, enabled: activeTab === 'wishlist' });

  const removeWishlist = useMutation({
    mutationFn: (pid: string) => api.toggleWishlist(pid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sf-wishlist', slug] }),
  });

  const btn = { backgroundColor: themeColor };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={btn}>
              {customer?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{customer?.name}</p>
              <p className="text-xs text-slate-400">{customer?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(customer?.loyaltyPoints ?? 0) > 0 && (
              <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-medium">
                <Star className="w-3.5 h-3.5" />
                {customer!.loyaltyPoints} pts
              </div>
            )}
            {customer?.isB2BCustomer && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                customer.isB2BApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {customer.isB2BApproved ? 'B2B ✓' : 'B2B Pending'}
              </span>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-5">
          {[
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'wishlist', label: 'Wishlist', icon: Heart },
            { id: 'profile', label: 'Profile', icon: User },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-current text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
              style={activeTab === id ? { color: themeColor, borderColor: themeColor } : {}}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">

          {/* ORDERS */}
          {activeTab === 'orders' && (
            ordersQ.isLoading ? <Spinner /> :
            !ordersQ.data?.length ? <Empty icon={Package} text="No orders yet" /> :
            ordersQ.data.map((order: any) => (
              <div key={order.id} className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-sm">#{order.orderNumber}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status] ?? 'bg-slate-100 text-slate-600'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </div>
                <div className="space-y-1">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{item.productTitle} × {item.quantity}</span>
                      <span className="text-slate-500">{formatCurrency(item.unitPrice * item.quantity, currency)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-xs text-slate-500">Total</span>
                  <span className="font-semibold text-sm text-slate-800">{formatCurrency(order.totalAmount, currency)}</span>
                </div>
                {/* Re-order button */}
                {onAddToCart && (
                  <button
                    onClick={() => order.items.forEach((i: any) =>
                      onAddToCart(i.productId, i.productTitle, i.unitPrice, undefined)
                    )}
                    className="flex items-center gap-1.5 text-xs font-medium mt-1"
                    style={{ color: themeColor }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Re-order
                  </button>
                )}
              </div>
            ))
          )}

          {/* WISHLIST */}
          {activeTab === 'wishlist' && (
            wishlistQ.isLoading ? <Spinner /> :
            !wishlistQ.data?.length ? <Empty icon={Heart} text="Your wishlist is empty" /> :
            wishlistQ.data.map((item: any) => (
              <div key={item.productId} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.title}
                    className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{item.title}</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: themeColor }}>
                    {formatCurrency(item.discountedPrice ?? item.basePrice, currency)}
                  </p>
                  {!item.inStock && (
                    <span className="text-xs text-red-500">Out of stock</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  {onAddToCart && item.inStock && (
                    <button
                      onClick={() => onAddToCart(item.productId, item.title, item.discountedPrice ?? item.basePrice, item.imageUrl)}
                      className="text-xs px-2.5 py-1.5 rounded-lg text-white font-medium"
                      style={btn}
                    >
                      Add
                    </button>
                  )}
                  <button
                    onClick={() => removeWishlist.mutate(item.productId)}
                    className="text-xs px-2.5 py-1.5 rounded-lg text-red-500 bg-red-50 hover:bg-red-100"
                  >
                    <Trash2 className="w-3.5 h-3.5 mx-auto" />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* PROFILE */}
          {activeTab === 'profile' && customer && (
            <div className="space-y-4">
              <ProfileRow label="Name" value={customer.name} />
              <ProfileRow label="Email" value={customer.email} />
              {customer.isB2BCustomer && (
                <ProfileRow label="Account Type"
                  value={customer.isB2BApproved ? 'B2B (Approved)' : 'B2B (Pending approval)'} />
              )}
              <ProfileRow label="Loyalty Points" value={`${customer.loyaltyPoints} points`} />

              <button
                onClick={() => { logout(); onClose(); }}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 mt-4"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-8">
      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
    </div>
  );
}

function Empty({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
      <Icon className="w-10 h-10 text-slate-200" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
