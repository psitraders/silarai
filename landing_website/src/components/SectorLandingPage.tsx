import React, { useState, useEffect } from 'react';
import {
  Store,
  Zap,
  Gem,
  Home,
  Heart,
  Package,
  Palette,
  Sparkles,
  Factory,
  Truck,
  Boxes,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Code2,
  Copy,
  Check,
  MessageCircle,
  ShoppingBag,
  Sliders,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  Bot,
  Layers,
  Search,
  Share2,
  Globe2,
  HelpCircle,
  Filter,
  RefreshCw,
  Sparkle
} from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';

export interface SectorLandingPageProps {
  initialSectorSlug?: string;
  onBackToHome: () => void;
  onBookDemo: (planOrIndustry?: string) => void;
  onNavigateAiShoppingAssistant?: (subPage?: number) => void;
  onNavigateAiCommercePlatform?: (subPage?: number) => void;
  onSelectSector?: (slug: string) => void;
}

import { SectorData, SECTORS } from "../data/sectors";
export type { SectorData };
export { SECTORS };

export const SectorLandingPage: React.FC<SectorLandingPageProps> = ({
  initialSectorSlug = 'boutiques',
  onBackToHome,
  onBookDemo,
  onNavigateAiShoppingAssistant,
  onNavigateAiCommercePlatform,
  onSelectSector,
}) => {
  const [currentSectorKey, setCurrentSectorKey] = useState<string>(initialSectorSlug);
  const [activeTab, setActiveTab] = useState<'overview' | 'fast-launch' | 'assistant-existing' | 'faq'>('overview');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [interactiveQuery, setInteractiveQuery] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'assistant'; text: string; recs?: any[] }>>([]);

  const sector = SECTORS[currentSectorKey] || SECTORS.boutiques;
  const SectorIcon = sector.icon;

  useEffect(() => {
    if (initialSectorSlug && SECTORS[initialSectorSlug]) {
      setCurrentSectorKey(initialSectorSlug);
    }
  }, [initialSectorSlug]);

  useEffect(() => {
    // Reset chat history when sector changes
    if (sector.existingStoreAssistant.simulatedChat.length > 0) {
      const initialChat = sector.existingStoreAssistant.simulatedChat[0];
      setChatHistory([
        { sender: 'user', text: initialChat.userQuery },
        { sender: 'assistant', text: initialChat.aiResponse, recs: initialChat.recommendations },
      ]);
    }

    // Dynamic SEO Metadata sync into document.head for search crawlers & social cards
    const seoTitle = `${sector.name} AI Commerce Platform | Launch B2B2C Store in Hours`;
    document.title = seoTitle;

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setOgMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const desc = `Launch a modern ${sector.name} & B2B2C store in hours. Includes AI Shopping Assistant for existing stores (Shopify, WooCommerce), wholesale pricing matrices, and WhatsApp commerce.`;
    setMeta('description', desc);
    setOgMeta('og:description', desc);
    setMeta('twitter:description', desc);

    const allKeywords = sector.seoKeywords.flatMap((g) => g.keywords);
    if (allKeywords.length > 0) {
      setMeta('keywords', allKeywords.join(', '));
    }
    setOgMeta('og:title', seoTitle);
    setMeta('twitter:title', seoTitle);
  }, [currentSectorKey, sector]);

  const handleSectorSwitch = (slug: string) => {
    setCurrentSectorKey(slug);
    if (onSelectSector) {
      onSelectSector(slug);
    } else {
      window.history.pushState(null, '', `?sector=${slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopySnippet = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2400);
  };

  const handleSendQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interactiveQuery.trim()) return;

    const userText = interactiveQuery;
    setInteractiveQuery('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: userText }]);

    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `Thanks for asking! For ${sector.name}, SilarAI's AI assistant indexes your full catalog specifications, real-time inventory levels, and wholesale/retail rules to resolve "${userText}" in under 200ms without hallucinations. Would you like to deploy this to your storefront today?`,
        },
      ]);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <Breadcrumbs
            items={[
              { label: 'Home', onClick: onBackToHome },
              { label: 'Sectors & Industries', onClick: onBackToHome },
              { label: sector.name, isCurrent: true },
            ]}
          />

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">Switch Sector:</span>
            <select
              value={currentSectorKey}
              onChange={(e) => handleSectorSwitch(e.target.value)}
              className="text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-plum-600 cursor-pointer"
            >
              {Object.values(SECTORS).map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name} ({s.tag})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => onBookDemo(sector.name)}
              className="text-xs font-extrabold px-3 py-1.5 rounded-lg bg-plum-700 hover:bg-plum-800 text-white transition-colors shadow-xs"
            >
              Book 15-Min Demo
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-linear-to-b from-plum-950 via-plum-900 to-plum-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-peach-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          {/* Sector Pill & Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-peach-300 text-plum-950 border border-peach-400 shadow-xs">
              <Sparkle className="w-3.5 h-3.5 fill-current" />
              {sector.badge}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-plum-800/80 text-teal-300 border border-plum-700">
              <Clock className="w-3 h-3" />
              Launch in Hours
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-plum-800/80 text-peach-200 border border-plum-700">
              <Zap className="w-3 h-3" />
              Dual B2B &amp; B2C Ready
            </span>
          </div>

          {/* Main Headline */}
          <div className="max-w-4xl space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {sector.headline}
            </h1>
            <p className="text-base sm:text-lg text-plum-200 font-normal leading-relaxed">
              {sector.subheadline}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onBookDemo(sector.name)}
              className="px-5 py-3 rounded-xl bg-peach-300 hover:bg-peach-400 text-plum-950 font-black text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-peach-300/20 flex items-center gap-2"
            >
              <span>Launch Your {sector.name} Store</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('assistant-existing')}
              className="px-5 py-3 rounded-xl bg-plum-800/80 hover:bg-plum-800 text-white font-bold text-sm border border-plum-700 transition-all flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-teal-300" />
              <span>Embed AI on Existing Store</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('fast-launch')}
              className="px-4 py-3 rounded-xl text-plum-200 hover:text-white font-semibold text-sm hover:underline flex items-center gap-1.5"
            >
              <span>View 4-Hour vs Agency Comparison</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Metric Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-plum-800/60">
            {sector.primaryStats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-plum-900/60 border border-plum-800 rounded-xl p-4 backdrop-blur-xs"
              >
                <div className="text-2xl sm:text-3xl font-black text-peach-300 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-white mt-1">
                  {stat.label}
                </div>
                <div className="text-[11px] text-plum-300 mt-0.5">
                  {stat.helper}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-28 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2.5">
            {[
              { id: 'overview', label: 'Platform & Dual B2B2C', icon: Layers },
              { id: 'fast-launch', label: 'Launch in Hours vs Agency Dev', icon: Clock },
              { id: 'assistant-existing', label: 'AI Assistant for Existing Stores', icon: Bot },
              { id: 'faq', label: 'FAQ & Guarantees', icon: HelpCircle },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-plum-950 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <TabIcon className={`w-4 h-4 ${isActive ? 'text-peach-300' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 flex-1">
        {/* TAB 1: OVERVIEW & DUAL B2B2C CAPABILITIES */}
        {(activeTab === 'overview' || activeTab === 'fast-launch') && (
          <section className="space-y-12">
            {/* Launch in Hours Section Header */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Speed to Market Advantage
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {sector.launchInHoursTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {sector.launchHoursSubtitle}
              </p>
            </div>

            {/* 4-Hour Timeline Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sector.launchTimeline.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-plum-300 transition-all shadow-xs hover:shadow-md flex flex-col justify-between relative group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black text-plum-800 bg-plum-50 px-2.5 py-1 rounded-md border border-plum-200">
                        {step.hour}
                      </span>
                      <span className="w-6 h-6 rounded-full bg-teal-50 text-teal-700 text-xs font-black flex items-center justify-center border border-teal-200">
                        ✓
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      {step.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    {step.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Traditional Agency vs SilarAI Comparison Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Traditional Custom Development vs. SilarAI Turnkey Commerce
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Direct architectural comparison for {sector.name} brands evaluating new digital infrastructure.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onBookDemo(sector.name)}
                  className="px-4 py-2 rounded-lg bg-plum-900 hover:bg-plum-950 text-white font-bold text-xs shrink-0 flex items-center gap-1.5"
                >
                  <span>Start Free Setup</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200">
                      <th className="p-3.5">Dimension</th>
                      <th className="p-3.5 text-rose-700 bg-rose-50/40">Traditional Agency Dev</th>
                      <th className="p-3.5 text-teal-800 bg-teal-50/60 font-black">SilarAI Commerce Platform</th>
                      <th className="p-3.5 text-slate-600">Business Advantage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sector.comparisonRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 align-top">
                          {row.dimension}
                        </td>
                        <td className="p-3.5 text-slate-600 align-top bg-rose-50/20">
                          <div className="flex items-start gap-1.5">
                            <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <span>{row.traditional}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-900 font-semibold align-top bg-teal-50/40">
                          <div className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5 font-bold" />
                            <span className="font-bold text-teal-950">{row.silarAi}</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-plum-700 align-top">
                          <span className="inline-block px-2 py-0.5 rounded bg-plum-50 border border-plum-200 text-[10px]">
                            {row.advantage}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dual B2B2C Architecture Features */}
            <div className="space-y-6">
              <div className="max-w-2xl">
                <span className="text-xs font-black uppercase tracking-widest text-plum-700">
                  Dual-Engine Architecture
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                  Built-In B2B2C Capabilities for {sector.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Unify your retail consumer storefront and wholesale business accounts without running separate websites.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {sector.b2b2cCapabilities.map((cap, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-xl border border-slate-200 hover:border-peach-300 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-peach-800 bg-peach-50 px-2 py-0.5 rounded border border-peach-200">
                        {cap.tag}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {cap.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {cap.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: AI ASSISTANT FOR EXISTING STORES */}
        {(activeTab === 'overview' || activeTab === 'assistant-existing') && (
          <section className="bg-plum-950 text-white rounded-3xl p-6 sm:p-10 border border-plum-900 relative overflow-hidden space-y-10 shadow-xl">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-start justify-between gap-8 relative z-10">
              <div className="max-w-2xl space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-teal-400 text-plum-950 shadow-xs">
                  <Bot className="w-3.5 h-3.5 fill-current" />
                  {sector.existingStoreAssistant.badge}
                </span>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  {sector.existingStoreAssistant.title}
                </h2>

                <p className="text-sm text-plum-200 leading-relaxed">
                  {sector.existingStoreAssistant.description}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-teal-300">
                  <span className="flex items-center gap-1">✓ Shopify Ready</span>
                  <span className="flex items-center gap-1">✓ WooCommerce Ready</span>
                  <span className="flex items-center gap-1">✓ Magento &amp; Custom React</span>
                  <span className="flex items-center gap-1">✓ Sub-50ms Response</span>
                </div>
              </div>

              {/* 1-Line Embed Code Card */}
              <div className="w-full lg:w-96 bg-plum-900/90 rounded-2xl p-5 border border-plum-800 space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-peach-300 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    1-Line Drop-In Snippet
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopySnippet(sector.existingStoreAssistant.embedCode)}
                    className="text-xs font-bold text-plum-200 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-plum-800 hover:bg-plum-700 transition-colors"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <pre className="text-[11px] font-mono bg-plum-950 text-teal-200 p-3 rounded-lg overflow-x-auto border border-plum-800/80 leading-relaxed">
                  <code>{sector.existingStoreAssistant.embedCode}</code>
                </pre>

                <p className="text-[11px] text-plum-300">
                  Paste before the closing <code className="text-peach-200">&lt;/head&gt;</code> tag of any storefront. Starts syncing your catalog automatically.
                </p>
              </div>
            </div>

            {/* Key Benefits 4-Column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
              {sector.existingStoreAssistant.keyBenefits.map((b, idx) => {
                const BenefitIcon = b.icon;
                return (
                  <div
                    key={idx}
                    className="bg-plum-900/60 border border-plum-800/80 rounded-xl p-4 space-y-2 hover:border-teal-400/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
                      <BenefitIcon className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white">{b.title}</h4>
                    <p className="text-xs text-plum-200/90 leading-relaxed">{b.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Interactive Live Assistant Simulator */}
            <div className="bg-plum-900/80 rounded-2xl border border-plum-800 p-5 space-y-4 relative z-10">
              <div className="flex items-center justify-between border-b border-plum-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">
                    Live Demo: {sector.name} AI Shopping Assistant
                  </span>
                </div>
                <span className="text-[11px] text-plum-300 font-mono">Catalog: 100% Vector Indexed</span>
              </div>

              {/* Chat Thread */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-xl rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-peach-300 text-plum-950 font-semibold rounded-br-none'
                          : 'bg-plum-800 text-plum-100 rounded-bl-none border border-plum-700'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {msg.recs && msg.recs.length > 0 && (
                      <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-xl">
                        {msg.recs.map((rec: any, rIdx: number) => (
                          <div
                            key={rIdx}
                            className="bg-plum-950 p-2.5 rounded-xl border border-plum-700 text-center space-y-1"
                          >
                            <div className="text-2xl">{rec.imageEmoji || '✨'}</div>
                            <div className="text-xs font-bold text-white line-clamp-1">{rec.name}</div>
                            <div className="text-xs font-extrabold text-peach-300">{rec.price}</div>
                            <span className="inline-block text-[9px] font-bold text-teal-300 bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-800">
                              {rec.tag}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendQuery} className="flex gap-2 pt-2 border-t border-plum-800">
                <input
                  type="text"
                  value={interactiveQuery}
                  onChange={(e) => setInteractiveQuery(e.target.value)}
                  placeholder={`Ask a question (e.g. sizing, fit, wholesale MOQ, or product advice)...`}
                  className="flex-1 text-xs sm:text-sm bg-plum-950 text-white placeholder-plum-400 border border-plum-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-plum-950 font-extrabold text-xs transition-colors shrink-0"
                >
                  Ask AI
                </button>
              </form>
            </div>
          </section>
        )}

        {/* Machine Knowledge Graph, Structured Schema & Semantic Citation Layer */}
        {/* Kept in the backend of the website, invisible to visitors for pristine UX */}
        {/* Preserved 100% in DOM and JSON-LD schema for Googlebot, Bingbot, LLMs & AI web agents */}
        <section
          id="sector-seo-knowledge-graph"
          aria-label={`${sector.name} SEO Keywords, Entity Citations & Machine Knowledge Graph`}
          className="sr-only"
        >
          <h2>{sector.name} AI Commerce Platform - SEO Keywords, Citations &amp; Semantic Knowledge Graph</h2>
          <p>
            Launch a modern {sector.name} &amp; B2B2C store in hours. Includes AI Shopping Assistant for existing stores (Shopify, WooCommerce), wholesale pricing matrices, and WhatsApp commerce.
          </p>

          {/* Machine-Crawlable Keywords by Commercial & Transactional Intent */}
          <div>
            <h3>Target Search Keyword Clusters</h3>
            {sector.seoKeywords.map((group, idx) => (
              <div key={idx}>
                <h4>{group.group} ({group.intent}) - Est. {group.monthlySearches}</h4>
                <ul>
                  {group.keywords.map((kw, kIdx) => (
                    <li key={kIdx}>{kw}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Semantic External Citations & Inter-Site Graph for Search Engines */}
          <div>
            <h3>Topical Authority &amp; Citation Backlinks</h3>
            <ul>
              {sector.backlinks.map((link, idx) => (
                <li key={idx}>
                  <a href={link.url} rel="nofollow">
                    <span>{link.anchorText}</span> ({link.type}) - {link.targetContext}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Embedded Schema.org JSON-LD Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: `${sector.name} AI Commerce Platform | Launch B2B2C Store in Hours`,
                headline: sector.launchInHoursTitle,
                description: `Launch a modern ${sector.name} & B2B2C store in hours. Includes AI Shopping Assistant for existing stores (Shopify, WooCommerce), wholesale pricing matrices, and WhatsApp commerce.`,
                url: `https://silarai.com/sector/${sector.slug}`,
                keywords: sector.seoKeywords.flatMap((g) => g.keywords).join(', '),
                mainEntity: {
                  '@type': 'SoftwareApplication',
                  name: `SilarAI for ${sector.name}`,
                  applicationCategory: 'BusinessApplication',
                  operatingSystem: 'Web, iOS, Android',
                  offers: {
                    '@type': 'Offer',
                    price: '25.00',
                    priceCurrency: 'USD',
                  },
                },
                citation: sector.backlinks.map((l) => ({
                  '@type': 'CreativeWork',
                  name: l.anchorText,
                  url: l.url,
                })),
              }),
            }}
          />
        </section>

        {/* TAB 4: FREQUENTLY ASKED QUESTIONS */}
        {(activeTab === 'overview' || activeTab === 'faq') && (
          <section className="space-y-6">
            <div className="max-w-3xl space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-teal-700">
                Frequently Asked Questions
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Everything You Need to Know About {sector.name} AI Commerce
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sector.faqList.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2"
                >
                  <h3 className="text-sm font-bold text-slate-900 flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-plum-700 shrink-0 mt-0.5" />
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed pl-6">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sector Selector Pill Grid (Explore Other 10 Sectors) */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Explore All 11 Seller Sectors
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every sector includes turnkey catalog sync, AI shopping assistance, and dual B2B2C rules.
              </p>
            </div>
            <span className="text-xs font-bold text-plum-700 bg-plum-50 px-2.5 py-1 rounded-md border border-plum-200">
              Click Any Sector Below
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {Object.values(SECTORS).map((s) => {
              const SIcon = s.icon;
              const isSelected = s.slug === currentSectorKey;
              return (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => handleSectorSwitch(s.slug)}
                  className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-plum-950 text-white border-plum-950 shadow-md ring-2 ring-peach-300'
                      : 'bg-slate-50 hover:bg-white text-slate-800 border-slate-200 hover:border-plum-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <SIcon className={`w-4 h-4 ${isSelected ? 'text-peach-300' : 'text-plum-700'}`} />
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-teal-300' : 'text-slate-400'}`}>
                      {s.tag}
                    </span>
                  </div>
                  <span className="text-xs font-bold line-clamp-1 mt-1">{s.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="bg-linear-to-r from-plum-950 via-plum-900 to-plum-950 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-peach-300 bg-plum-800 px-3 py-1 rounded-full border border-plum-700">
              Zero Upfront Agency Fees • Cancel Anytime
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Ready to Launch Your {sector.name} Store Today?
            </h2>
            <p className="text-sm text-plum-200">
              Go live in 2 to 4 hours with our turnkey B2B2C platform, or embed the AI Shopping Assistant on your current Shopify or WooCommerce store in 1 line of code.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 relative z-10 pt-2">
            <button
              type="button"
              onClick={() => onBookDemo(sector.name)}
              className="px-6 py-3.5 rounded-xl bg-peach-300 hover:bg-peach-400 text-plum-950 font-black text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-peach-300/20 flex items-center gap-2"
            >
              <span>Schedule 15-Minute Live Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onBackToHome}
              className="px-5 py-3.5 rounded-xl bg-plum-800/80 hover:bg-plum-800 text-white font-bold text-sm border border-plum-700 transition-all"
            >
              Back to Homepage
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
