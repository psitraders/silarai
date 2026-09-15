import React, { useState } from 'react';
import { X, Calendar, Bot, CheckCircle2, ArrowRight, Building, Mail, User, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  buildMailtoUrl,
  openMailClient,
  copyToClipboard,
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
  // `handedOff` means the mail client was opened — NOT that anything was sent.
  // The visitor still has to press Send, and the UI copy must say so.
  const [handedOff, setHandedOff] = useState(false);
  const [mailtoUrl, setMailtoUrl] = useState('');
  const [copied, setCopied] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const plan = preselectedPlan || 'Standard Demo';
    const url = buildMailtoUrl(
      `Demo request — ${formData.company || formData.name}`,
      [
        'Hi SilarAI team,',
        '',
        'I would like to book a product demo. My details:',
        '',
        `Name: ${formData.name}`,
        `Work email: ${formData.email}`,
        `Company: ${formData.company}`,
        `Role: ${formData.role}`,
        `Business type: ${formData.businessType}`,
        `Catalog size: ${formData.skuCount}`,
        `Preferred demo date: ${formData.preferredDate}`,
        `Plan of interest: ${plan}`,
        '',
        'Looking forward to hearing from you.',
      ]
    );

    setMailtoUrl(url);
    openMailClient(url);
    setHandedOff(true);
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleCopyEmail = async () => {
    const ok = await copyToClipboard(CONTACT_EMAIL);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

        {handedOff ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">One last step — press Send</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Thanks, <span className="font-bold text-slate-900">{formData.name}</span>. Your email app should
              have opened with your demo request already filled in.{' '}
              <span className="font-bold text-slate-900">Press Send there to reach us</span> — we reply within one
              business day.
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs text-slate-600 space-y-1.5 max-w-md mx-auto">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-plum-700" />
                <span>What we prefilled for you:</span>
              </div>
              <p>• Company: <strong>{formData.company}</strong></p>
              <p>• Contact Email: <strong>{formData.email}</strong></p>
              <p>• Preferred Demo Date: <strong className="text-emerald-700">{formData.preferredDate}</strong></p>
              <p>• Addressed to: <strong className="text-plum-900">{CONTACT_EMAIL}</strong></p>
            </div>

            {/* Fallback: plenty of visitors have no mail client registered */}
            <div className="bg-peach-50 p-4 rounded-2xl border border-peach-200 text-xs text-slate-700 max-w-md mx-auto space-y-2.5">
              <p className="font-semibold text-slate-900">Nothing opened?</p>
              <p className="leading-relaxed">
                Email us directly at the address below, or call{' '}
                <span className="font-bold text-plum-900">{CONTACT_PHONE}</span>.
              </p>
              <div className="flex items-center justify-center gap-2">
                <code className="px-2.5 py-1.5 rounded-lg bg-white border border-peach-300 font-bold text-plum-900 text-[11px]">
                  {CONTACT_EMAIL}
                </code>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-peach-300 font-bold text-[11px] text-slate-700 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setHandedOff(false);
                  onClose();
                }}
                className="px-6 py-2.5 text-xs font-extrabold text-white bg-plum-800 hover:bg-plum-900 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Done
              </button>

              <a
                href={mailtoUrl}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all inline-flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Reopen email</span>
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
                    <option>Medical Devices &amp; Supplies</option>
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

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Submitting opens your own email app with these details filled in, addressed to{' '}
                <span className="font-semibold text-slate-700">{CONTACT_EMAIL}</span>. You press Send — nothing
                leaves your device before that.
              </p>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 text-xs font-extrabold text-white bg-plum-700 hover:bg-plum-800 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>Compose Demo Request</span>
                  <ArrowRight className="w-4 h-4 text-peach-300" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
