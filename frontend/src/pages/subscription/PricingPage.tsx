import { useNavigate } from 'react-router-dom';
import {
  Check, Zap, Crown, Star, ArrowRight, MessageCircle, ShieldCheck,
  ShoppingCart, Boxes, UserCheck, CreditCard, Sparkles, BarChart2,
} from 'lucide-react';
import { Navbar } from '../../components/landing/Navbar';

// ── Pricing model ────────────────────────────────────────────────────────────
// Flat monthly platform fee by AI-chat volume + a small % of AI-attributed sales.
interface Plan {
  slug: string;
  name: string;
  description: string;
  price: number;          // USD / month platform fee
  chats: string;          // AI chats per month
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  badge?: string;
  popular?: boolean;
  features: string[];
}

const SALES_FEE = '+ 0.5–1% of AI-attributed sales';

const PLANS: Plan[] = [
  {
    slug: 'starter',
    name: 'Starter',
    description: 'AI sales assistant for stores just getting started.',
    price: 29,
    chats: 'Up to 1,000',
    icon: Star,
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    features: [
      'Up to 1,000 AI chats / month',
      '1 AI sales assistant',
      'Product catalog & live inventory aware',
      'In-chat cart & checkout (COD + online)',
      'Reads existing customer login session',
      'Order capture & lead collection',
      'Email support',
    ],
  },
  {
    slug: 'growth',
    name: 'Growth',
    description: 'For growing stores scaling up conversations.',
    price: 59,
    chats: '1,000–2,000',
    icon: Zap,
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-400',
    badge: 'Most Popular',
    popular: true,
    features: [
      'Everything in Starter',
      '1,000–2,000 AI chats / month',
      'Advanced analytics & conversion insights',
      'Custom branding',
      'WhatsApp + Instagram + Facebook',
      'Priority support',
    ],
  },
  {
    slug: 'scale',
    name: 'Scale',
    description: 'High-volume stores with maximum automation.',
    price: 100,
    chats: '2,000+',
    icon: Crown,
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-400',
    badge: 'Best Value',
    features: [
      'Everything in Growth',
      '2,000+ AI chats / month',
      'Dedicated account manager',
      'Custom integrations & workflows',
      'Priority SLA support',
    ],
  },
];

// Capabilities included on every plan (the assistant's core powers)
const INCLUDED = [
  { icon: Boxes,      label: 'Product catalog & inventory' },
  { icon: ShoppingCart, label: 'In-chat cart & checkout' },
  { icon: UserCheck,  label: 'Reads existing login session' },
  { icon: CreditCard, label: 'Payments via Razorpay' },
  { icon: Sparkles,   label: 'AI product recommendations' },
  { icon: BarChart2,  label: 'Order & lead capture' },
];

