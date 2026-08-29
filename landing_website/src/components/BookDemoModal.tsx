import React, { useState } from 'react';
import { X, Calendar, Bot, CheckCircle2, ArrowRight, Building, Mail, User, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  WEB3FORMS_ENDPOINT,
  WEB3FORMS_ACCESS_KEY,
  DEMO_REQUEST_RECIPIENT,
  isFormDeliveryConfigured,
} from '../config/forms';

interface BookDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPlan?: string;
}

export const BookDemoModal: React.FC<BookDemoModalProps> = ({
  isOpen,
  onClose,
  preselectedPlan,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [serverRecipient] = useState(DEMO_REQUEST_RECIPIENT);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: 'VP of E-commerce',
    businessType: 'Manufacturing / Wholesale B2B',
    skuCount: '10,000 - 50,000 SKUs',
    preferredDate: new Date().toISOString().split('T')[0],
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!isFormDeliveryConfigured()) {
      setSubmitError(
        'This form is not configured yet. Please email us directly and we will get straight back to you.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const plan = preselectedPlan || 'Standard Demo';

      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `New SilarAI demo request — ${formData.company || formData.name}`,
          from_name: 'SilarAI Website',
          // Lets the sales team reply straight to the prospect
          replyto: formData.email,
          name: formData.name,
          email: formData.email,
          company: formData.company,
          role: formData.role,
          business_type: formData.businessType,
          sku_count: formData.skuCount,
          preferred_date: formData.preferredDate,
          plan_context: plan,
          submitted_at: new Date().toISOString(),
          page_url: window.location.href,
          // Honeypot: bots fill hidden fields, humans do not
          botcheck: '',
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || `Submission failed (HTTP ${response.status})`);
      }

      setSubmitted(true);
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Demo request submission failed:', err);
      setSubmitError(
        `We could not send your request just now. Please try again, or email us at ${DEMO_REQUEST_RECIPIENT}.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-saas p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl relative my-8 animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Demo Request Dispatched!</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you, <span className="font-bold text-slate-900">{formData.name}</span>. An automated notification email with your request details has been sent directly to{' '}
              <span className="font-bold text-plum-800 bg-plum-50 px-2 py-0.5 rounded border border-plum-200">{serverRecipient}</span>.
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs text-slate-600 space-y-1.5 max-w-md mx-auto">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-plum-700" />
                <span>Confirmation Summary:</span>
              </div>
              <p>• Company: <strong>{formData.company}</strong></p>
              <p>• Contact Email: <strong>{formData.email}</strong></p>
              <p>• Preferred Demo Date: <strong className="text-emerald-700">{formData.preferredDate}</strong></p>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="px-6 py-2.5 text-xs font-extrabold text-white bg-plum-800 hover:bg-plum-900 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Done
              </button>

              <a
                href={`mailto:${serverRecipient}?subject=${encodeURIComponent(`Demo Request - ${formData.company}`)}&body=${encodeURIComponent(`Hi SilarAI Team,\n\nI just submitted a demo request for ${formData.company}.\nName: ${formData.name}\nEmail: ${formData.email}\nDate: ${formData.preferredDate}\n\nLooking forward to speaking with you!`)}`}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all inline-flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Direct Mail</span>
              </a>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-plum-700 text-peach-300 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-plum-950 bg-peach-300 px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-peach-400">
                SilarAI Live Demo
              </span>
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 mb-1">
              Book Your Personalized Product Demo
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              {preselectedPlan
                ? `You selected the ${preselectedPlan} plan. Let's customize your store setup.`
                : 'See how SilarAI turns catalog complexity into guided AI sales.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-plum-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@company.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-plum-700"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Apex Supply Corp"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-plum-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Business Type</label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-plum-700"
                  >
                    <option>Manufacturing / OEM</option>
                    <option>Industrial Distribution</option>
                    <option>Wholesale B2B</option>
                    <option>D2C E-commerce Brand</option>
                    <option>Medical Devices & Supplies</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Demo Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    required
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-plum-700"
                  />
                </div>
              </div>

              {/* Honeypot field — hidden from humans, filled by bots */}
              <input
                type="checkbox"
                name="botcheck"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              {submitError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-coral-200 bg-coral-50 px-3.5 py-3 text-xs font-semibold text-coral-700"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 text-xs font-extrabold text-white bg-plum-700 hover:bg-plum-800 disabled:opacity-60 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Demo Request to {serverRecipient}...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Demo Request (Send to {serverRecipient})</span>
                      <ArrowRight className="w-4 h-4 text-peach-300" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
