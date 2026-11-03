import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe,
  Palette,
  Image as ImageIcon,
  FileText,
  ShieldCheck,
  Rocket,
  ShoppingBag,
  Building2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lock,
  Layers,
  HelpCircle,
  Check,
  Copy,
  Sliders,
  Laptop,
  Tag,
  Compass
} from 'lucide-react';

interface LaunchOnlineStorePageProps {
  onBackToHome?: () => void;
  onBookDemo?: (plan?: string) => void;
  onWatchTour?: () => void;
  onNavigateAiShoppingAssistant?: () => void;
  onNavigateCommercePlatform?: () => void;
  onNavigateDistributors?: () => void;
  onNavigateManufacturing?: () => void;
  onNavigateShopifyComparison?: () => void;
  onNavigateWoocommerceComparison?: () => void;
  onNavigatePricing?: () => void;
}

export type ThemeKey = 'emerald' | 'darkteal' | 'persimmon' | 'forest' | 'slate';

export const LaunchOnlineStorePage: React.FC<LaunchOnlineStorePageProps> = ({
  onBackToHome,
  onBookDemo: _onBookDemo,
  onWatchTour: _onWatchTour,
  onNavigateAiShoppingAssistant,
  onNavigateCommercePlatform,
  onNavigateDistributors,
  onNavigateManufacturing,
  onNavigateShopifyComparison,
  onNavigateWoocommerceComparison,
  onNavigatePricing: _onNavigatePricing,
}) => {
  // Direct authentication portal URL for SilarAI
  const LOGIN_URL = 'https://app.silarai.com/login';

  const handleLaunchStore = () => {
    window.location.href = LOGIN_URL;
  };

  const scrollToWorkflow = () => {
    const el = document.getElementById('eight-step-workflow');
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const offsetPosition = elementRect - bodyRect - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  // Interactive Storefront Simulator State — Defaulted to SilarAI Growth Green
  const [selectedColorTheme, setSelectedColorTheme] = useState<ThemeKey>('emerald');
  const [storeType, setStoreType] = useState<'b2c' | 'b2b'>('b2c');
  const [brandName, setBrandName] = useState('Apex Botanicals');
  const [copiedDns, setCopiedDns] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Associated website brand color systems
  const colorThemes: Record<
    ThemeKey,
    {
      id: ThemeKey;
      name: string;
      brandRole: string;
      primary: string;
      accent: string;
      hex: string;
      badge: string;
      button: string;
      accentBg: string;
      description: string;
    }
  > = {
    emerald: {
      id: 'emerald',
      name: 'Growth Teal-Green',
      brandRole: 'Website Secondary Brand (#0D8F81)',
      primary: '#0D8F81',
      accent: '#74D3C3',
      hex: '#0D8F81',
      badge: 'bg-[#0D8F81] text-white',
      button: 'bg-[#0D8F81] hover:bg-[#0a776c] text-white',
      accentBg: 'bg-[#0D8F81]/15 text-[#0D8F81]',
      description: 'The signature growth green used across SilarAI for active tabs, live inventory indicators, and conversion metrics.',
    },
    darkteal: {
      id: 'darkteal',
      name: 'Deep Structural Teal',
      brandRole: 'Website Primary Structural Canvas (#245668)',
      primary: '#245668',
      accent: '#90B6C4',
      hex: '#245668',
      badge: 'bg-[#245668] text-white',
      button: 'bg-[#245668] hover:bg-[#1d4654] text-white',
      accentBg: 'bg-[#245668]/15 text-[#245668]',
      description: 'The main structural brand color of the platform; gives headers, footers, and cards architectural authority.',
    },
    persimmon: {
      id: 'persimmon',
      name: 'Vibrant Persimmon Orange',
      brandRole: 'Website High-Contrast CTA (#F47A38)',
      primary: '#F47A38',
      accent: '#FCD8C4',
      hex: '#F47A38',
      badge: 'bg-[#F47A38] text-white',
      button: 'bg-[#F47A38] hover:bg-[#e45f18] text-white',
      accentBg: 'bg-[#F47A38]/15 text-[#e45f18]',
      description: 'High-contrast conversion color driving attention to 1-click cart additions, quote requests, and order triggers.',
    },
    forest: {
      id: 'forest',
      name: 'Lush Forest Emerald',
      brandRole: 'Botanical & Eco Green (#059669)',
      primary: '#059669',
      accent: '#A7F3D0',
      hex: '#059669',
      badge: 'bg-[#059669] text-white',
      button: 'bg-[#059669] hover:bg-[#047857] text-white',
      accentBg: 'bg-[#059669]/15 text-[#059669]',
      description: 'Lush natural green tailored for beauty, wellness, organic retail, sustainable goods, and consumer storefronts.',
    },
    slate: {
      id: 'slate',
      name: 'Industrial Deep Slate',
      brandRole: 'B2B Technical & Commercial (#0F172A)',
      primary: '#0F172A',
      accent: '#38BDF8',
      hex: '#0F172A',
      badge: 'bg-[#0F172A] text-white',
      button: 'bg-[#0F172A] hover:bg-[#1E293B] text-white',
      accentBg: 'bg-slate-200 text-slate-800',
      description: 'Engineered for industrial supply, electrical distribution, equipment manufacturing, and multi-tier dealer portals.',
    },
  };

  const activeTheme = colorThemes[selectedColorTheme];

  const handleCopyDns = () => {
    navigator.clipboard?.writeText('cname.silarai.com');
    setCopiedDns(true);
    setTimeout(() => setCopiedDns(false), 2000);
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  // 8-Step Launch Journey Definitions
  const launchSteps = [
    {
      step: 1,
      title: 'Log in to SilarAI',
      estTime: '2 mins',
      icon: Lock,
      summary: 'Users log in to their SilarAI account and open the dedicated store setup workflow.',
      detail: 'Access your account dashboard or verify your email to initialize your new ecommerce workspace.',
      dependency: 'Prerequisite: Valid work email or existing SilarAI account credentials.',
      statusColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    },
    {
      step: 2,
      title: 'Select Your Brand Colours',
      estTime: '3 mins',
      icon: Palette,
      summary: 'Choose colours that reflect your unique brand identity and storefront style.',
      detail: 'Select from SilarAI associated brand colors (Growth Green #0D8F81, Dark Teal #245668, Persimmon Orange #F47A38, Off-White #F8F9FA) or input your custom hex codes.',
      dependency: 'Dependency: Hex codes or predefined color preference for primary and accent styles.',
      statusColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    },
    {
      step: 3,
      title: 'Add Your Logo',
      estTime: '3 mins',
      icon: ImageIcon,
      summary: 'Upload your business logo to personalize your header, favicon, and email receipts.',
      detail: 'Upload transparent PNG, SVG, or high-res WebP assets. SilarAI automatically generates retina and mobile header renditions.',
      dependency: 'Dependency: Square or horizontal logo image file (PNG/SVG recommended).',
      statusColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    },
    {
      step: 4,
      title: 'Add Your Hero Banner',
      estTime: '4 mins',
      icon: Laptop,
      summary: 'Upload a banner image to showcase your business, brand positioning, or hero products.',
      detail: 'Set desktop and mobile banner artwork with customizable headline overlays, subheadings, and quick action buttons.',
      dependency: 'Dependency: Hero graphic or brand photography (minimum 1920x600 recommended).',
      statusColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    },
    {
      step: 5,
      title: 'Add Your SEO Title and Content',
      estTime: '5 mins',
      icon: FileText,
      summary: 'Configure your page title and SEO content to explain your business and improve search visibility.',
      detail: 'Specify your meta title (<60 chars), meta description (<160 chars), social OpenGraph cards, and schema tags so search engines comprehend your catalog.',
      dependency: 'Important Notice: SEO fields help search engines understand a page but do not guarantee search rankings.',
      statusColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    },
    {
      step: 6,
      title: 'Connect Your Own Domain',
      estTime: '4 mins',
      icon: Globe,
      summary: 'Point your registered domain (e.g., store.yourbrand.com) to your SilarAI storefront.',
      detail: 'Add a standard CNAME record pointing to cname.silarai.com in your domain DNS manager. SilarAI automatically provisions free SSL encryption.',
      dependency: 'Important Notice: Users must bring their own domain. Domain registration and DNS propagation (typically 15 min - 24 hr) take additional time. SilarAI does not provide free domain registrations.',
      statusColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    },
    {
      step: 7,
      title: 'Add Your Return and Refund Policy',
      estTime: '5 mins',
      icon: ShieldCheck,
      summary: 'Add your store’s return, exchange, warranty, and refund terms before launching.',
      detail: 'Paste your bespoke policy terms, return window timeframes, and customer support contact details to build buyer trust.',
      dependency: 'Legal Notice: Customers are solely responsible for ensuring their policies are accurate, fair, and compliant with applicable regional laws. SilarAI provides policy input fields, not legal advice.',
      statusColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    },
    {
      step: 8,
      title: 'Launch Your Store and Add Products',
      estTime: '4 mins',
      icon: Rocket,
      summary: 'Publish your configured storefront directly, then log in to your SilarAI backend to add products.',
      detail: 'Your branded storefront goes live on the web immediately. You can now add products individually or import bulk catalogues via CSV/Shopify whenever you are ready.',
      dependency: 'Operational Clarification: Publishing your storefront creates your branded digital home. Adding products and configuring payment gateways occur in the backend to enable complete order fulfillment.',
      statusColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    },
  ];

  // Practical FAQs
  const faqs = [
    {
      question: 'Can I launch a store in under 30 minutes?',
      answer:
        'Yes. You can configure your store branding (colours, logo, hero banner), input your SEO metadata, connect your custom domain, and publish your live storefront in under 30 minutes. Once published, you can add products whenever you are ready.',
    },
    {
      question: 'Do I get a free custom domain with SilarAI?',
      answer:
        'No. Users bring their own registered domain name (e.g., store.yourcompany.com). SilarAI provides simple CNAME connection instructions and provisions automatic SSL encryption at zero extra cost, but domain registration must be done through your chosen domain registrar.',
    },
    {
      question: 'Can I choose my own brand colours and fonts?',
      answer:
        'Yes, completely. You can select from the curated brand systems (such as SilarAI Growth Teal-Green #0D8F81, Deep Structural Teal #245668, Persimmon Orange #F47A38, or Lush Forest #059669) or enter your exact custom hexadecimal codes for primary buttons, navigation headers, text, and accent states.',
    },
    {
      question: 'How do I add products after launching?',
      answer:
        'Once your storefront is published, log in to your SilarAI merchant dashboard. From the Catalogue manager, you can add products individually through a visual editor or import bulk catalogues via standard CSV/Excel files or native Shopify/WooCommerce catalog sync connectors.',
    },
    {
      question: 'Will my store automatically rank on Google?',
      answer:
        'No. No ecommerce platform can guarantee search engine rankings. SilarAI provides built-in SEO tools—allowing you to configure custom meta titles, descriptions, canonical tags, and structured Schema.org data so search engines can properly crawl and index your storefront. However, actual search rankings depend on content quality, market competition, domain authority, backlinks, and search engine algorithms.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FBF9] text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Breadcrumb Navigation Bar */}
      <div className="bg-white border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center text-xs font-medium text-slate-500 space-x-2">
            <button
              onClick={onBackToHome}
              className="hover:text-emerald-700 transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-600 rounded"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-emerald-800 font-bold" aria-current="page">
              Launch Online Store
            </span>
          </nav>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                          */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-white pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-emerald-100">
        {/* Subtle Decorative Ambient Elements */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Value Proposition & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold tracking-wide">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Turnkey Ecommerce Storefront • Live in Under 30 Minutes</span>
              </div>

              {/* H1 Heading */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.9rem] font-black text-emerald-950 tracking-tight leading-[1.15]">
                Launch Your Website &amp; Online Store in Under 30 Minutes
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Create your branded online storefront with SilarAI. Choose your brand colours, upload your logo and banner,
                configure your SEO content and return policy, and launch your store. Add products through your backend whenever
                you're ready.
              </p>

              {/* Clear Value Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left max-w-xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-[#0D8F81] shrink-0" />
                  <span>Bring your own custom domain</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-[#0D8F81] shrink-0" />
                  <span>Publish storefront first, add SKUs next</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-[#0D8F81] shrink-0" />
                  <span>Configured for B2B or B2C commerce</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-[#0D8F81] shrink-0" />
                  <span>Built-in SEO &amp; return policy fields</span>
                </div>
              </div>

              {/* CTA Group */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start">
                <button
                  onClick={handleLaunchStore}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Launch My Store</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={scrollToWorkflow}
                  className="w-full sm:w-auto px-6 py-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-base transition-colors flex items-center justify-center gap-2 border border-emerald-200 cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-emerald-700" />
                  <span>See How It Works</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 pt-1">
                <span>Direct access via SilarAI portal • No code or template development required</span>
              </div>
            </div>

            {/* Right Column: Branded Storefront Interactive Visual Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border-2 border-emerald-200/80 shadow-xl overflow-hidden">
                {/* Browser Top Bar Mockup */}
                <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  </div>
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1 rounded-md text-[11px] font-mono text-slate-600">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>https://store.yourbrand.com</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase text-emerald-700">Live Preview</div>
                </div>

                {/* Simulated Storefront Header */}
                <div
                  className="px-5 py-3.5 text-white flex items-center justify-between transition-colors duration-300 shadow-xs"
                  style={{ backgroundColor: activeTheme.primary }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center font-black text-xs">
                      {brandName.charAt(0)}
                    </div>
                    <span className="font-extrabold text-sm tracking-tight">{brandName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="hidden sm:inline text-white/90">Catalogue</span>
                    <span className="hidden sm:inline text-white/90">About</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white text-slate-900 shadow-2xs">
                      {storeType === 'b2b' ? 'Dealer Portal' : 'Cart (0)'}
                    </span>
                  </div>
                </div>

                {/* Simulated Store Hero Banner */}
                <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8">
                  <div className="space-y-2 max-w-sm">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-400 text-slate-950">
                      {storeType === 'b2b' ? 'Direct Factory Wholesale' : 'Direct-to-Consumer Collection'}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black leading-snug">
                      {storeType === 'b2b'
                        ? 'Precision Components & Bulk Ordering'
                        : 'Handcrafted Essentials for Everyday Living'}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {storeType === 'b2b'
                        ? 'Tiered pricing, Net-30 credit terms, and instant RFQs.'
                        : 'Complimentary shipping on orders over $50. 30-day returns.'}
                    </p>
                    <div className="pt-2">
                      <button
                        className="text-xs font-bold px-3.5 py-1.5 rounded-md text-white transition-colors shadow-sm"
                        style={{ backgroundColor: activeTheme.primary }}
                      >
                        {storeType === 'b2b' ? 'Request Wholesale Account' : 'Shop New Arrivals'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated Store Status Bar & SEO Preview */}
                <div className="p-4 bg-emerald-50/40 border-t border-emerald-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Storefront Status:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Ready to Publish (30m)
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded border border-emerald-100 space-y-1">
                    <div className="font-semibold text-slate-800 flex items-center justify-between">
                      <span>Search Snippet Preview (SEO)</span>
                      <span className="text-[10px] text-emerald-700 font-medium">Google View</span>
                    </div>
                    <div className="text-blue-700 font-medium truncate">
                      {brandName} — {storeType === 'b2b' ? 'Wholesale Store' : 'Official Online Store'}
                    </div>
                    <div className="text-slate-500 text-[10px] line-clamp-2">
                      Official storefront for {brandName}. Explore our product catalog, brand policies, and contact team.
                    </div>
                  </div>

                  {/* Interactive Palette Switcher with website brand colours */}
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700">Test Brand Palette:</span>
                    <div className="flex items-center gap-1.5">
                      {(['emerald', 'darkteal', 'persimmon', 'forest', 'slate'] as const).map((key) => (
                        <button
                          key={key}
                          onClick={() => setSelectedColorTheme(key)}
                          className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                            selectedColorTheme === key ? 'ring-2 ring-offset-1 ring-emerald-600 scale-110 border-white shadow-sm' : 'opacity-85 border-transparent'
                          }`}
                          style={{ backgroundColor: colorThemes[key].primary }}
                          title={colorThemes[key].name}
                          aria-label={`Select ${colorThemes[key].name} theme`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CORE VALUE BENEFIT: STOREFRONT FIRST, CATALOGUE NEXT                  */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-[#F4F9F6] border-b border-emerald-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Core Architectural Advantage</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 tracking-tight">
              Your Storefront First. Your Product Catalogue Next.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Get your branded storefront ready without waiting for your entire catalogue to be prepared. Configure your store,
              publish it, and then add products through your SilarAI backend as your business is ready.
            </p>
          </div>

          {/* Three Benefit Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-7 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Palette className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-extrabold text-emerald-950">1. Your Brand, Your Store</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Customize colours, logo, and hero banner to establish a clean, professional aesthetic tailored to your brand
                identity. You don't need a designer or developer to create a polished, credible store presence.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Custom primary &amp; accent color pickers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Desktop &amp; mobile responsive hero banner</span>
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-7 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-extrabold text-emerald-950">2. Built for Search Visibility</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Configure your SEO title, meta descriptions, and page content so search engines understand your business identity
                and catalog offerings from day one.
              </p>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/60 text-[11px] text-amber-900">
                <strong>Clarity note:</strong> SEO fields provide search engines with clean metadata but do not guarantee
                automated search rankings or organic web traffic.
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-7 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Rocket className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-extrabold text-emerald-950">3. Launch and Expand</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Publish the storefront to secure your domain and begin sharing your link with partners or buyers, then build out
                your catalogue in the backend as your inventory expands.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Manual or bulk CSV SKU import</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sync from Shopify or WooCommerce when needed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SUPPORT BOTH B2B AND B2C STORES                                        */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-white border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 tracking-tight">
              Engineered for Both B2B and B2C Ecommerce
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Whether you are selling directly to consumers or managing commercial business accounts, SilarAI provides the
              essential store architecture you need to launch.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-12">
            {/* B2C Ecommerce Card */}
            <div className="bg-[#F4F9F6] rounded-3xl p-8 sm:p-10 border border-emerald-200/90 relative flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-emerald-900 text-xs font-extrabold border border-emerald-200 shadow-2xs">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    <span>Direct-to-Consumer &amp; Retail</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700">B2C Model</span>
                </div>

                <h3 className="text-2xl font-black text-emerald-950">B2C Ecommerce Store</h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Tailored for D2C brands, boutique retailers, and businesses selling directly to end consumers. Establish a
                  responsive online storefront designed to deliver high conversion rates, streamlined mobile shopping, and
                  customer engagement.
                </p>

                {/* Features accurately supported in SilarAI */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Supported B2C Features:</span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Branded Product Catalogues</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Shopping Carts &amp; Checkout</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Online Payment Support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>AI Shopping Assistant Discovery</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Return &amp; Refund Policy Display</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Mobile Responsive Store Layout</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8 space-y-3">
                <button
                  onClick={handleLaunchStore}
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Launch B2C Store</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <button
                    onClick={() => onNavigateCommercePlatform && onNavigateCommercePlatform()}
                    className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
                  >
                    Learn more about Commerce Platform →
                  </button>
                </div>
              </div>
            </div>

            {/* B2B Ecommerce Card - Deep Structural Teal & Persimmon Brand Canvas */}
            <div className="bg-gradient-to-br from-[#0e222b] via-[#183a47] to-[#052422] text-white rounded-3xl p-8 sm:p-10 border border-emerald-800/60 relative flex flex-col justify-between shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-extrabold border border-emerald-400/20">
                    <Building2 className="w-4 h-4 text-[#F47A38]" />
                    <span>Wholesale, Distributors &amp; Mfrs</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-200">B2B Model</span>
                </div>

                <h3 className="text-2xl font-black text-white">B2B Ecommerce Store</h3>

                <p className="text-sm text-slate-200 leading-relaxed">
                  Tailored for manufacturers, distributors, wholesalers, and commercial sellers. Establish a digital ordering
                  channel for your business clients to order online with contract terms, tiered quantity discounts, and
                  customer account access.
                </p>

                {/* Features accurately supported in SilarAI */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Supported B2B Features:</span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-200">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Bulk &amp; Case Pack Ordering</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Dealer &amp; Customer Accounts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Customer-Specific Pricing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>RFQ (Request for Quote) Flow</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Custom Commercial Policies</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>ERP Webhook Connectors</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8 space-y-3">
                <button
                  onClick={handleLaunchStore}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#F47A38] hover:bg-[#e45f18] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Launch B2B Store</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
                <div className="text-center">
                  <button
                    onClick={() => onNavigateDistributors && onNavigateDistributors()}
                    className="text-xs text-emerald-300 hover:underline font-semibold cursor-pointer"
                  >
                    Explore Wholesale &amp; Distributor Solutions →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. VISUAL CUSTOMER JOURNEY (STEP-BY-STEP WORKFLOW)                        */}
      {/* ========================================================================= */}
      <section id="eight-step-workflow" className="py-16 sm:py-24 bg-[#F4F9F6] border-b border-emerald-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span>Step-by-Step Setup Guide</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 tracking-tight">
              The Eight-Step Store Launch Process
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Complete each straightforward configuration step in order. From login to publication, launch your branded
              storefront in under 30 minutes.
            </p>

            {/* Visual Workflow Breadcrumb Ribbon */}
            <div className="py-4 overflow-x-auto">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-full border border-emerald-200 shadow-2xs min-w-max">
                <span className="text-emerald-800">1. Login</span>
                <span>→</span>
                <span className="text-[#0D8F81] font-extrabold">2. Brand Colours</span>
                <span>→</span>
                <span className="text-emerald-700">3. Logo</span>
                <span>→</span>
                <span className="text-emerald-700">4. Banner</span>
                <span>→</span>
                <span className="text-emerald-800">5. SEO</span>
                <span>→</span>
                <span className="text-[#0D8F81]">6. Domain</span>
                <span>→</span>
                <span className="text-emerald-800">7. Policies</span>
                <span>→</span>
                <span className="text-[#F47A38] font-extrabold">8. Publish &amp; Add Products</span>
              </div>
            </div>
          </div>

          {/* 8-Step Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-10">
            {launchSteps.map((step) => {
              const IconComp = step.icon;
              return (
                <div
                  key={step.step}
                  className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-2xs">
                        {step.step}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        {step.estTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                        <IconComp className="w-5 h-5 text-emerald-700" />
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{step.title}</h3>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{step.summary}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2">
                      {step.detail}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[10px] text-slate-500 italic leading-normal">{step.dependency}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mid-Page Call to Action */}
          <div className="mt-12 bg-white rounded-2xl p-8 border border-emerald-200 shadow-sm text-center max-w-2xl mx-auto space-y-4">
            <h3 className="text-xl font-bold text-emerald-950">Ready to start your 30-minute launch?</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Open the SilarAI onboarding portal to begin configuring your colors, domain, and policies now.
            </p>
            <div className="pt-2">
              <button
                onClick={handleLaunchStore}
                className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Launch My Store</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE SETUP, DOMAIN & BRAND COLOURS SYSTEM                        */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-white border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Domain & Setup Configuration Simulation */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Custom Domain Requirement</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
                Connect Your Own Domain in Minutes
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                To maintain complete brand authority, you bring your own domain. SilarAI does not require you to use a
                generic subdomain. Connect any domain you own with a single CNAME record.
              </p>

              {/* DNS Helper Card */}
              <div className="bg-emerald-50/40 rounded-xl p-5 border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Required DNS Configuration:</span>
                  <span className="text-emerald-700 flex items-center gap-1 font-mono text-[11px]">
                    <Lock className="w-3 h-3 text-emerald-600" /> Auto SSL Included
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Type</span>
                    <span className="font-bold text-slate-800">CNAME</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Host</span>
                    <span className="font-bold text-slate-800">store</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-sans">Target</span>
                      <span className="font-bold text-emerald-700">cname.silarai.com</span>
                    </div>
                    <button
                      onClick={handleCopyDns}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                      title="Copy DNS Target"
                      aria-label="Copy DNS Target to clipboard"
                    >
                      {copiedDns ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  Works seamlessly with GoDaddy, Namecheap, Cloudflare, Google Domains, Hostinger, and AWS Route 53.
                </div>
              </div>

              {/* Associated Brand Colours Showcase Box */}
              <div className="bg-white rounded-2xl p-5 border border-emerald-200/90 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-emerald-600" />
                    <span>Associated Website Brand Colors</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">Official Platform Palette</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  These verified colors power the SilarAI platform ecosystem. Select any swatch to preview how your storefront header, buttons, and callouts adapt harmoniously:
                </p>

                <div className="space-y-2">
                  {(['emerald', 'darkteal', 'persimmon', 'forest', 'slate'] as const).map((key) => {
                    const t = colorThemes[key];
                    const isSelected = selectedColorTheme === key;
                    return (
                      <div
                        key={key}
                        onClick={() => setSelectedColorTheme(key)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500 shadow-2xs'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-emerald-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg shadow-2xs flex items-center justify-center text-white shrink-0 font-mono text-[10px]"
                            style={{ backgroundColor: t.primary }}
                          >
                            {isSelected ? '✓' : ''}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                              <span>{t.name}</span>
                              <span className="font-mono text-[11px] text-slate-500">{t.hex}</span>
                            </div>
                            <div className="text-[10px] text-slate-500">{t.brandRole}</div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyHex(t.hex);
                          }}
                          className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-600 flex items-center gap-1 cursor-pointer"
                          title="Copy Hex Code"
                        >
                          {copiedHex === t.hex ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Domain Disclaimer Box */}
              <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold">Transparent Domain Notice:</p>
                <p>
                  You must already own or purchase your domain from an accredited registrar. SilarAI does not provide free
                  domain names. DNS propagation depends on your provider and may take from 15 minutes up to 24 hours to
                  propagate worldwide.
                </p>
              </div>
            </div>

            {/* Right: Interactive Configuration Controls */}
            <div className="lg:col-span-6 bg-[#F4F9F6] rounded-3xl p-6 sm:p-8 border border-emerald-200/90 space-y-5">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
                  Interactive Store Customizer
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">Test Storefront Inputs</span>
              </div>

              {/* Store Type Toggle */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">1. Select Store Model:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setStoreType('b2c')}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      storeType === 'b2c'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>B2C Storefront</span>
                  </button>
                  <button
                    onClick={() => setStoreType('b2b')}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      storeType === 'b2b'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>B2B Wholesale Portal</span>
                  </button>
                </div>
              </div>

              {/* Store Name Input */}
              <div className="space-y-2">
                <label htmlFor="brand-name-input" className="text-xs font-bold text-slate-700 block">
                  2. Store Name:
                </label>
                <input
                  id="brand-name-input"
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value || 'My Store')}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  placeholder="e.g. Apex Industrial or Aura Botanicals"
                />
              </div>

              {/* Theme Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">3. Primary Brand Palette:</label>
                  <span className="text-[11px] font-medium text-emerald-700">{activeTheme.name}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['emerald', 'darkteal', 'persimmon', 'forest', 'slate'] as const).map((key) => {
                    const t = colorThemes[key];
                    const isSelected = selectedColorTheme === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedColorTheme(key)}
                        className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/30 shadow-xs'
                            : 'bg-white/80 border-slate-200 hover:border-emerald-200'
                        }`}
                      >
                        <div className="w-full h-4 rounded-md shadow-2xs" style={{ backgroundColor: t.primary }} />
                        <span className="font-bold text-[10px] text-slate-800 truncate">{t.name}</span>
                        <span className="text-[9px] text-slate-500 font-mono truncate">{t.hex}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Palette Details Card */}
              <div className="p-3 bg-white rounded-xl border border-emerald-100 text-xs space-y-1">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Selected: {activeTheme.name}</span>
                  <span className="font-mono text-[11px] text-emerald-700">{activeTheme.hex}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{activeTheme.description}</p>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleLaunchStore}
                  className="w-full py-3.5 rounded-xl font-extrabold text-xs text-white shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  style={{ backgroundColor: activeTheme.primary }}
                >
                  <span>Apply Settings &amp; Launch My Store</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. COMPREHENSIVE FAQ ACCORDION                                            */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-[#F4F9F6] border-b border-emerald-100/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Questions &amp; Practical Clarifications</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Clear, transparent answers about setup times, domain connection, catalogue management, and search visibility.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-emerald-100 shadow-2xs overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 focus:outline-none focus:bg-emerald-50/40 transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="font-extrabold text-sm sm:text-base text-slate-900">{faq.question}</span>
                    <span className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-700" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-emerald-50/20">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. RELEVANT INTERNAL LINKS (DESCRIPTIVE & INDEXABLE)                       */}
      {/* ========================================================================= */}
      <section className="py-14 bg-white border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
            <h3 className="text-lg font-black text-emerald-950">Explore Related SilarAI Platforms &amp; Integrations</h3>
            <p className="text-xs text-slate-500">
              Discover how SilarAI complements your existing tools and ecommerce channels.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <a
              href="/ai-shopping-assistant"
              onClick={(e) => {
                e.preventDefault();
                onNavigateAiShoppingAssistant?.();
              }}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-xs font-bold text-slate-800 flex flex-col items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#F47A38]" />
              <span>AI Shopping Assistant</span>
            </a>
            <a
              href="/commerce-platform"
              onClick={(e) => {
                e.preventDefault();
                onNavigateCommercePlatform?.();
              }}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-xs font-bold text-slate-800 flex flex-col items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#0D8F81]" />
              <span>Commerce Platform</span>
            </a>
            <a
              href="/industries/distributors"
              onClick={(e) => {
                e.preventDefault();
                onNavigateDistributors?.();
              }}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-xs font-bold text-slate-800 flex flex-col items-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-[#245668]" />
              <span>Distributor Solutions</span>
            </a>
            <a
              href="/industries/manufacturing"
              onClick={(e) => {
                e.preventDefault();
                onNavigateManufacturing?.();
              }}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-xs font-bold text-slate-800 flex flex-col items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-[#F47A38]" />
              <span>Manufacturing Portal</span>
            </a>
            <a
              href="/shopify-vs-silarai"
              onClick={(e) => {
                e.preventDefault();
                onNavigateShopifyComparison?.();
              }}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-xs font-bold text-slate-800 flex flex-col items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#0D8F81]" />
              <span>Shopify Integration</span>
            </a>
            <a
              href="/woocommerce-vs-silarai"
              onClick={(e) => {
                e.preventDefault();
                onNavigateWoocommerceComparison?.();
              }}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-xs font-bold text-slate-800 flex flex-col items-center gap-1.5 cursor-pointer"
            >
              <Tag className="w-4 h-4 text-emerald-700" />
              <span>WooCommerce Sync</span>
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FINAL CONVERSION CTA SECTION                                           */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#0e222b] via-[#183a47] to-[#052422] text-white relative overflow-hidden">
        {/* Ambient green & teal light accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold uppercase tracking-wider border border-emerald-400/30">
            <Rocket className="w-4 h-4 text-emerald-400" />
            <span>Launch In Under 30 Minutes</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Launch Your Online Store in Under 30 Minutes
          </h2>

          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Create your branded online storefront with SilarAI. Choose your brand colours, upload your logo and banner,
            configure your SEO content and return policy, and launch your store. Add products through your backend whenever
            you're ready.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleLaunchStore}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#F47A38] hover:bg-[#e45f18] text-white font-black text-base shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch My Store</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={scrollToWorkflow}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-base transition-colors flex items-center justify-center gap-2 border border-emerald-400/30 cursor-pointer"
            >
              <span>See How It Works</span>
            </button>
          </div>

          <div className="pt-2 text-xs text-emerald-200/80">
            <span>Transparent pricing • Connect your own domain • B2B and B2C ready</span>
          </div>
        </div>
      </section>
    </div>
  );
};
