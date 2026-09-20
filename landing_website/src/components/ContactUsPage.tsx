import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bot,
  ShoppingBag,
  Building2,
  Check,
  Globe,
  Layers,
  Zap,
  Clock,
  ShieldCheck,
  Headphones,
  Home,
  Copy,
  ExternalLink
} from 'lucide-react';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  CONTACT_LEGAL_NAME,
  CONTACT_ADDRESS,
  buildMailtoUrl,
  openMailClient,
} from '../config/forms';
import { Breadcrumbs } from './Breadcrumbs';

interface ContactUsPageProps {
  onBackToHome: () => void;
  onRequestDemoModal?: (plan?: string) => void;
}

const INTEREST_OPTIONS = [
  'AI Shopping Assistant',
  'AI Commerce',
  'AI Marketing',
  'Commerce Cloud',
  'Integration',
  'Enterprise Solution',
  'Other'
];

const ACHIEVE_ITEMS = [
  'Deploy an AI Shopping Assistant',
  'Improve product discovery and recommendations',
  'Personalize customer experiences',
  'Increase ecommerce conversions',
  'Automate customer engagement and marketing',
  'Explore Commerce Cloud',
  'Integrate SilarAI with your existing commerce, CRM, ERP, or business systems',
  'Discuss an enterprise deployment'
];

