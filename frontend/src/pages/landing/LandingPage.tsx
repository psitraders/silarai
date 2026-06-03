import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MessageSquareQuote, ShoppingBag, Package, BarChart2, Send, Store,
  Zap, Users, Shield, Star, ArrowRight, Check, MessageCircle,
  ChevronRight, Bot, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { landingApi, DEFAULT_CONTENT, type LandingPageContent, type FeatureItem } from '../../api/landing.api';

// ── Icon map for dynamic feature icons ───────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  MessageSquareQuote, ShoppingBag, Package, BarChart2, Send, Store,
  Zap, Users, Shield, Star, MessageCircle, Bot,
};

function DynIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Package;
  return <Icon className={className} />;
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm">
            <MessageSquareQuote className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-base">ReplyCart</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-slate-600 hover:text-teal-700 transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-slate-600 hover:text-teal-700 transition-colors">How it works</a>
          <a href="#testimonials" className="text-sm text-slate-600 hover:text-teal-700 transition-colors">Reviews</a>
          <Link to="/pricing" className="text-sm text-slate-600 hover:text-teal-700 transition-colors">Pricing</Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors">
            Log in
          </Link>
          <Link to="/register" className="text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5">
            Start Free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setOpen(o => !o)} className="md:hidden p-2 rounded-xl hover:bg-slate-100">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2">
          {['#features', '#how-it-works', '#testimonials'].map((href, i) => (
            <a key={i} href={href} onClick={() => setOpen(false)}
              className="block text-sm text-slate-700 py-2 px-3 rounded-xl hover:bg-slate-50">
              {['Features', 'How it works', 'Reviews'][i]}
            </a>
          ))}
          <Link to="/pricing" onClick={() => setOpen(false)} className="block text-sm text-slate-700 py-2 px-3 rounded-xl hover:bg-slate-50">Pricing</Link>
          <div className="flex gap-2 pt-2">
            <Link to="/login" className="flex-1 text-center text-sm font-medium py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50">Log in</Link>
            <Link to="/register" className="flex-1 text-center text-sm font-semibold text-white bg-teal-600 py-2.5 rounded-xl hover:bg-teal-700">Start Free</Link>
          </div>
        </div>
      )}
    </header>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero({ content }: { content: LandingPageContent['hero'] }) {
  return (
    <section className="pt-24 pb-16 sm:pt-32 sm:pb-24 bg-gradient-to-b from-teal-50/60 via-white to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-0 w-[300px] h-[300px] bg-teal-300/10 rounded-full blur-2xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            {content.badge}
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-5">
            {content.headline.split(' ').map((word, i) => {
              const highlighted = ['WhatsApp', 'Orders', 'Chats'].includes(word.replace(/[^a-zA-Z]/g, ''));
              return highlighted
                ? <span key={i} className="text-teal-600">{word} </span>
                : <span key={i}>{word} </span>;
            })}
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            {content.subheadline}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register"
              className="inline-flex items-center gap-2 text-white bg-teal-600 hover:bg-teal-700 font-semibold px-7 py-3.5 rounded-2xl shadow-lg shadow-teal-200 hover:shadow-teal-300 transition-all text-sm">
              {content.ctaPrimary} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/pricing"
              className="inline-flex items-center gap-2 text-slate-700 hover:text-teal-700 font-semibold px-7 py-3.5 rounded-2xl border border-slate-200 hover:border-teal-200 bg-white transition-all text-sm">
              {content.ctaSecondary} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-xs text-slate-400 mt-3">No credit card required · Free forever plan available</p>
        </div>

        {/* Mock UI cards */}
        <div className="mt-16 relative max-w-4xl mx-auto">
          {/* Main dashboard preview */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            {/* Fake window chrome */}
            <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 mx-4 bg-slate-200 rounded-lg h-5 text-[10px] text-slate-500 flex items-center justify-center">
                app.replycart.in/dashboard
              </div>
            </div>
            {/* Dashboard mock */}
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Orders', value: '1,284', color: 'text-teal-600', bg: 'bg-teal-50' },
                { label: 'Revenue', value: '₹3.2L', color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Customers', value: '428', color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Pending', value: '12', color: 'text-amber-600', bg: 'bg-amber-50' },
              ].map(stat => (
                <div key={stat.label} className={`${stat.bg} rounded-2xl p-4`}>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Recent orders mock */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-700 mb-3">Recent Orders</p>
                {[
                  { num: 'RC-1042', name: 'Priya S.', amount: '₹1,240', status: 'Confirmed', color: 'bg-teal-100 text-teal-700' },
                  { num: 'RC-1041', name: 'Rahul M.', amount: '₹890',   status: 'Shipped',   color: 'bg-blue-100 text-blue-700' },
                  { num: 'RC-1040', name: 'Anjali P.', amount: '₹2,100', status: 'Delivered', color: 'bg-green-100 text-green-700' },
                ].map(o => (
                  <div key={o.num} className="flex items-center gap-2 py-1.5">
                    <span className="text-[10px] font-mono text-slate-500 w-14 shrink-0">{o.num}</span>
                    <span className="text-xs text-slate-700 flex-1">{o.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${o.color}`}>{o.status}</span>
                    <span className="text-xs font-bold text-slate-900">{o.amount}</span>
                  </div>
                ))}
              </div>
              {/* AI reply mock */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-700 mb-3">AI Reply Generator</p>
                <div className="space-y-2">
                  <div className="bg-white rounded-xl px-3 py-2 text-xs text-slate-600 border border-slate-100">
                    "Do you have this kurta in blue?"
                  </div>
                  <div className="bg-teal-600 rounded-xl px-3 py-2 text-xs text-white">
                    "Yes! We have it in Sky Blue and Navy. Would you like to see photos? 😊"
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-7 bg-white rounded-xl border border-slate-200 px-2 flex items-center">
                      <span className="text-[10px] text-slate-400">Type your query...</span>
                    </div>
                    <div className="w-7 h-7 bg-teal-600 rounded-xl flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating notification badges */}
          <div className="absolute -top-4 -right-4 sm:-right-8 bg-white rounded-2xl shadow-xl border border-slate-100 px-3 py-2.5 flex items-center gap-2.5 hidden sm:flex">
            <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">New Order</p>
              <p className="text-[10px] text-slate-400">₹1,240 · just now</p>
            </div>
          </div>
          <div className="absolute -bottom-4 -left-4 sm:-left-8 bg-white rounded-2xl shadow-xl border border-slate-100 px-3 py-2.5 flex items-center gap-2.5 hidden sm:flex">
            <div className="w-8 h-8 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
              <MessageSquareQuote className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">AI Reply Ready</p>
              <p className="text-[10px] text-slate-400">Generated in 1.2s</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar({ stats }: { stats: LandingPageContent['stats'] }) {
  return (
    <section className="border-y border-slate-100 bg-slate-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="text-center">
            <p className="text-3xl font-extrabold text-teal-600">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────
function FeaturesSection({ features }: { features: FeatureItem[] }) {
  return (
    <section id="features" className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Features</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">Everything you need to sell more</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">One platform built for D2C sellers who want to grow without the complexity.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="group p-6 rounded-2xl border border-slate-100 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50 transition-all bg-white">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center mb-4 transition-colors">
                <DynIcon name={f.icon} className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────
function HowItWorksSection({ steps }: { steps: LandingPageContent['howItWorks'] }) {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">How it works</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">Up and running in minutes</h2>
          <p className="text-slate-500 mt-3">No technical setup required. Just sign up and start selling.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-teal-200 via-teal-400 to-teal-200 -translate-y-1/2" style={{ top: '2.5rem' }} />
          {steps.map((s, i) => (
            <div key={i} className="relative text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-teal-600 text-white flex items-center justify-center text-3xl font-black mb-6 shadow-xl shadow-teal-200 relative z-10">
                {s.step}
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
function TestimonialsSection({ testimonials }: { testimonials: LandingPageContent['testimonials'] }) {
  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">Sellers love ReplyCart</h2>
          <p className="text-slate-500 mt-3">Real stories from sellers growing their businesses with us.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col gap-4">
              {/* Stars */}
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              {/* Quote */}
              <p className="text-slate-700 text-sm leading-relaxed flex-1">"{t.quote}"</p>
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.business}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Banner ────────────────────────────────────────────────────────────────
function CtaBanner({ content }: { content: LandingPageContent['ctaBanner'] }) {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl px-8 py-14 text-center overflow-hidden shadow-2xl shadow-teal-200">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/4" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">{content.headline}</h2>
            <p className="text-teal-100 mb-8 max-w-md mx-auto">{content.subtext}</p>
            <Link to="/register"
              className="inline-flex items-center gap-2 bg-white text-teal-700 hover:bg-teal-50 font-bold px-8 py-4 rounded-2xl shadow-lg transition-all text-sm">
              {content.ctaText} <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-4 text-teal-100 text-xs">
              {['Free plan forever', 'No credit card required', 'Set up in 5 minutes'].map(item => (
                <span key={item} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center">
                <MessageSquareQuote className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-sm">ReplyCart</span>
            </div>
            <p className="text-xs leading-relaxed">Turn chats into orders. Built for Indian social sellers.</p>
          </div>
          {/* Product */}
          <div>
            <p className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Product</p>
            <div className="space-y-2 text-xs">
              <a href="#features" className="block hover:text-teal-400 transition-colors">Features</a>
              <Link to="/pricing" className="block hover:text-teal-400 transition-colors">Pricing</Link>
              <a href="#how-it-works" className="block hover:text-teal-400 transition-colors">How it works</a>
            </div>
          </div>
          {/* Account */}
          <div>
            <p className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Account</p>
            <div className="space-y-2 text-xs">
              <Link to="/login" className="block hover:text-teal-400 transition-colors">Log in</Link>
              <Link to="/register" className="block hover:text-teal-400 transition-colors">Sign up free</Link>
            </div>
          </div>
          {/* Legal */}
          <div>
            <p className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Legal</p>
            <div className="space-y-2 text-xs">
              <span className="block">Privacy Policy</span>
              <span className="block">Terms of Service</span>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>© {new Date().getFullYear()} ReplyCart. All rights reserved.</p>
          <p>Made with ❤️ for Indian sellers</p>
        </div>
      </div>
    </footer>
  );
}

// ── Main landing page ─────────────────────────────────────────────────────────
export function LandingPage() {
  const { data: content = DEFAULT_CONTENT } = useQuery({
    queryKey: ['landing-content'],
    queryFn: landingApi.getContent,
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero          content={content.hero} />
        <StatsBar      stats={content.stats} />
        <FeaturesSection features={content.features} />
        <HowItWorksSection steps={content.howItWorks} />
        <TestimonialsSection testimonials={content.testimonials} />
        <CtaBanner     content={content.ctaBanner} />
      </main>
      <Footer />
    </div>
  );
}
