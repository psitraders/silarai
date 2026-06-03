import { useState } from 'react';
import { X, FileText, Loader2, CheckCircle2, Building2, Mail, Phone, User } from 'lucide-react';
import { useCustomerApi, useStorefrontAuth } from '../../context/StorefrontAuthContext';
import { formatCurrency } from '../../utils/formatCurrency';

export interface QuoteItem {
  productId: string;
  title: string;
  qty: number;
  unitPrice: number;
}

interface Props {
  slug: string;
  themeColor: string;
  currency?: string;
  items: QuoteItem[];
  onClose: () => void;
}

export function QuoteRequestModal({ slug, themeColor, currency = 'INR', items, onClose }: Props) {
  const { customer } = useStorefrontAuth();
  const api = useCustomerApi(slug);
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState('');

  const [name, setName]         = useState(customer?.name ?? '');
  const [email, setEmail]       = useState(customer?.email ?? '');
  const [phone, setPhone]       = useState('');
  const [company, setCompany]   = useState('');
  const [gst, setGst]           = useState('');
  const [notes, setNotes]       = useState('');

  const btn = { backgroundColor: themeColor };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.submitQuote({
        contactName:  name,
        contactEmail: email,
        contactPhone: phone || null,
        companyName:  company || null,
        gstNumber:    gst || null,
        itemsJson:    JSON.stringify(items),
        notes:        notes || null,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Failed to submit quote. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" style={{ color: themeColor }} />
            <h3 className="font-semibold text-slate-800">Request a Quote</h3>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 className="w-14 h-14 text-green-500" />
              <h4 className="text-lg font-semibold text-slate-800">Quote Submitted!</h4>
              <p className="text-slate-500 text-sm max-w-xs">
                We've received your request and will get back to you at <strong>{email}</strong> shortly.
              </p>
              <button onClick={onClose} style={btn}
                className="mt-2 px-6 py-2.5 rounded-xl text-white font-semibold text-sm">
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Requested items */}
              <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Items</p>
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{item.title} × {item.qty}</span>
                    <span className="text-slate-500">{formatCurrency(item.unitPrice * item.qty, currency)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm font-semibold pt-2 border-t border-slate-200">
                  <span>Total (retail)</span>
                  <span>{formatCurrency(items.reduce((s, i) => s + i.unitPrice * i.qty, 0), currency)}</span>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <InputField icon={User} label="Name" value={name} onChange={setName} required />
                <InputField icon={Mail} label="Email" type="email" value={email} onChange={setEmail} required />
                <InputField icon={Phone} label="Phone" type="tel" value={phone} onChange={setPhone} />
                <InputField icon={Building2} label="Company" value={company} onChange={setCompany} />
              </div>
              <InputField icon={FileText} label="GST Number" value={gst} onChange={setGst} />
              <textarea
                rows={3}
                placeholder="Notes / special requirements (optional)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 resize-none"
              />

              <button type="submit" disabled={loading} style={btn}
                className="w-full py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Quote Request
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({ icon: Icon, label, type = 'text', value, onChange, required }: {
  icon: React.ElementType; label: string; type?: string;
  value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input type={type} placeholder={label} value={value} required={required}
        onChange={e => onChange(e.target.value)}
        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500" />
    </div>
  );
}