export const ContactUsPage: React.FC<ContactUsPageProps> = ({
  onBackToHome,
  onRequestDemoModal
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    interest: 'AI Shopping Assistant',
    requirements: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [generatedMailto, setGeneratedMailto] = useState('');

  const targetEmail = CONTACT_EMAIL;
  const targetPhone = CONTACT_PHONE;

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
        `Inquiry from ${formData.name} - ${formData.company || 'Website Lead'}`,
        [
          'Hello SilarAI Team,',
          '',
          `I would like to get in touch regarding ${formData.interest}.`,
          '',
          `• Name: ${formData.name}`,
          `• Work Email: ${formData.email}`,
          `• Company: ${formData.company || 'N/A'}`,
          `• Phone: ${formData.phone || 'N/A'}`,
          `• Primary Interest: ${formData.interest}`,
          '• Project Requirements / Message:',
          formData.requirements || 'N/A',
          '',
          'Looking forward to your response!',
        ]
      );
      setGeneratedMailto(mailtoUrl);

      // Save locally to browser localStorage for visitor record-keeping
      try {
        const contactRecord = {
          id: `inquiry_${Date.now()}`,
          timestamp: new Date().toISOString(),
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          interest: formData.interest,
          requirements: formData.requirements,
          targetEmail,
          destinationPhone: targetPhone,
          address: `${CONTACT_LEGAL_NAME}, ${CONTACT_ADDRESS}`,
        };
        const stored = JSON.parse(localStorage.getItem('silarai_contact_inquiries') || '[]');
        stored.unshift(contactRecord);
        localStorage.setItem('silarai_contact_inquiries', JSON.stringify(stored.slice(0, 50)));
      } catch (storageErr) {
        console.warn('LocalStorage save skipped:', storageErr);
      }

      // Open the visitor's email client with the pre-filled message.
      // Nothing is delivered until they press Send — the confirmation copy says so.
      openMailClient(mailtoUrl);

      // Small delay for UI smoothness
      await new Promise(resolve => setTimeout(resolve, 300));
      setSubmitted(true);
    } catch (err) {
      console.error('Error initiating email client:', err);
      setErrorMessage('Could not open your email client automatically. Please copy our email or phone number below to contact us directly.');
      // NOTE: submitted is NEVER set to true inside the catch block
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setGeneratedMailto('');
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      interest: 'AI Shopping Assistant',
      requirements: ''
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 pt-20 pb-20">
      {/* Top Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Home', shortLabel: 'Home', icon: Home, onClick: onBackToHome },
          { label: 'Company', shortLabel: 'Company', icon: Building2 },
          { label: 'Contact Us', isCurrent: true, icon: Mail }
        ]}
        onBack={onBackToHome}
        backButtonLabel="Back to Home"
        badgeText="Get in Touch"
      />

      {/* Top Hero Header */}
      <div className="bg-plum-950 text-white relative overflow-hidden border-b border-plum-800 py-16 lg:py-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-plum-800/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-peach-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-300/20 text-peach-300 font-extrabold text-xs tracking-wider uppercase border border-peach-300/30">
              <Sparkles className="w-3.5 h-3.5" />
              Get In Touch
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Let’s Build the Future of <span className="text-peach-300">Commerce &amp; Marketing</span>
            </h1>

            <p className="text-xl sm:text-2xl font-semibold text-plum-100">
              Ready to make your commerce and marketing smarter with AI?
            </p>

            <p className="text-base sm:text-lg text-plum-200/90 leading-relaxed pt-2 max-w-2xl">
              Talk to the SilarAI team to explore how our{' '}
              <strong className="text-white font-bold">AI Commerce &amp; Marketing Platform</strong> can help your business
              attract customers, deliver personalized shopping experiences, increase conversions, and build stronger customer
              relationships.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Talk to Our Team & Why SilarAI */}
          <div className="lg:col-span-6 space-y-12">
            {/* Talk to Our Team */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-plum-100 flex items-center justify-center text-plum-900">
                  <Headphones className="w-5 h-5" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-plum-950 tracking-tight">
                  Talk to Our Team
                </h2>
              </div>

              <p className="text-slate-600 leading-relaxed mb-8">
                Whether you want to explore our{' '}
                <strong className="text-slate-900 font-semibold">AI Shopping Assistant</strong>, Commerce Cloud,
                AI-powered customer engagement, or marketing capabilities, we can help you identify the right solution for
                your business.
              </p>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-lg font-bold text-plum-950 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-peach-500" />
                  Tell us what you’re looking to achieve
                </h3>

                <ul className="space-y-3">
                  {ACHIEVE_ITEMS.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-700 text-sm sm:text-base">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-peach-100 text-peach-700 flex items-center justify-center mt-0.5 font-bold text-xs">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Why SilarAI? */}
            <div className="bg-gradient-to-br from-plum-900 via-plum-950 to-plum-900 text-white rounded-2xl p-8 shadow-md border border-plum-800 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-peach-300/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-peach-300/20 flex items-center justify-center text-peach-300 border border-peach-300/30">
                  <Bot className="w-5 h-5" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Why SilarAI?
                </h2>
              </div>

              <div className="space-y-4 text-plum-100/90 leading-relaxed text-base sm:text-lg relative z-10">
                <p>
                  SilarAI brings <strong className="text-peach-300 font-bold">AI, Commerce and Marketing together on one platform</strong>,
                  helping businesses connect customer acquisition, engagement, shopping and conversion in a more intelligent way.
                </p>
                <p>
                  From the first customer interaction to purchase and beyond, SilarAI helps businesses create connected,
                  personalized and AI-powered customer experiences.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-plum-800/80 relative z-10">
                <div className="bg-plum-800/40 rounded-xl p-4 border border-plum-700/50">
                  <div className="text-2xl font-black text-peach-300 mb-1">+42%</div>
                  <div className="text-xs text-plum-200">Higher Cart Conversion</div>
                </div>
                <div className="bg-plum-800/40 rounded-xl p-4 border border-plum-700/50">
                  <div className="text-2xl font-black text-peach-300 mb-1">3.8x</div>
                  <div className="text-xs text-plum-200">Customer Engagement</div>
                </div>
              </div>
            </div>

            {/* Prefer to reach us directly? */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm">
              <h3 className="text-xl font-bold text-plum-950 mb-6 flex items-center gap-2">
                <Mail className="w-5 h-5 text-peach-600" />
                Prefer to reach us directly?
              </h3>

              <div className="space-y-5 text-slate-700">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Email</div>
                    <a
                      href={`mailto:${CONTACT_EMAIL}?subject=Inquiry%20from%20Website`}
                      className="text-base font-semibold text-plum-900 hover:text-peach-600 transition-colors"
                    >
                      {CONTACT_EMAIL}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Phone</div>
                    <a
                      href={CONTACT_PHONE_HREF}
                      className="text-base font-semibold text-plum-900 hover:text-peach-600 transition-colors"
                    >
                      {CONTACT_PHONE}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Address</div>
                    <div className="text-base text-slate-800 leading-snug">
                      <span className="font-bold text-slate-900">PSI traders OPC PVT LTD</span><br />
                      74 RR Nagar, NSNPALAYAM,<br />
                      Coimbatore, Tamil nadu 641031
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Let's Talk & Contact Form */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200/80 shadow-lg sticky top-28">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plum-100 text-plum-900 font-extrabold text-xs tracking-wider uppercase mb-3">
                  <Send className="w-3.5 h-3.5" />
                  Let’s Talk
                </div>
                <h2 className="text-3xl font-black text-plum-950 tracking-tight mb-2">
                  Get in touch with our team
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Have a question, want a product demonstration, or exploring how SilarAI can fit into your existing technology stack?
                </p>
              </div>

              {submitted ? (
                <div className="text-center py-10 px-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                    <Mail className="w-9 h-9 text-teal-700" />
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-3 py-0.5 rounded-full">
                      Action Required
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 pt-1">
                      Please Press &ldquo;Send&rdquo; in Your Email Client to Finish
                    </h3>
                  </div>

                  <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                    We have drafted your message to <span className="font-bold text-teal-900">{targetEmail}</span> in your email client. <strong className="text-slate-900">Please click &ldquo;Send&rdquo; in your mail app to finish delivering your inquiry</strong> to our team.
                  </p>

                  {/* Direct Copyable Contact Box */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 text-left text-xs text-slate-700 space-y-2.5 max-w-md mx-auto shadow-xs">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>Direct Contact Details (Click to copy):</span>
                      <span className="text-[10px] text-slate-500 font-normal">If mail app didn&apos;t open</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="w-4 h-4 text-teal-700 shrink-0" />
                        <span className="font-mono text-slate-900 font-semibold select-all truncate">{targetEmail}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(targetEmail, 'email')}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone className="w-4 h-4 text-teal-700 shrink-0" />
                        <span className="font-mono text-slate-900 font-semibold select-all truncate">{targetPhone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={`tel:${targetPhone.replace(/[^0-9+]/g, '')}`}
                          className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors"
                        >
                          Call
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(targetPhone, 'phone')}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {copiedPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 pt-1">
                      Inquiry from <strong>{formData.name}</strong> &bull; Company: {formData.company || 'N/A'} &bull; Topic: {formData.interest}
                    </div>
                  </div>

                  <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                    {generatedMailto && (
                      <a
                        href={generatedMailto}
                        className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Re-open Email Client</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                      {errorMessage}
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5" htmlFor="contact-name">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-plum-700/20 focus:border-plum-700 transition-colors text-slate-900 text-sm bg-white"
                    />
                  </div>

                  {/* Business Email */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5" htmlFor="contact-email">
                      Business Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="sarah@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-plum-700/20 focus:border-plum-700 transition-colors text-slate-900 text-sm bg-white"
                    />
                  </div>

                  {/* Company & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5" htmlFor="contact-company">
                        Company <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-company"
                        type="text"
                        required
                        placeholder="Acme Retail Inc."
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-plum-700/20 focus:border-plum-700 transition-colors text-slate-900 text-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5" htmlFor="contact-phone">
                        Phone
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        placeholder="(+91) 94441 39089"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-plum-700/20 focus:border-plum-700 transition-colors text-slate-900 text-sm bg-white"
                      />
                    </div>
                  </div>

                  {/* What are you interested in? */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      What are you interested in?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {INTEREST_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setFormData({ ...formData, interest: option })}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                            formData.interest === option
                              ? 'bg-plum-900 text-white border-plum-900 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tell us about your requirements */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5" htmlFor="contact-requirements">
                      Tell us about your requirements
                    </label>
                    <textarea
                      id="contact-requirements"
                      rows={4}
                      placeholder="Share your goals, current ecommerce tech stack, monthly volume, or timeline..."
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-plum-700/20 focus:border-plum-700 transition-colors text-slate-900 text-sm bg-white resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 rounded-xl bg-plum-900 hover:bg-plum-950 text-white font-extrabold text-base tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Requesting Demo...</span>
                        </>
                      ) : (
                        <>
                          <span>Request a Demo</span>
                          <ArrowRight className="w-5 h-5 text-peach-300 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Your information is protected and confidential.</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Start Your AI Commerce Journey Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-gradient-to-r from-plum-950 via-plum-900 to-plum-950 text-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-plum-800 shadow-xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-peach-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Start Your AI Commerce Journey
            </h2>
            <p className="text-lg sm:text-xl text-plum-100 leading-relaxed">
              Let’s explore how SilarAI can help your business turn{' '}
              <strong className="text-peach-300 font-bold">
                AI-powered customer experiences into measurable commerce and marketing outcomes.
              </strong>
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  if (onRequestDemoModal) {
                    onRequestDemoModal('AI Commerce & Marketing Journey');
                  } else {
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }
                }}
                className="px-8 py-4 rounded-xl bg-peach-300 hover:bg-peach-400 text-plum-950 font-black text-base tracking-wide shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>Request a Demo</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
