import React, { useState } from 'react';
import { X, Calendar, Bot, CheckCircle2, ArrowRight, Building, Mail, User, Sparkles, Copy, Check, Phone, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  buildMailtoUrl,
  openMailClient,
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
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [generatedMailto, setGeneratedMailto] = useState('');
  const serverRecipient = CONTACT_EMAIL;
  const contactPhone = CONTACT_PHONE;
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

  const copyToClipboard = (text: string, type: 'email' | 'phone') => {
    navigator.clipboard?.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const mailtoUrl = buildMailtoUrl(
        `Product Demo Request - ${formData.company} (${formData.name})`,
        [
          'Hello SilarAI Team,',
          '',
          'I would like to request a product demo for our organization.',
          '',
          `• Full Name: ${formData.name}`,
          `• Work Email: ${formData.email}`,
          `• Company Name: ${formData.company}`,
          `• Role: ${formData.role}`,
          `• Industry / Business Type: ${formData.businessType}`,
          `• Catalog Size: ${formData.skuCount}`,
          `• Preferred Demo Date: ${formData.preferredDate}`,
          `• Selected Plan / Interest: ${preselectedPlan || 'Enterprise Demo'}`,
          '',
          'Looking forward to connecting with your team!',
        ]
      );
      setGeneratedMailto(mailtoUrl);

      // Save submission locally for user's record
      try {
        const submissionRecord = {
          id: `demo_${Date.now()}`,
          timestamp: new Date().toISOString(),
          ...formData,
          preselectedPlan: preselectedPlan || 'Standard Demo',
          targetEmail: serverRecipient,
          phone: contactPhone,
        };
        const existing = JSON.parse(localStorage.getItem('silarai_demo_enquiries') || '[]');
        existing.unshift(submissionRecord);
        localStorage.setItem('silarai_demo_enquiries', JSON.stringify(existing.slice(0, 50)));
      } catch (storageErr) {
        console.warn('LocalStorage save skipped:', storageErr);
      }

      // Open the visitor's email client with the pre-filled message.
      // Nothing is delivered until they press Send — the confirmation copy says so.
      openMailClient(mailtoUrl);

      // Small delay for UI smoothness before showing confirmation
      await new Promise(resolve => setTimeout(resolve, 300));

      // Successfully processed: mark submitted
      setSubmitted(true);
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Failed to initiate demo email:', err);
      setErrorMessage('Could not launch your email client automatically. Please use the direct email address or phone number below.');
      // NOTE: submitted is NEVER set to true inside the catch block
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
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto shadow-sm">
              <Mail className="w-9 h-9 text-teal-700" />
            </div>
            
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-3 py-0.5 rounded-full">
                Final Step Required
              </span>
              <h3 className="text-2xl font-black text-slate-900 pt-1">
                Please Press &ldquo;Send&rdquo; in Your Email Client to Finish
              </h3>
            </div>

            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              We have drafted your demo request to <span className="font-bold text-teal-900">{serverRecipient}</span> in your default mail app. <strong className="text-slate-900">Please click &ldquo;Send&rdquo; in your mail app to finish delivering your request</strong> to our solutions team.
            </p>

            {/* Direct Copyable Contact Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs text-slate-700 space-y-2.5 max-w-md mx-auto">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Direct Contact Details (Click to copy):</span>
                <span className="text-[10px] text-slate-500 font-normal">If mail app did not open</span>
              </div>
              
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="w-4 h-4 text-teal-700 shrink-0" />
                  <span className="font-mono text-slate-900 font-semibold select-all truncate">{serverRecipient}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(serverRecipient, 'email')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 min-w-0">
                  <Phone className="w-4 h-4 text-teal-700 shrink-0" />
                  <span className="font-mono text-slate-900 font-semibold select-all truncate">{contactPhone}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={CONTACT_PHONE_HREF}
                    className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Call
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(contactPhone, 'phone')}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-1">
                Requested for <strong>{formData.company}</strong> ({formData.name}) &bull; Date: {formData.preferredDate}
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              {generatedMailto && (
                <a
                  href={generatedMailto}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all inline-flex items-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Re-open Email App</span>
                </a>
              )}

              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="px-5 py-2.5 text-xs font-extrabold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-teal-800 text-peach-300 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-teal-950 bg-peach-300 px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-peach-400">
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

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed">
                {errorMessage}
              </div>
            )}

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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 text-xs sm:text-sm font-extrabold text-white bg-plum-800 hover:bg-plum-900 active:scale-[0.99] disabled:opacity-60 rounded-xl shadow-md shadow-plum-950/20 border border-plum-900 flex items-center justify-center gap-2.5 cursor-pointer transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-peach-400 focus:ring-offset-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Request Enquiry...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Request Enquiry</span>
                      <ArrowRight className="w-4 h-4 text-peach-300 transition-transform group-hover:translate-x-1" />
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
