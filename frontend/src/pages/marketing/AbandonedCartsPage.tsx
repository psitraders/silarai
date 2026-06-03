import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, ShoppingCart, CheckCircle, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { PageLoader } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { abandonedCartsApi, type AbandonedCartDto, type CartItemSnapshot } from '../../api/abandonedCarts.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { generateWhatsAppLink } from '../../utils/whatsappLink';

function buildReminderMessage(cart: AbandonedCartDto): string {
  const itemList = cart.cartItems.map(i => `• ${i.productTitle}${i.variantInfo ? ` (${i.variantInfo})` : ''} × ${i.quantity}`).join('\n');
  return `Hi ${cart.customerName}! 👋\n\nYou left some items in your cart:\n${itemList}\n\nTotal: ${formatCurrency(cart.cartTotal)}\n\nComplete your order now 🛒`;
}

export function AbandonedCartsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [showRecovered, setShowRecovered] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['abandoned-carts', page, showRecovered],
    queryFn: () => abandonedCartsApi.getAll({ recovered: showRecovered || undefined, page, pageSize: 20 }),
  });

  const recoverMutation = useMutation({ mutationFn: abandonedCartsApi.markRecovered, onSuccess: () => qc.invalidateQueries({ queryKey: ['abandoned-carts'] }) });
  const reminderMutation = useMutation({ mutationFn: abandonedCartsApi.markReminderSent, onSuccess: () => qc.invalidateQueries({ queryKey: ['abandoned-carts'] }) });
  const deleteMutation = useMutation({ mutationFn: abandonedCartsApi.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ['abandoned-carts'] }) });

  if (isLoading) return <PageLoader />;

  const carts = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Abandoned Carts</h1>
          <p className="text-slate-500 text-sm mt-0.5">{data?.totalCount ?? 0} total</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={showRecovered} onChange={e => setShowRecovered(e.target.checked)} className="rounded" />
          Show recovered
        </label>
      </div>

      {carts.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="w-8 h-8 text-slate-400" />}
          title="No abandoned carts"
          description="When customers start checkout but don't complete it, their carts appear here so you can follow up."
        />
      ) : (
        <>
          <div className="space-y-3">
            {carts.map(cart => {
              let parsedItems: CartItemSnapshot[] = [];
              try { parsedItems = typeof cart.cartItems === 'string' ? JSON.parse(cart.cartItems as unknown as string) : cart.cartItems; } catch { }
              const cartWithParsed = { ...cart, cartItems: parsedItems };
              return (
                <Card key={cart.id}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${cart.isRecovered ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {cart.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900">{cart.customerName}</span>
                        {cart.customerPhone && <span className="text-xs text-slate-500">{cart.customerPhone}</span>}
                        {cart.isRecovered && <span className="text-xs bg-green-50 text-green-700 font-medium px-2 py-0.5 rounded-full">Recovered</span>}
                        <span className="text-xs text-slate-400">{formatDate(cart.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-bold text-slate-900">{formatCurrency(cart.cartTotal)}</span>
                        <span className="text-xs text-slate-400">{cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''}</span>
                        {cart.lastReminderSentAt && <span className="text-xs text-amber-600">Reminder sent {formatDate(cart.lastReminderSentAt)}</span>}
                      </div>
                      {parsedItems.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {parsedItems.map((item, i) => (
                            <span key={i} className="text-xs bg-slate-50 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-100">
                              {item.productTitle}{item.variantInfo ? ` · ${item.variantInfo}` : ''} ×{item.quantity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {cart.customerPhone && !cart.isRecovered && (
                        <a
                          href={generateWhatsAppLink(cart.customerPhone, buildReminderMessage(cartWithParsed))}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => reminderMutation.mutate(cart.id)}
                          className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> Remind
                        </a>
                      )}
                      {!cart.isRecovered && (
                        <button onClick={() => recoverMutation.mutate(cart.id)} title="Mark recovered" className="p-2 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => deleteMutation.mutate(cart.id)} title="Delete" className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