export function PricingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <Navbar />

      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-28 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <ShieldCheck className="w-3.5 h-3.5" /> Pay for results — only a small % of sales the AI drives
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Simple, performance-based pricing
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          A low monthly platform fee based on your AI chat volume, plus a small share of the
          sales your AI assistant actually closes. Scale your costs with your growth — never before.
        </p>
      </div>

      {/* Plan cards */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map(plan => {
            const PlanIcon = plan.icon;
            return (
              <div
                key={plan.slug}
                className={`relative bg-white rounded-3xl border-2 p-7 flex flex-col gap-5 shadow-sm transition-shadow hover:shadow-xl ${plan.border} ${
                  plan.popular ? 'ring-2 ring-teal-400 ring-offset-2 shadow-teal-100 shadow-lg' : ''
                }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white shadow-sm ${
                    plan.popular ? 'bg-teal-600' : 'bg-violet-600'
                  }`}>
                    {plan.badge}
                  </div>
                )}

                {/* Header */}
                <div>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${plan.bg}`}>
                    <PlanIcon className={`w-5 h-5 ${plan.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                </div>

                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                    <span className="text-slate-400 text-sm">/month platform fee</span>
                  </div>
                  <p className="text-xs font-medium text-teal-600 mt-1.5">{SALES_FEE}</p>
                </div>

                {/* Chat volume badge */}
                <div className={`flex items-center justify-between p-3 rounded-2xl ${plan.bg}`}>
                  <div className="flex items-center gap-2">
                    <MessageCircle className={`w-4 h-4 ${plan.color}`} />
                    <span className="text-sm font-medium text-slate-600">AI chats / month</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{plan.chats}</span>
                </div>

                {/* CTA */}
                <button
                  onClick={() => navigate('/subscription')}
                  className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-200'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  Start {plan.name} <ArrowRight className="w-4 h-4" />
                </button>

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.color}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Included in every plan */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Included in every plan</h2>
          <p className="text-slate-500 text-center mb-8 max-w-xl mx-auto">
            Your AI sales assistant works across product catalog, inventory, cart, checkout and
            your customers' existing sessions — out of the box.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {INCLUDED.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-teal-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan comparison */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Compare plans</h2>
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-4 font-semibold text-slate-700">Feature</th>
                  {PLANS.map(p => (
                    <th key={p.slug} className="px-4 py-4 text-center font-semibold text-slate-900">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Monthly platform fee', values: PLANS.map(p => `$${p.price}`) },
                  { label: 'AI chats / month', values: PLANS.map(p => p.chats) },
                  { label: '% of AI-attributed sales', values: ['0.5–1%', '0.5–1%', '0.5–1%'] },
                  { label: 'Catalog, cart & checkout', values: [true, true, true] },
                  { label: 'Reads existing login session', values: [true, true, true] },
                  { label: 'Advanced analytics', values: [false, true, true] },
                  { label: 'Custom branding', values: [false, true, true] },
                  { label: 'Dedicated account manager', values: [false, false, true] },
                ].map(({ label, values }, i) => (
                  <tr key={label} className={i % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}>
                    <td className="px-6 py-3.5 text-slate-700">{label}</td>
                    {values.map((v, j) => (
                      <td key={j} className="px-4 py-3.5 text-center">
                        {typeof v === 'boolean'
                          ? (v ? <Check className="w-4 h-4 text-teal-600 mx-auto" /> : <span className="text-slate-300 font-bold">—</span>)
                          : <span className="font-semibold text-slate-800">{v}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Common questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'What counts as an "AI chat"?',
                a: 'One AI chat = one unique customer conversation with your assistant within the billing month, no matter how many messages it contains. Your plan is based on how many of these you have per month.',
              },
              {
                q: 'What are "AI-attributed sales"?',
                a: 'Orders that the assistant helped place — products it recommended, carts it built, or checkouts it completed in chat. We charge a small 0.5–1% only on those sales, so you pay more only when the AI earns you more.',
              },
              {
                q: 'Can I change plans anytime?',
                a: 'Yes. Upgrade or downgrade at any time as your chat volume grows. Upgrades take effect immediately; downgrades apply from the next billing cycle.',
              },
              {
                q: 'How do I pay?',
                a: 'The monthly platform fee and the sales share are billed via Razorpay (UPI, cards, net banking). Reach us on WhatsApp to activate your plan.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <p className="font-semibold text-slate-900 mb-1.5">{q}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl p-10 text-white">
            <h2 className="text-2xl font-bold mb-2">Turn chats into sales</h2>
            <p className="text-teal-100 mb-6">Launch your AI sales assistant today — pay as it performs.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => navigate('/subscription')}
                className="px-7 py-3 bg-white text-teal-700 rounded-2xl font-semibold hover:bg-teal-50 transition shadow-lg"
              >
                Get started
              </button>
              <a
                href="https://wa.me/910000000000?text=Hi! I'd like to know more about Silarai pricing."
                target="_blank"
                rel="noreferrer"
                className="px-7 py-3 border border-white/30 text-white rounded-2xl font-semibold hover:bg-white/10 transition flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> Chat with Sales
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
