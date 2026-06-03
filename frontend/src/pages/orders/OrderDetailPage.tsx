import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MessageCircle, Package, CreditCard, XCircle, FileText, QrCode, Link, Copy, CheckCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Badge, getOrderStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import { ordersApi } from '../../api/orders.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatDateFull } from '../../utils/formatDate';
import { useStoreCountry } from '../../hooks/useStoreCountry';
import { generateWhatsAppLink } from '../../utils/whatsappLink';
import type { OrderStatus } from '../../types/order.types';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'New', label: 'New' },
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'PaymentPending', label: 'Payment Pending' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Packed', label: 'Packed' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const PAYMENT_METHODS = ['UPI', 'Cash', 'Bank Transfer', 'Card', 'Cheque', 'Other'];

type PaymentForm = { amount: number; method: string; referenceNumber?: string; notes?: string };
type CancelForm = { reason?: string };

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [payLinkOpen, setPayLinkOpen] = useState(false);
  const [payLinkUrl, setPayLinkUrl] = useState('');
  const [payLinkCopied, setPayLinkCopied] = useState(false);
  const [payLinkError, setPayLinkError] = useState('');

  const storeCountry = useStoreCountry();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOrder(id!),
    enabled: Boolean(id),
    refetchInterval: 30_000, // live tracking — re-fetch every 30s
  });

  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => ordersApi.updateStatus(id!, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['order', id] }),
  });

  const paymentForm = useForm<PaymentForm>({ defaultValues: { method: 'UPI' } });
  const paymentMutation = useMutation({
    mutationFn: (data: PaymentForm) => ordersApi.recordPayment(id!, { ...data, amount: Number(data.amount) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', id] });
      setPaymentOpen(false);
      paymentForm.reset();
    },
  });

  const cancelForm = useForm<CancelForm>();
  const cancelMutation = useMutation({
    mutationFn: (data: CancelForm) => ordersApi.cancelOrder(id!, data.reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', id] });
      setCancelOpen(false);
    },
  });

  const payLinkMutation = useMutation({
    mutationFn: () => ordersApi.createPaymentLink(id!),
    onSuccess: (data) => {
      setPayLinkUrl(data.url);
      setPayLinkError('');
      setPayLinkOpen(true);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to create payment link. Check Razorpay credentials in Integrations settings.';
      setPayLinkError(msg);
      setPayLinkOpen(true);
    },
  });

  if (isLoading) return <PageLoader />;
  if (!order) return <div className="text-center py-12 text-slate-500">Order not found.</div>;

  const isCancelled = order.status === 'Cancelled';
  // Detect Razorpay-paid orders: either paymentStatus=Paid (after backend fix)
  // OR notes field contains the Razorpay payment ID (covers pre-fix orders)
  const razorpayMatch = order.notes?.match(/Payment ID:\s*(pay_\w+)/i);
  const razorpayPaymentId = razorpayMatch?.[1] ?? null;
  const isOnlinePaid = !!razorpayPaymentId || order.notes?.toLowerCase().includes('paid online via razorpay');
  const isPaid = order.paymentStatus === 'Paid' || isOnlinePaid;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 font-mono">{order.orderNumber}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant={getOrderStatusBadge(order.status)}>{order.status}</Badge>
            {/* Show paymentStatus pill only when it adds info beyond the order status:
                - Always show for Razorpay online orders (shows "Paid (Razorpay)" reference)
                - Hide when order.status is already 'Paid' (payment is implied)
                - Hide for cancelled orders (irrelevant) */}
            {(isOnlinePaid || (order.status !== 'Paid' && !isCancelled)) && (
              <Badge variant={isPaid ? 'success' : 'warning'}>
                {isOnlinePaid && order.paymentStatus !== 'Paid' ? 'Paid (Razorpay)' : order.paymentStatus}
              </Badge>
            )}
            {razorpayPaymentId && (
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 rounded px-2 py-0.5">
                {razorpayPaymentId}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isPaid && !isCancelled && (
            <Button size="sm" onClick={() => setPaymentOpen(true)}>
              <CreditCard className="w-4 h-4 mr-2" /> Record Payment
            </Button>
          )}
          {order.customerPhone && (
            <Button size="sm" variant="outline" onClick={() => {
              setNotifyMessage(`Hi ${order.customerName ?? ''}! Your order *${order.orderNumber}* is now *${order.status}*. Total: ${formatCurrency(order.totalAmount)}. Thank you for shopping with us! 🙏`);
              setNotifyOpen(true);
            }}>
              <MessageCircle className="w-4 h-4 mr-2" /> Notify
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => ordersApi.openInvoice(id!)}
          >
            <FileText className="w-4 h-4 mr-2" /> Invoice
          </Button>
          {order.customerPhone && order.paymentStatus !== 'Paid' && (
            <Button size="sm" variant="outline" onClick={() => {
              const msg = `Hi ${order.customerName ?? ''}! 🛒 Your COD order *${order.orderNumber}* has been confirmed.\n\n*Order Total: ${formatCurrency(order.totalAmount)}*\n\nPlease keep the exact amount ready at delivery. We'll notify you before dispatch. Thank you! 🙏`;
              setNotifyMessage(msg);
              setNotifyOpen(true);
            }}>
              <QrCode className="w-4 h-4 mr-2" /> COD Confirm
            </Button>
          )}
          {!isPaid && !isCancelled && (
            <Button size="sm" variant="outline" loading={payLinkMutation.isPending} onClick={() => {
              setPayLinkUrl('');
              setPayLinkError('');
              payLinkMutation.mutate();
            }}>
              <Link className="w-4 h-4 mr-2" /> Payment Link
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <h2 className="font-semibold text-slate-900 mb-4">
              <Package className="w-4 h-4 inline mr-1.5" />Order Items
            </h2>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.productTitle}</p>
                    {item.variantInfo && <p className="text-xs text-slate-400">{item.variantInfo}</p>}
                    <p className="text-xs text-slate-500">Qty: {item.quantity} × {formatCurrency(item.unitPrice)}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(item.totalPrice)}</p>
                </div>
              ))}
              <div className="flex justify-between pt-2 font-semibold">
                <span className="text-slate-700">Total</span>
                <span className="text-slate-900 text-lg">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </Card>

          {/* Status History */}
          <Card>
            <h2 className="font-semibold text-slate-900 mb-4">Status History</h2>
            <div className="space-y-2">
              {order.statusHistory.map(h => (
                <div key={h.id} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full theme-icon-bg mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">{h.toStatus}</span>
                      {h.fromStatus !== h.toStatus && <span className="text-slate-400"> from {h.fromStatus}</span>}
                    </p>
                    {h.note && <p className="text-xs text-slate-500">{h.note}</p>}
                    <p className="text-xs text-slate-400">{formatDateFull(h.createdAt, storeCountry)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <Card>
            <h2 className="font-semibold text-slate-900 mb-3">Customer</h2>
            <div className="space-y-1.5 text-sm">
              <p className="font-medium text-slate-900">{order.customerName ?? 'Unknown'}</p>
              {order.customerPhone && <p className="text-slate-500">{order.customerPhone}</p>}
              {order.notes && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-1">Notes</p>
                  <p className="text-slate-700">{order.notes}</p>
                </div>
              )}
              <p className="text-xs text-slate-400 pt-2">Created {formatDate(order.createdAt, storeCountry)}</p>
            </div>
          </Card>

          {!isCancelled && (
            <Card>
              <h2 className="font-semibold text-slate-900 mb-3">Update Status</h2>
              <Select
                options={STATUS_OPTIONS}
                value={order.status}
                onChange={e => statusMutation.mutate(e.target.value as OrderStatus)}
              />
            </Card>
          )}

          {!isCancelled && (
            <button
              onClick={() => setCancelOpen(true)}
              className="w-full flex items-center justify-center gap-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-100 rounded-xl py-2.5 transition-colors"
            >
              <XCircle className="w-4 h-4" /> Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal open={paymentOpen} onClose={() => setPaymentOpen(false)} title="Record Payment">
        <form onSubmit={paymentForm.handleSubmit(v => paymentMutation.mutate(v))} className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600">
            Order Total: <span className="font-bold text-slate-900">{formatCurrency(order.totalAmount)}</span>
          </div>
          <Input
            label="Amount Received"
            type="number"
            step="0.01"
            required
            placeholder={String(order.totalAmount)}
            {...paymentForm.register('amount', { required: true, valueAsNumber: true })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
            <select
              {...paymentForm.register('method')}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <Input label="Reference / Transaction ID (optional)" placeholder="UPI ref, cheque no..." {...paymentForm.register('referenceNumber')} />
          <Input label="Notes (optional)" {...paymentForm.register('notes')} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={paymentMutation.isPending} className="flex-1">Confirm Payment</Button>
            <Button type="button" variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Notify Customer Modal */}
      <Modal open={notifyOpen} onClose={() => setNotifyOpen(false)} title="Notify Customer on WhatsApp">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Customize the message before sending.</p>
          <textarea
            value={notifyMessage}
            onChange={e => setNotifyMessage(e.target.value)}
            rows={5}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
          <div className="flex gap-3">
            <a
              href={generateWhatsAppLink(order.customerPhone!, notifyMessage)}
              target="_blank"
              rel="noreferrer"
              className="flex-1"
              onClick={() => setNotifyOpen(false)}
            >
              <Button className="w-full justify-center">
                <MessageCircle className="w-4 h-4 mr-2" /> Send on WhatsApp
              </Button>
            </a>
            <Button type="button" variant="outline" onClick={() => setNotifyOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Order Modal */}
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel Order?">
        <p className="text-slate-600 text-sm mb-4">This will mark the order as Cancelled. Please provide a reason.</p>
        <form onSubmit={cancelForm.handleSubmit(v => cancelMutation.mutate(v))} className="space-y-4">
          <Input label="Reason (optional)" placeholder="Customer requested cancellation..." {...cancelForm.register('reason')} />
          <div className="flex gap-3">
            <Button type="submit" variant="danger" loading={cancelMutation.isPending} className="flex-1">Cancel Order</Button>
            <Button type="button" variant="outline" onClick={() => setCancelOpen(false)}>Keep Order</Button>
          </div>
        </form>
      </Modal>

      {/* Razorpay Payment Link Modal */}
      <Modal open={payLinkOpen} onClose={() => setPayLinkOpen(false)} title="Razorpay Payment Link">
        {payLinkError ? (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {payLinkError}
            </div>
            <Button variant="outline" onClick={() => setPayLinkOpen(false)} className="w-full">Close</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Share this link with <span className="font-semibold text-slate-800">{order.customerName}</span> to collect payment of{' '}
              <span className="font-semibold text-slate-800">{formatCurrency(order.totalAmount)}</span>.
            </p>

            {/* Link display */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <a
                href={payLinkUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-sm text-teal-600 font-medium truncate hover:underline"
              >
                {payLinkUrl}
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(payLinkUrl);
                  setPayLinkCopied(true);
                  setTimeout(() => setPayLinkCopied(false), 2000);
                }}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-200 transition"
                title="Copy link"
              >
                {payLinkCopied
                  ? <CheckCheck className="w-4 h-4 text-green-600" />
                  : <Copy className="w-4 h-4 text-slate-500" />}
              </button>
            </div>

            <div className="flex gap-3">
              {order.customerPhone && (
                <a
                  href={generateWhatsAppLink(
                    order.customerPhone,
                    `Hi ${order.customerName ?? ''}! 💳 Here's your payment link for order *${order.orderNumber}* (${formatCurrency(order.totalAmount)}):\n\n${payLinkUrl}\n\nPay securely via UPI, card, or net banking. Thank you! 🙏`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1"
                  onClick={() => setPayLinkOpen(false)}
                >
                  <Button className="w-full justify-center">
                    <MessageCircle className="w-4 h-4 mr-2" /> Send on WhatsApp
                  </Button>
                </a>
              )}
              <Button variant="outline" onClick={() => setPayLinkOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
