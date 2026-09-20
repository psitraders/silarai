import React, { Suspense } from 'react';
import { motion } from 'motion/react';
import shoppingAssistantImg from '../assets/images/shopping_assistant_ui_1788795889801.webp';
import { DeferredSection } from './DeferredSection';
import { SmoothWaveBackground } from './SmoothWaveBackground';
import {
  Bot,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Zap,
  Play,
  Maximize2,
  MessageSquare,
  Gem,
  Store,
  Home,
  Heart,
  Package,
  Palette,
  Factory,
  Truck,
  Boxes,
} from 'lucide-react';

// Modular Lazy Loading for below-the-fold interactive visualizer
const HeroDashboardVisualizer = React.lazy(() =>
  import('./HeroDashboardVisualizer').then((m) => ({ default: m.HeroDashboardVisualizer }))
);

interface HeroSectionProps {
  onBookDemo: () => void;
  onWatchTour?: () => void;
  onLogin?: () => void;
  onSelectSector?: (sectorSlug: string) => void;
  showBackground?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onBookDemo,
  onWatchTour,
  onSelectSector,
  showBackground = true,
}) => {
  const scrollToPlayground = () => {
    const el = document.getElementById('hero-dashboard-visualizer');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onBookDemo();
    }
  };

  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 text-slate-900 overflow-hidden">
      {/* Reference-Inspired Smooth Silky 3D Contour Waves & Ambient Peach Glow */}
      {showBackground && <SmoothWaveBackground isHeroOnly={true} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Hero Headline & AI Shopping Assistant Visual Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Headlines, Description, Feature Chips & Action CTAs */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-4">
              {/* Reference-Matched Pill Announcement Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-xs font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse" />
                <span className="tracking-wide uppercase text-[11px] font-bold text-slate-900">
                  ENTERPRISE AI · DEPLOYED IN DAYS
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-[#F47A38] font-bold hidden sm:inline">Built for every seller</span>
              </div>

              <h1
                id="hero-heading"
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]"
              >
                Sell more with your own online store +{' '}
                <span className="bg-gradient-to-r from-[#245668] via-[#0D8F81] to-[#F47A38] bg-clip-text text-transparent">
                  AI Shopping assistant
                </span>
              </h1>

              <p
                id="hero-description"
                className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                Automate online sales with 24/7 conversational shopping, instant catalog search, and real-time dynamic pricing.
              </p>

              {/* Reference-Matched Call to Action Pill Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={onBookDemo}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold text-white bg-gradient-to-r from-[#F48C68] via-[#F47A38] to-[#E97A52] hover:from-[#F47A38] hover:to-[#DE6B44] rounded-full shadow-[0_10px_25px_-4px_rgba(244,122,56,0.45)] hover:shadow-[0_14px_30px_-4px_rgba(244,122,56,0.55)] transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer group"
                >
                  <span>Book Live Demo</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </button>

                {onWatchTour && (
                  <button
                    onClick={onWatchTour}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-700 bg-white/80 hover:bg-white hover:text-slate-950 border border-slate-200/90 hover:border-slate-300 rounded-full shadow-2xs hover:shadow-xs transition-all cursor-pointer backdrop-blur-md"
                  >
                    <Play className="w-4 h-4 text-[#F47A38] fill-[#F47A38]" />
                    <span>Watch Product Tour</span>
                  </button>
                )}
              </div>

              {/* Social Proof Trust Snippets */}
              <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0D8F81]" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0D8F81]" />
                  1-Click E-Commerce Sync
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0D8F81]" />
                  Launch in under 3 days
                </span>
              </div>
            </div>

            {/* Right Column: AI Shopping Assistant Image Showcase Card (LCP Candidate) */}
            <div className="lg:col-span-5 w-full">
              <div className="relative group">
                {/* Ambient Soft Aura */}
                <div className="absolute -inset-1 bg-gradient-to-r from-peach-300/35 via-teal-300/25 to-coral-400/30 rounded-[2.5rem] blur-xl opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Main Frosted Glass Card Frame */}
                <div className="relative rounded-3xl bg-white/95 border border-slate-200/80 p-3.5 sm:p-4 shadow-[0_20px_50px_-10px_rgba(36,86,104,0.12)] backdrop-blur-2xl space-y-3 visible opacity-100">
                  {/* Card Top Status Bar */}
                  <div className="flex items-center justify-between px-2 py-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="font-bold text-slate-900 text-xs tracking-wide">AI Shopping Assistant</span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#0D8F81] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
                      <Bot className="w-3 h-3 text-[#F47A38]" />
                      24/7 Live Copilot
                    </span>
                  </div>

                  {/* Image Display with Interactive Floating Badges - Made 100% visible all the time with zero CLS */}
                  <div
                    onClick={scrollToPlayground}
                    className="relative rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-100 shadow-md cursor-pointer group/img aspect-[1376/768]"
                  >
                    <img
                      src={shoppingAssistantImg}
                      alt="AI Shopping Assistant Interface"
                      className="w-full h-auto max-h-[380px] object-cover sm:object-contain object-top block transform group-hover/img:scale-[1.02] transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      fetchPriority="high"
                      loading="eager"
                      decoding="sync"
                      width={1376}
                      height={768}
                    />

                    {/* Subtle bottom edge gradient so playground label remains legible without obscuring image */}
                    <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />

                    {/* Floating Customer Query & Copilot Answer Pills - non-intrusive */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex flex-col gap-1.5 pointer-events-none">
                      <div className="self-start bg-slate-900/85 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-lg border border-white/20 shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-peach-400"></span>
                        <span className="font-medium truncate">"Find hydraulic valves rated for 2,500 PSI"</span>
                      </div>
                      <div className="self-end bg-teal-950/85 backdrop-blur-md text-teal-200 text-[11px] px-2.5 py-1 rounded-lg border border-teal-400/30 shadow-sm flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-peach-300 shrink-0" />
                        <span className="font-medium">"Found 2 matching in stock with fast dispatch!"</span>
                      </div>
                    </div>

                    {/* Bottom Action / Expand Details Bar */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold text-slate-200 bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-md border border-slate-700/60 flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3 text-teal-300" />
                        <span>Web + WhatsApp</span>
                      </span>
                      <span className="text-[10px] font-extrabold text-peach-300 bg-slate-950/85 px-2 py-0.5 rounded-md border border-peach-400/30 flex items-center gap-1 shadow-xs group-hover/img:border-peach-300 transition-colors">
                        <span>Interactive Playground</span>
                        <Maximize2 className="w-3 h-3 text-peach-300" />
                      </span>
                    </div>
                  </div>

                  {/* Feature Pill Row beneath image */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] sm:text-[11px] pt-1">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80 text-slate-700">
                      <div className="font-bold text-slate-900">Sub-50ms</div>
                      <div className="text-slate-500 text-[9px]">Vector Search</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80 text-slate-700">
                      <div className="font-bold text-[#0D8F81]">+45%</div>
                      <div className="text-slate-500 text-[9px]">Order Uplift</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80 text-slate-700">
                      <div className="font-bold text-[#F47A38]">1-Click</div>
                      <div className="text-slate-500 text-[9px]">Cart Checkout</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Full-Spectrum Attention Banner for Every Type of Seller Everywhere */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-8 sm:mt-10 max-w-5xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-3xl bg-white/80 border border-slate-200/80 p-5 sm:p-6 lg:p-7 shadow-[0_15px_40px_-10px_rgba(36,86,104,0.08)] backdrop-blur-xl group">
            {/* Top ambient highlight glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F48C68]/40 to-transparent" />
            <div className="pointer-events-none absolute -top-24 -left-24 w-64 h-64 bg-peach-400/10 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 w-64 h-64 bg-coral-500/10 rounded-full blur-3xl" />

            {/* Header / Intro */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
              <div className="space-y-1.5 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-50 border border-peach-200 text-[#F47A38] text-[11px] font-bold uppercase tracking-wider shadow-2xs">
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-coral-400" />
                  </span>
                  <span>Universal AI Commerce Architecture</span>
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                  Built for every type of seller, everywhere
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-normal max-w-2xl">
                  From B2B2C, Boutiques, and Jewellers to Home Sellers, FMCG Brands, Distributors, and Wholesalers — powered by a unified catalog and smart shopping assistant.
                </p>
              </div>

              <div className="flex items-center justify-center lg:justify-end gap-2.5 shrink-0">
                <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center shadow-2xs">
                  <div className="text-xs font-bold text-[#0D8F81]">11+ Sectors</div>
                  <div className="text-[10px] text-slate-500 font-medium">Ready Out-of-Box</div>
                </div>
                <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center shadow-2xs">
                  <div className="text-xs font-bold text-[#F47A38]">&lt; 50ms</div>
                  <div className="text-[10px] text-slate-500 font-medium">Semantic Search</div>
                </div>
              </div>
            </div>

            {/* Seller Category Badges Grid */}
            <div className="pt-5 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#F47A38]" />
                  Explore industry storefronts &amp; AI shopping assistant:
                </span>
                <span className="text-[10px] text-[#0D8F81] font-bold hidden sm:inline">
                  Click any sector to view launch blueprint →
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5">
                {[
                  { name: 'B2B2C', icon: Zap, tag: 'Multi-Tier', slug: 'b2b2c' },
                  { name: 'Boutiques', icon: Store, tag: 'Curated', slug: 'boutiques' },
                  { name: 'Jeweller', icon: Gem, tag: 'High-Value', slug: 'jeweller' },
                  { name: 'Home Sellers', icon: Home, tag: 'Direct', slug: 'home-sellers' },
                  { name: 'Beauty Brands', icon: Heart, tag: 'Formulas', slug: 'beauty-brands' },
                  { name: 'Food & Packaging', icon: Package, tag: 'Perishable', slug: 'food-packaging' },
                  { name: "Handicraft's", icon: Palette, tag: 'Artisanal', slug: 'handicrafts' },
                  { name: 'Cosmetic & Wellness', icon: Sparkles, tag: 'Personal Care', slug: 'cosmetic-wellness' },
                  { name: 'Small & Medium FMCG', icon: Factory, tag: 'Manufacturers', slug: 'small-medium-fmcg' },
                  { name: 'Distributors', icon: Truck, tag: 'Supply Hub', slug: 'distributors' },
                  { name: 'Wholesalers', icon: Boxes, tag: 'Bulk Orders', slug: 'wholesalers' },
                ].map((item, idx) => {
                  const ItemIcon = item.icon;
                  const isBoutique = item.slug === 'boutiques';
                  return (
                    <a
                      key={idx}
                      href={`/sector/${item.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (onSelectSector) {
                          onSelectSector(item.slug);
                        } else {
                          window.history.pushState(null, '', `?sector=${item.slug}`);
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Explore ${item.name} AI Commerce & Shopping Assistant landing page`}
                      className={`group/pill relative flex flex-col p-2.5 sm:p-3 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 shadow-xs hover:shadow-md cursor-pointer text-left ${
                        isBoutique
                          ? 'bg-peach-50/70 hover:bg-peach-50 border-peach-300 ring-1 ring-peach-300/40 shadow-peach-300/10'
                          : 'bg-slate-50/80 hover:bg-white border-slate-200/80 hover:border-peach-300/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="w-7 h-7 rounded-lg bg-white group-hover/pill:bg-peach-100 flex items-center justify-center text-[#F47A38] transition-colors shadow-2xs border border-slate-200/60">
                          <ItemIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 group-hover/pill:text-[#0D8F81] transition-colors uppercase tracking-wider">
                          {item.tag}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-800 group-hover/pill:text-slate-950 transition-colors line-clamp-1">
                          {item.name}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400 group-hover/pill:text-[#F47A38] group-hover/pill:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Bottom Micro-Assurance Bar */}
            <div className="mt-4 pt-3.5 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0D8F81]" />
                Custom pricing matrix for every seller tier
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0D8F81]" />
                Real-time multi-channel inventory sync
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0D8F81]" />
                Zero code script embed across any store
              </span>
            </div>
          </div>
        </motion.div>

        {/* Deferred Below-the-Fold Hero Interactive Dashboard Visualizer */}
        <DeferredSection
          id="hero-dashboard-deferred"
          minHeight="520px"
          fallback={
            <div className="mt-10 sm:mt-14 max-w-5xl mx-auto rounded-[2rem] bg-white/80 p-12 border border-slate-200/80 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-full border-2 border-peach-400 border-t-transparent animate-spin" />
              <span className="text-xs font-semibold text-slate-600">Loading interactive platform preview...</span>
            </div>
          }
        >
          <Suspense fallback={null}>
            <HeroDashboardVisualizer
              onBookDemo={onBookDemo}
              onWatchTour={onWatchTour}
            />
          </Suspense>
        </DeferredSection>
      </div>
    </section>
  );
};
