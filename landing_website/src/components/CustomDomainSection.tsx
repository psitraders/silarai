import React, { useState } from 'react';
import {
  Globe,
  Lock,
  Zap,
  Briefcase,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';

interface CustomDomainSectionProps {
  onBookDemo?: (plan?: string) => void;
}

export const CustomDomainSection: React.FC<CustomDomainSectionProps> = ({ onBookDemo }) => {
  const [domainInput, setDomainInput] = useState('yourbrand');
  const [copied, setCopied] = useState(false);

  const domainBenefits = [
    {
      icon: Globe,
      title: 'Use any domain you already own',
      subtitle: 'GoDaddy, Namecheap, Google Domains, Cloudflare, Hostinger & more',
    },
    {
      icon: Lock,
      title: 'Free SSL certificate included',
      subtitle: 'Your store is always encrypted with https:// and green padlock verification',
    },
    {
      icon: Zap,
      title: 'Goes live in minutes with a simple CNAME record',
      subtitle: 'Paste one simple DNS record and your store connects automatically',
    },
    {
      icon: Briefcase,
      title: 'Customers trust your brand domain more',
      subtitle: 'Higher buyer confidence, direct brand equity, and higher conversion rates',
    },
    {
      icon: Smartphone,
      title: 'Works perfectly on mobile & social shares',
      subtitle: 'Clean branded preview cards on WhatsApp shares, Instagram bios & social links',
    },
  ];

  const domainProviders = [
    'GoDaddy',
    'Namecheap',
    'Google Domains',
    'Cloudflare',
    'Hostinger',
    'Bluehost',
  ];

  const handleCopyDns = () => {
    navigator.clipboard?.writeText('cname.silarai.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanDomain = domainInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '') || 'yourbrand';

  return (
    <section
      id="custom-domain"
      className="py-16 sm:py-24 bg-plum-950 text-white relative overflow-hidden"
    >
      {/* Background Decorative Mesh & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_10%,#183a47_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-peach-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Headlines & High-Impact Benefits */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Tag / Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-peach-300/15 border border-peach-300/30 text-peach-300 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-xs">
              <Globe className="w-4 h-4 text-peach-300" />
              <span>Your brand, your domain</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Sell on your own domain.{' '}
              <span className="text-peach-300 block sm:inline">Not someone else&rsquo;s.</span>
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-plum-100/90 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
              Connect your existing domain — like <span className="text-peach-200 font-semibold font-mono">www.yourbrand.com</span> — to your Silarai store. Customers see your brand, not ours. SSL included, zero technical setup required.
            </p>

            {/* Feature Checklist */}
            <div className="space-y-3.5 pt-2 text-left">
              {domainBenefits.map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-plum-900/40 hover:bg-plum-900/70 border border-plum-800/60 hover:border-peach-300/40 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-xl bg-plum-800/90 border border-plum-700/80 flex items-center justify-center shrink-0 text-peach-300 mt-0.5">
                      <ItemIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <span>{item.title}</span>
                      </h3>
                      <p className="text-xs sm:text-[13px] text-plum-200 font-normal mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Primary Action Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => onBookDemo?.('Get Your Own Domain Store')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-base font-bold text-plum-950 bg-coral-400 hover:bg-coral-500 active:bg-coral-600 rounded-xl shadow-lg shadow-coral-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Get your own domain store</span>
                <ArrowRight className="w-4 h-4 text-plum-950" />
              </button>

              <span className="text-xs text-plum-300 font-medium">
                Free SSL included • Zero coding required
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Domain Visualizer & Live Preview */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-gradient-to-b from-plum-900/80 via-plum-950 to-plum-950 border border-plum-700/70 p-6 sm:p-7 shadow-2xl shadow-plum-950/90 backdrop-blur-xl">
              {/* Browser Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-plum-800/70 mb-5">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-teal-300 font-semibold bg-plum-900/90 px-2.5 py-1 rounded-lg border border-plum-700/70">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SSL Encrypted</span>
                </div>
              </div>

              {/* Interactive Domain Simulator Input */}
              <div className="space-y-3 mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-plum-300">
                  Try Your Brand Name:
                </label>
                <div className="flex items-center rounded-xl bg-plum-950 border border-plum-700 focus-within:border-peach-300 px-3.5 py-2.5 shadow-inner">
                  <span className="text-xs sm:text-sm font-mono text-plum-400 shrink-0">https://www.</span>
                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="yourbrand"
                    aria-label="Preview your brand domain"
                    className="w-full bg-transparent text-xs sm:text-sm font-bold font-mono text-peach-300 focus:outline-hidden px-1"
                  />
                  <span className="text-xs sm:text-sm font-mono text-plum-400 shrink-0">.com</span>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="rounded-2xl bg-plum-900/50 border border-plum-700/60 p-4 mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-plum-300 uppercase tracking-wide">
                    Live Address Bar Preview
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
                    <Lock className="w-3 h-3" />
                    HTTPS Active
                  </span>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-plum-950 border border-plum-800 text-xs font-mono text-white break-all">
                  <Lock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="text-plum-400">https://www.</span>
                  <span className="text-peach-300 font-bold">{cleanDomain}</span>
                  <span className="text-plum-400">.com</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                  <div className="p-2 rounded-lg bg-plum-950/60 border border-plum-800/80">
                    <span className="text-plum-400 block text-[10px]">DNS Routing</span>
                    <span className="font-bold text-teal-300">Instant CNAME</span>
                  </div>
                  <div className="p-2 rounded-lg bg-plum-950/60 border border-plum-800/80">
                    <span className="text-plum-400 block text-[10px]">Brand Attribution</span>
                    <span className="font-bold text-peach-300">100% Whitelabel</span>
                  </div>
                </div>
              </div>

              {/* 1-Step Setup DNS Snippet */}
              <div className="p-3.5 rounded-xl bg-plum-950/90 border border-plum-800 space-y-2 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-plum-200">Easy 1-Click DNS Setup</span>
                  <button
                    onClick={handleCopyDns}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-peach-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-teal-300" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied!' : 'Copy CNAME'}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs font-mono bg-plum-900/60 px-3 py-2 rounded-lg text-plum-200">
                  <span className="text-plum-400">Host: www</span>
                  <span className="text-peach-200 font-bold">cname.silarai.com</span>
                </div>
              </div>

              {/* Compatible Registrars */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-plum-400 uppercase tracking-wider block text-center">
                  Works with all major domain registrars:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {domainProviders.map((provider, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-plum-900/70 text-plum-200 border border-plum-800 shadow-2xs"
                    >
                      {provider}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
