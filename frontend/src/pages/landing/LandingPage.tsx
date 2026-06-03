import { Link } from 'react-router-dom';
import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';
import { LeadChatWidget } from '../../components/landing/LeadChatWidget';
import { track } from '../../lib/analytics';
import {
  ArrowRight, ShoppingBag, Bot, BarChart3, CheckCircle,
  Star, Package, Globe, Zap, TrendingUp,
  ChevronRight, Sparkles, Store, ExternalLink, Lock,
} from 'lucide-react';

const DEMO_WA = 'https://wa.me/918849549690?text=Hi%2C%20I%27d%20like%20to%20book%20a%20demo%20of%20ReplyCart%20%F0%9F%9A%80';

/* ══════════════════════════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="bg-white pt-24 pb-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left copy */}
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              Trusted by 500+ businesses worldwide
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-5">
              Sell more with your{' '}
              <span className="relative">
                <span className="relative z-10 text-teal-600">own online store</span>
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 9 Q75 2 150 8 Q225 14 298 7" stroke="#99f6e4" strokeWidth="3" strokeLinecap="round" fill="none"/>
                </svg>
              </span>
              {' '}+ AI chat
            </h1>

            <p className="text-lg text-gray-500 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              ReplyCart gives boutiques, bakeries, jewellers, and home sellers a branded storefront,
              AI-powered customer chat, and a full order management system — in 15 minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                to="/register"
                onClick={() => track.ctaClick('hero_start_free')}
                className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-teal-100"
              >
                Start free — no card needed <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={DEMO_WA}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track.demoClick('hero')}
                className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-teal-300 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Book a demo
              </a>
            </div>

            {/* Social proof row */}
            <div className="mt-8 flex items-center gap-4 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {['🧕','👩','👨','👩','🧑'].map((e, i) => (
                  <span key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-sm">{e}</span>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-800">4.8 ★</span> from 200+ happy sellers
              </p>
            </div>
          </div>

          {/* Right — store mockup card */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="relative">
              {/* Decorative blob */}
              <div className="absolute -top-8 -right-8 w-72 h-72 bg-teal-50 rounded-full blur-3xl opacity-80" />
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-amber-50 rounded-full blur-2xl opacity-60" />

              {/* Main card */}
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Store header bar */}
                <div className="bg-teal-600 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Store className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Floraved Beauty</p>
                      <p className="text-teal-200 text-xs">floraved.replycart.app</p>
                    </div>
                  </div>
                  <span className="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-full">Live ●</span>
                </div>

                {/* Product grid */}
                <div className="p-4 grid grid-cols-2 gap-3">
                  {[
                    { name: 'Rose Mist Toner', price: '₹349', cat: 'Skincare', color: 'bg-rose-50', emoji: '🌹' },
                    { name: 'Hair Growth Serum', price: '₹599', cat: 'Hair Care', color: 'bg-amber-50', emoji: '✨' },
                    { name: 'Glow Face Pack', price: '₹249', cat: 'Skincare', color: 'bg-purple-50', emoji: '🌿' },
                    { name: 'Vitamin C Cream', price: '₹449', cat: 'Skincare', color: 'bg-teal-50', emoji: '🍊' },
                  ].map((p) => (
                    <div key={p.name} className="rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                      <div className={`${p.color} h-24 flex items-center justify-center text-4xl`}>{p.emoji}</div>
                      <div className="p-2.5">
                        <p className="text-xs text-gray-400">{p.cat}</p>
                        <p className="text-sm font-semibold text-gray-800 leading-tight">{p.name}</p>
                        <p className="text-teal-600 font-bold text-sm mt-0.5">{p.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order bar */}
                <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-gray-500">3 new orders today</span>
                  </div>
                  <span className="text-xs font-semibold text-teal-600">View dashboard →</span>
                </div>
              </div>

              {/* Floating chat bubble */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-100 p-3 max-w-[190px]">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 text-sm">🤖</div>
                  <div>
                    <p className="text-xs text-gray-700 leading-snug">"Here are our top serums! Which one suits your hair type?"</p>
                    <p className="text-[10px] text-gray-400 mt-1">AI assistant · just now</p>
                  </div>
                </div>
              </div>

              {/* Floating order badge */}
              <div className="absolute -top-3 -right-3 bg-amber-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                +₹1,249 order 🎉
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   CATEGORY STRIP
══════════════════════════════════════════════════════════════════════════ */
const categories = [
  { emoji: '👗', label: 'Boutiques' },
  { emoji: '🎂', label: 'Bakeries' },
  { emoji: '💍', label: 'Jewellers' },
  { emoji: '🌿', label: 'Home Sellers' },
  { emoji: '💄', label: 'Beauty Brands' },
  { emoji: '🍱', label: 'Food & Tiffin' },
  { emoji: '🛍️', label: 'Handicrafts' },
  { emoji: '🌸', label: 'Wellness' },
];

function CategoryStrip() {
  return (
    <section className="border-y border-gray-100 bg-gray-50 py-5">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
          Built for every type of seller, everywhere
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((c) => (
            <span key={c.label} className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium px-3 py-1.5 rounded-full">
              <span>{c.emoji}</span> {c.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   FEATURES
══════════════════════════════════════════════════════════════════════════ */
const features = [
  {
    icon: Globe,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    title: 'Beautiful Storefront',
    desc: 'Your own branded store live in minutes. No developers, no hosting, no stress.',
    points: ['Your own domain (www.yourbrand.com)', 'Free SSL certificate included', 'Mobile-first design', 'Shareable store link'],
  },
  {
    icon: Bot,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    title: 'AI Customer Chat',
    desc: 'An AI assistant answers customer questions 24/7, recommends products, and collects orders.',
    points: ['Knows your full catalogue', 'Captures name, phone & address', 'Handles FAQs automatically', 'Works via WhatsApp & web'],
  },
  {
    icon: Package,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    title: 'Orders & Inventory',
    desc: 'Every order in one place — track status, manage stock, and never miss a sale.',
    points: ['Real-time order dashboard', 'Stock alerts & variants', 'Invoice generation', 'COD & online payments'],
  },
  {
    icon: BarChart3,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    title: 'CRM & Analytics',
    desc: 'Know your best customers, track revenue, and grow smarter every month.',
    points: ['Customer purchase history', 'Sales & revenue charts', 'Top products report', 'Repeat buyer insights'],
  },
];

function Features() {
  return (
    <section id="features" className="bg-white py-20 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-teal-600 text-sm font-semibold uppercase tracking-wider mb-2">Everything in one place</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            All the tools your business needs
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            No juggling 5 different apps. ReplyCart brings your store, chat, orders, and customers under one roof.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-gray-100 p-7 hover:shadow-lg transition-shadow group">
              <div className={`w-11 h-11 ${f.bg} rounded-xl flex items-center justify-center mb-5`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">{f.desc}</p>
              <ul className="space-y-2">
                {f.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className={`w-4 h-4 flex-shrink-0 ${f.color}`} />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   STATS
══════════════════════════════════════════════════════════════════════════ */
const stats = [
  { value: '500+', label: 'Active stores', icon: ShoppingBag, color: 'text-teal-600', bg: 'bg-teal-50' },
  { value: '₹2Cr+', label: 'Orders processed', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
  { value: '15 min', label: 'Average setup time', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
  { value: '4.8 ★', label: 'Seller satisfaction', icon: Star, color: 'text-rose-500', bg: 'bg-rose-50' },
];

function Stats() {
  return (
    <section className="bg-gray-50 py-16 border-y border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className={`text-3xl font-extrabold ${s.color} mb-1`}>{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   HOW IT WORKS
══════════════════════════════════════════════════════════════════════════ */
const steps = [
  {
    step: '01',
    title: 'Create your store',
    desc: 'Sign up, add your business name and logo, and you have a live storefront in minutes.',
    color: 'bg-teal-600',
  },
  {
    step: '02',
    title: 'Add your products',
    desc: 'Upload photos, set prices, and organise products into categories — it\'s as simple as filling a form.',
    color: 'bg-violet-600',
  },
  {
    step: '03',
    title: 'Share & start selling',
    desc: 'Share your store link on WhatsApp or Instagram. Customers browse, chat with AI, and place orders.',
    color: 'bg-amber-500',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 scroll-mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-teal-600 text-sm font-semibold uppercase tracking-wider mb-2">Simple to get started</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Up and running in 3 steps
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.step} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-6 left-[calc(100%_-_12px)] w-full h-px bg-gray-200 z-0" />
              )}
              <div className="relative z-10">
                <div className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center text-white font-black text-sm mb-5`}>
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-teal-100"
          >
            Get started for free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   AI HIGHLIGHT
══════════════════════════════════════════════════════════════════════════ */
const chatMessages = [
  { from: 'customer', text: 'Hi! Do you have anything for hair fall?' },
  { from: 'bot', text: 'Yes! We have 3 options for hair fall. Let me share them with you 👇', products: true },
  { from: 'customer', text: 'I like the serum. How much is it?' },
  { from: 'bot', text: 'The Hair Growth Serum is ₹599. It\'s our bestseller this month! Want to place an order?' },
  { from: 'customer', text: 'Yes please!' },
  { from: 'bot', text: 'Great! Could I have your name and delivery address? 😊' },
];

function AiHighlight() {
  return (
    <section id="ai" className="bg-gray-50 py-20 border-y border-gray-100 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-14">
          {/* Chat mockup */}
          <div className="flex-1 w-full max-w-sm mx-auto lg:mx-0">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Chat header */}
              <div className="bg-teal-600 px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">🤖</div>
                <div>
                  <p className="text-white font-semibold text-sm">Floraved AI Assistant</p>
                  <p className="text-teal-200 text-xs">Online · replies instantly</p>
                </div>
              </div>

              {/* Messages */}
              <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.from === 'customer' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[78%] ${
                      m.from === 'customer'
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    } rounded-2xl px-3.5 py-2.5 text-sm leading-snug`}>
                      {m.text}
                      {m.products && (
                        <div className="mt-2 grid grid-cols-3 gap-1.5">
                          {['🌿','✨','🌸'].map((e, j) => (
                            <div key={j} className="bg-white rounded-lg p-1.5 text-center border border-gray-100">
                              <span className="text-xl">{e}</span>
                              <p className="text-gray-600 text-[10px] mt-0.5 font-medium">₹{[399,599,299][j]}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 flex items-center gap-2">
                <div className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-400">
                  Type a message...
                </div>
                <button className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Copy */}
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1 rounded-full mb-5">
              <Sparkles className="w-3.5 h-3.5" /> AI-powered
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5 leading-tight">
              Your AI sales assistant,<br />
              <span className="text-teal-600">working around the clock</span>
            </h2>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Customers get instant answers about your products, prices, and stock — even at 2am.
              The AI recommends the right products, handles objections, and collects order details
              so you wake up to confirmed sales.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Trained on your exact product catalogue',
                'Captures name, phone & delivery address',
                'Recommends upsells naturally',
                'Speaks in the customer\'s language',
              ].map((pt) => (
                <li key={pt} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  {pt}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-teal-600 font-semibold hover:text-teal-700 transition-colors"
            >
              Try it on your store <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   TESTIMONIALS
══════════════════════════════════════════════════════════════════════════ */
const testimonials = [
  {
    name: 'Priya Mehta',
    role: 'Boutique owner, Surat',
    emoji: '🧕',
    quote: 'I was taking orders on WhatsApp manually for 3 years. ReplyCart gave me a proper store in one evening. My customers love browsing it.',
  },
  {
    name: 'Rohan Patel',
    role: 'Home baker, Ahmedabad',
    emoji: '👨',
    quote: 'The AI chat takes cake orders for me while I\'m baking! It asks the right questions and I just confirm the order. Saves me an hour every day.',
  },
  {
    name: 'Sneha Joshi',
    role: 'Jewellery seller, Jaipur',
    emoji: '👩',
    quote: 'My Instagram followers can now browse all my jewellery and pay online. Orders went up 40% in the first month. Worth every rupee.',
  },
];

function Testimonials() {
  return (
    <section id="testimonials" className="bg-white py-20 scroll-mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-teal-600 text-sm font-semibold uppercase tracking-wider mb-2">Real sellers, real results</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Loved by businesses worldwide
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-5">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl">{t.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   LIVE DEMO STORES
══════════════════════════════════════════════════════════════════════════ */
const demoStores = [
  {
    name: 'Floraved Beauty',
    category: 'Skincare & Hair Care',
    url: 'https://www.floraved.com',
    displayUrl: 'www.floraved.com',
    emoji: '🌸',
    color: 'bg-rose-50',
    accent: 'text-rose-600',
    border: 'border-rose-100',
    badge: 'Custom Domain',
    badgeColor: 'bg-rose-100 text-rose-700',
    products: ['Rose Mist Toner', 'Hair Growth Serum', 'Glow Face Pack'],
    demo: null,
  },
  {
    name: "Priya's Boutique",
    category: 'Women\'s Ethnic Fashion',
    url: 'https://www.replycart.app/priya-boutique',
    displayUrl: 'replycart.app/priya-boutique',
    emoji: '👗',
    color: 'bg-pink-50',
    accent: 'text-pink-600',
    border: 'border-pink-100',
    badge: 'Live Demo Store',
    badgeColor: 'bg-pink-100 text-pink-700',
    products: ['Banarasi Silk Saree', 'Anarkali Kurti Set', 'Bridal Lehenga'],
    demo: { email: 'owner@priyaboutique.in', password: 'Demo@1234' },
  },
  {
    name: 'Sugar & Crumbs',
    category: 'Custom Cakes & Bakery',
    url: 'https://www.replycart.app/sugar-crumbs',
    displayUrl: 'replycart.app/sugar-crumbs',
    emoji: '🎂',
    color: 'bg-amber-50',
    accent: 'text-amber-600',
    border: 'border-amber-100',
    badge: 'Live Demo Store',
    badgeColor: 'bg-amber-100 text-amber-700',
    products: ['Truffle Fantasy Cake', 'Fudge Brownies Box', 'Birthday Hamper'],
    demo: { email: 'hello@sugarcrumbs.in', password: 'Demo@1234' },
  },
];

function LiveDemoStores() {
  return (
    <section className="bg-white py-20 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            Live stores built on ReplyCart
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            See real stores in action
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Click any store below to browse it live — these are real sellers using ReplyCart right now.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {demoStores.map((store) => (
            <div key={store.name} className={`rounded-2xl border ${store.border} overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col`}>
              {/* Store header — clickable */}
              <a
                href={store.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track.demoStoreView(store.name)}
                className="group block"
              >
                <div className={`${store.color} px-5 py-5`}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-4xl">{store.emoji}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${store.badgeColor}`}>
                      {store.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{store.name}</h3>
                  <p className={`text-xs font-medium ${store.accent} mt-0.5`}>{store.category}</p>
                </div>

                {/* Products preview */}
                <div className="bg-white px-5 py-4 space-y-2">
                  {store.products.map((p) => (
                    <div key={p} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{p}</span>
                      <CheckCircle className={`w-3.5 h-3.5 ${store.accent}`} />
                    </div>
                  ))}
                </div>

                {/* View store footer */}
                <div className={`border-t ${store.border} px-5 py-3 flex items-center justify-between bg-gray-50`}>
                  <span className="text-xs text-gray-400 font-mono truncate">{store.displayUrl}</span>
                  <ExternalLink className={`w-3.5 h-3.5 ${store.accent} flex-shrink-0 group-hover:scale-110 transition-transform`} />
                </div>
              </a>

              {/* Demo credentials — only for demo stores */}
              {store.demo && (
                <div className={`border-t ${store.border} px-5 py-3 bg-slate-50`}>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Try the dashboard</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 w-16 shrink-0">Email</span>
                      <code className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 text-[11px] select-all">{store.demo.email}</code>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 w-16 shrink-0">Password</span>
                      <code className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 text-[11px] select-all">{store.demo.password}</code>
                    </div>
                  </div>
                  <a
                    href="/login"
                    onClick={() => track.demoLoginClick(store.name)}
                    className={`mt-3 flex items-center justify-center gap-1.5 w-full text-xs font-semibold ${store.accent} hover:opacity-80 transition-opacity`}
                  >
                    Login to dashboard <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          Want your store featured here?{' '}
          <a href={DEMO_WA} target="_blank" rel="noopener noreferrer" className="text-teal-600 font-semibold hover:underline">
            Talk to us →
          </a>
        </p>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   CUSTOM DOMAIN HIGHLIGHT
══════════════════════════════════════════════════════════════════════════ */
function CustomDomainHighlight() {
  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-14">

          {/* Left copy */}
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Globe className="w-3.5 h-3.5" /> Your brand, your domain
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 leading-tight">
              Sell on{' '}
              <span className="text-teal-400">your own domain.</span>
              <br />Not someone else's.
            </h2>
            <p className="text-slate-300 mb-8 leading-relaxed text-lg">
              Connect your existing domain — like <span className="text-white font-semibold">www.yourbrand.com</span> — to your ReplyCart store.
              Customers see your brand, not ours. SSL included, zero technical setup required.
            </p>

            <ul className="space-y-4 mb-10">
              {[
                { icon: '🌐', text: 'Use any domain you already own — GoDaddy, Namecheap, Google Domains' },
                { icon: '🔒', text: 'Free SSL certificate — your store is always https://' },
                { icon: '⚡', text: 'Goes live in minutes with a simple CNAME record' },
                { icon: '💼', text: 'Customers trust your brand domain more — higher conversions' },
                { icon: '📱', text: 'Works perfectly on mobile, WhatsApp shares, and social links' },
              ].map((pt) => (
                <li key={pt.text} className="flex items-start gap-3 text-slate-200 text-sm">
                  <span className="text-lg flex-shrink-0 mt-0.5">{pt.icon}</span>
                  {pt.text}
                </li>
              ))}
            </ul>

            <Link
              to="/register"
              onClick={() => track.customDomainCta()}
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-7 py-3.5 rounded-xl transition-colors shadow-lg shadow-teal-500/30"
            >
              Get your own domain store <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right — domain switcher visual */}
          <div className="flex-1 w-full max-w-md">
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-teal-500/10 rounded-3xl blur-2xl" />

              <div className="relative bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
                {/* Browser bar */}
                <div className="bg-slate-900 px-4 py-3 flex items-center gap-3 border-b border-slate-700">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/60" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <span className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 bg-slate-700 rounded-lg px-3 py-1.5 flex items-center gap-2">
                    <Lock className="w-3 h-3 text-green-400 flex-shrink-0" />
                    <span className="text-sm text-white font-medium">www.floraved.com</span>
                  </div>
                </div>

                {/* Store preview */}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-xl">🌸</div>
                    <div>
                      <p className="text-white font-bold">Floraved Beauty</p>
                      <p className="text-slate-400 text-xs">www.floraved.com</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { emoji: '🌹', name: 'Rose Toner', price: '₹349' },
                      { emoji: '✨', name: 'Hair Serum', price: '₹599' },
                    ].map((p) => (
                      <div key={p.name} className="bg-slate-700 rounded-xl p-3">
                        <span className="text-2xl">{p.emoji}</span>
                        <p className="text-slate-200 text-xs font-medium mt-1">{p.name}</p>
                        <p className="text-teal-400 font-bold text-sm">{p.price}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-teal-500/20 border border-teal-500/30 rounded-xl px-4 py-3 text-center">
                    <p className="text-teal-300 text-xs font-semibold">✓ Powered by ReplyCart · SSL Secured</p>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-teal-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg shadow-teal-500/40">
                🔒 SSL included
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white text-slate-800 text-xs font-bold px-3 py-2 rounded-xl shadow-lg">
                ✅ Custom domain live
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PRICING CTA
══════════════════════════════════════════════════════════════════════════ */
function PricingCta() {
  return (
    <section className="bg-gray-50 py-16 border-y border-gray-100">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <p className="text-teal-600 text-sm font-semibold uppercase tracking-wider mb-3">Simple pricing</p>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          Start free. Grow at your pace.
        </h2>
        <p className="text-gray-500 mb-8">
          Our free plan lets you launch a store and take your first orders with zero cost.
          Upgrade only when you're ready to scale.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-teal-100"
          >
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-teal-300 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            See all plans <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {['Free plan available', 'No credit card needed', 'Cancel anytime'].map((f) => (
            <span key={f} className="flex items-center gap-1.5 text-sm text-gray-500">
              <CheckCircle className="w-4 h-4 text-teal-500" /> {f}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   FINAL CTA BANNER
══════════════════════════════════════════════════════════════════════════ */
function CtaBanner() {
  return (
    <section className="bg-teal-600 py-20">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
          Ready to grow your business online?
        </h2>
        <p className="text-teal-100 mb-8 text-lg">
          Join 500+ sellers who turned their WhatsApp hustle into a proper online brand.
          Your store can be live in 15 minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/register"
            onClick={() => track.ctaClick('final_banner')}
            className="inline-flex items-center justify-center gap-2 bg-white text-teal-700 hover:bg-teal-50 font-bold px-8 py-3.5 rounded-xl transition-colors shadow-lg"
          >
            Create your store — it's free <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href={DEMO_WA}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track.demoClick('final_banner')}
            className="inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors"
          >
            Book a demo call
          </a>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans antialiased">
      <Navbar />
      <Hero />
      <CategoryStrip />
      <LiveDemoStores />
      <Features />
      <CustomDomainHighlight />
      <Stats />
      <HowItWorks />
      <AiHighlight />
      <Testimonials />
      <PricingCta />
      <CtaBanner />
      <Footer />
      <LeadChatWidget />
    </div>
  );
}
