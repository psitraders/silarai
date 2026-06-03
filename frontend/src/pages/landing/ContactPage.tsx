import { LandingLayout } from '../../components/landing/LandingLayout';
import { Mail, MessageCircle, Clock, MapPin } from 'lucide-react';

const DEMO_WA = 'https://wa.me/918849549690?text=Hi%2C%20I%20have%20a%20question%20about%20Silarai';

const channels = [
  {
    icon: Mail,
    color: 'bg-teal-50 text-teal-600',
    title: 'Email support',
    desc: 'Send us an email and we\'ll get back to you within one business day.',
    action: 'support@Silarai.app',
    href: 'mailto:support@Silarai.app',
    linkLabel: 'Send an email',
  },
  {
    icon: MessageCircle,
    color: 'bg-green-50 text-green-600',
    title: 'WhatsApp',
    desc: 'Prefer to chat? Message us on WhatsApp — it\'s how we work best too.',
    action: '+91 88495 49690',
    href: DEMO_WA,
    linkLabel: 'Message on WhatsApp',
  },
  {
    icon: Clock,
    color: 'bg-amber-50 text-amber-600',
    title: 'Support hours',
    desc: 'Our team is available to help you.',
    action: 'Mon – Sat, 10am – 7pm IST',
    href: null,
    linkLabel: null,
  },
  {
    icon: MapPin,
    color: 'bg-violet-50 text-violet-600',
    title: 'Our team',
    desc: 'We\'re a remote-first team serving sellers worldwide.',
    action: 'Global 🌍',
    href: null,
    linkLabel: null,
  },
];

const faqs = [
  {
    q: 'Is Silarai really free to start?',
    a: 'Yes. You can create your store, add products, and receive orders completely free. No credit card required. Paid plans unlock advanced features like AI chat and marketing tools.',
  },
  {
    q: 'Can I use my own domain?',
    a: 'Yes — paid plans support custom domain mapping so your store can be at yourshop.com instead of yourshop.Silarai.app.',
  },
  {
    q: 'Does Silarai work with WhatsApp Business?',
    a: 'Yes. You can connect your WhatsApp Business number to send order updates, run campaigns, and power the AI chat assistant.',
  },
  {
    q: 'How do I accept payments?',
    a: 'We integrate with Razorpay so you can accept UPI, cards, net banking, and wallets. COD is also supported.',
  },
  {
    q: 'I\'m not tech-savvy. Can I still use Silarai?',
    a: 'Absolutely — that\'s exactly who we build for. If you can use Instagram, you can use Silarai. And our support team is always here to help.',
  },
];

export function ContactPage() {
  return (
    <LandingLayout>
      {/* Hero */}
      <section className="bg-white py-20 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5">
            We're here to help
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Whether you have a question before signing up, or need help with your existing store —
            our team is happy to help. Reach out through any of the channels below.
          </p>
        </div>
      </section>

      {/* Contact channels */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 gap-5 mb-16">
            {channels.map((c) => (
              <div key={c.title} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${c.color}`}>
                  <c.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{c.title}</h3>
                <p className="text-sm text-gray-500 mb-3 leading-relaxed">{c.desc}</p>
                <p className="text-sm font-semibold text-gray-700">{c.action}</p>
                {c.href && c.linkLabel && (
                  <a
                    href={c.href}
                    target={c.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="inline-block mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                  >
                    {c.linkLabel} →
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-8 text-center">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {faqs.map((f) => (
                <div key={f.q} className="bg-white rounded-xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{f.q}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

