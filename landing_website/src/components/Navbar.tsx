import React, { useState, useEffect } from 'react';
import { Bot, ChevronDown, Menu, X, ArrowRight, Sparkles, Building2, ShoppingBag, ShieldCheck, UserPlus, TrendingUp, Heart, Compass, Briefcase, Palette, LogIn, BookOpen } from 'lucide-react';
import { SilarAiBrandLogo } from './SilarAiBrandLogo';

interface NavbarProps {
  onBookDemo: () => void;
  onWatchTour?: () => void;
  onLogin?: () => void;
  onSelectIndustry?: (industryId: string) => void;
  onSelectUseCase?: (slug: string) => void;
  onNavigateAbout?: () => void;
  onNavigateWhyChooseUs?: () => void;
  onNavigateShopifyComparison?: () => void;
  onNavigateWoocommerceComparison?: () => void;
  onSelectAiShoppingPage?: (pageId: 1 | 2 | 3) => void;
  onSelectAiCommercePage?: (pageId: 1 | 2 | 3) => void;
  onSelectD2cPage?: (sectionId?: string) => void;
  onSelectManufacturingPage?: (pageId?: number) => void;
  onOpenAiDiscoveryModal?: () => void;
  onGoHome?: () => void;
  customLogoImg?: string;
  onOpenLogoModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onBookDemo,
  onWatchTour,
  onLogin,
  onSelectIndustry,
  onSelectUseCase,
  onNavigateAbout,
  onNavigateWhyChooseUs,
  onNavigateShopifyComparison,
  onNavigateWoocommerceComparison,
  onSelectAiShoppingPage,
  onSelectAiCommercePage,
  onSelectD2cPage,
  onSelectManufacturingPage,
  onOpenAiDiscoveryModal,
  onGoHome,
  customLogoImg,
  onOpenLogoModal
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickNavOpen, setQuickNavOpen] = useState(false);

  const handleLoginClick = () => {
    if (onLogin) {
      onLogin();
    } else {
      window.location.href = 'https://app.silarai.com/login';
    }
  };
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);
  const [industriesDropdownOpen, setIndustriesDropdownOpen] = useState(false);
  const [useCasesDropdownOpen, setUseCasesDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setQuickNavOpen(false);
    setMobileMenuOpen(false);
    setPlatformDropdownOpen(false);
    setIndustriesDropdownOpen(false);
    setUseCasesDropdownOpen(false);
    if (onGoHome) {
      onGoHome();
    }
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm py-3'
          : 'bg-plum-950/85 backdrop-blur-md border-b border-plum-900/70 shadow-lg py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo & 3-line SVG Quick Navigation */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            <button
              onClick={() => {
                if (onGoHome) {
                  onGoHome();
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex items-center group focus:outline-none text-left cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
              aria-label="SilarAI Home"
            >
              <SilarAiBrandLogo
                customLogoImg={customLogoImg}
                isScrolled={isScrolled}
                showTagline={true}
              />
            </button>

            {/* 3-line SVG menu icon next to logo */}
            <button
              onClick={() => setQuickNavOpen(!quickNavOpen)}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
                isScrolled
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300/80 hover:border-plum-300'
                  : 'bg-plum-900/90 hover:bg-plum-800 text-plum-100 border-plum-800 hover:border-peach-300/60'
              } ${
                quickNavOpen ? 'ring-2 ring-peach-300 text-peach-300 bg-plum-900' : ''
              }`}
              aria-label="Toggle site map navigation menu"
              title="Quick Site Navigation — Browse All Footer Sections"
            >
              <svg
                className="w-5 h-5 transition-transform duration-200"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {/* Platform Dropdown */}
            <div className="relative group" onMouseLeave={() => setPlatformDropdownOpen(false)}>
              <button
                onClick={() => setPlatformDropdownOpen(!platformDropdownOpen)}
                onMouseEnter={() => setPlatformDropdownOpen(true)}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isScrolled
                    ? 'text-slate-700 hover:text-plum-700 hover:bg-plum-50'
                    : 'text-plum-100 hover:text-teal-300 hover:bg-plum-900/60'
                }`}
              >
                Platform
                <ChevronDown className={`w-4 h-4 transition-transform ${
                  platformDropdownOpen ? 'rotate-180 text-teal-300' : isScrolled ? 'text-slate-400' : 'text-plum-300'
                }`} />
              </button>

              {platformDropdownOpen && (
                <div className="absolute top-full left-0 w-80 mt-1 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => {
                      scrollToSection('products');
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-plum-50 transition-colors flex items-start gap-3 group/item"
                  >
                    <div className="p-2 rounded-lg bg-plum-100 text-plum-700 group-hover/item:bg-plum-700 group-hover/item:text-peach-300 transition-colors">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 group-hover/item:text-plum-700">
                        AI Shopping Assistant
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Conversational guidance &amp; FAQ automation
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      scrollToSection('products');
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-plum-50 transition-colors flex items-start gap-3 group/item"
                  >
                    <div className="p-2 rounded-lg bg-peach-100 text-plum-800 group-hover/item:bg-plum-700 group-hover/item:text-peach-300 transition-colors">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 group-hover/item:text-plum-700">
                        AI Commerce &amp; Marketing Platform
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Ecommerce store, AI Shopping &amp; Meta marketing
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                scrollToSection('products');
              }}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                isScrolled
                  ? 'text-slate-700 hover:text-plum-700 hover:bg-plum-50'
                  : 'text-plum-100 hover:text-teal-300 hover:bg-plum-900/60'
              }`}
            >
              AI Shopping Assistant
            </button>

            <button
              onClick={() => {
                scrollToSection('products');
              }}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                isScrolled
                  ? 'text-slate-700 hover:text-plum-700 hover:bg-plum-50'
                  : 'text-plum-100 hover:text-teal-300 hover:bg-plum-900/60'
              }`}
            >
              AI Commerce &amp; Marketing Platform
            </button>

            <button
              onClick={() => {
                if (onNavigateWhyChooseUs) {
                  onNavigateWhyChooseUs();
                } else {
                  scrollToSection('why-choose-us');
                }
              }}
              style={{
                marginLeft: '-5px'
              }}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                isScrolled
                  ? 'text-slate-700 hover:text-plum-700 hover:bg-plum-50'
                  : 'text-plum-100 hover:text-teal-300 hover:bg-plum-900/60'
              }`}
            >
              Why Choose SilarAI
            </button>

            <button
              onClick={() => {
                scrollToSection('roi-calculator-container');
              }}
              style={{
                textAlign: 'center',
                lineHeight: '14px',
                fontSize: '13px',
                borderRadius: '7px',
                width: '119.271px',
                height: '43.3229px',
                marginTop: '-9px',
                marginBottom: '-1px',
                marginRight: '-8px',
                marginLeft: '-14px'
              }}
              className={`font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                isScrolled
                  ? 'text-plum-950 bg-peach-100/80 hover:bg-peach-200'
                  : 'text-peach-300 hover:text-white bg-plum-900/80 hover:bg-plum-800 border border-plum-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-peach-300 shrink-0" />
              <span>ROI Calculator</span>
            </button>
          </nav>

          {/* Right Action CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={handleLoginClick}
              className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors cursor-pointer ${
                isScrolled
                  ? 'text-slate-700 hover:text-plum-700 hover:bg-plum-50 border border-slate-200/80'
                  : 'text-white hover:bg-plum-900 border border-teal-300/40'
              }`}
            >
              Login
            </button>

            <button
              onClick={onBookDemo}
              style={{
                paddingLeft: '14px',
                marginLeft: '-7px'
              }}
              className={`inline-flex items-center justify-center gap-2 pr-5 py-2.5 text-sm font-bold rounded-xl transition-all transform active:scale-95 shadow-md ${
                isScrolled
                  ? 'bg-plum-700 hover:bg-plum-800 text-white shadow-plum-900/15'
                  : 'bg-coral-400 hover:bg-coral-500 text-plum-950 shadow-coral-500/20'
              }`}
            >
              Book Demo
              <ArrowRight className={`w-4 h-4 ${isScrolled ? 'text-peach-300' : 'text-plum-950'}`} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onBookDemo}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm ${
                isScrolled ? 'bg-plum-700 text-white' : 'bg-coral-400 text-plum-950'
              }`}
            >
              Demo
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl transition-colors ${
                isScrolled ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-white hover:bg-plum-900'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg px-4 pt-4 pb-6 mt-3 space-y-3 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            <button
              onClick={() => {
                scrollToSection('products');
              }}
              className="w-full text-left px-3 py-2.5 text-base font-semibold text-slate-900 hover:bg-plum-50 rounded-xl"
            >
              AI Shopping Assistant
            </button>
            <button
              onClick={() => {
                scrollToSection('products');
              }}
              className="w-full text-left px-3 py-2.5 text-base font-semibold text-slate-900 hover:bg-plum-50 rounded-xl"
            >
              AI Commerce &amp; Marketing Platform
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onNavigateWhyChooseUs) {
                  onNavigateWhyChooseUs();
                } else {
                  scrollToSection('why-choose-us');
                }
              }}
              className="w-full text-left px-3 py-2.5 text-base font-semibold text-slate-900 hover:bg-plum-50 rounded-xl"
            >
              Why Choose SilarAI
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="w-full text-left px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              FAQ
            </button>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLoginClick();
              }}
              className="w-full py-2.5 text-sm font-extrabold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Login</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onBookDemo();
              }}
              className="w-full py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              Book Demo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3-Line SVG Quick Navigation Site Map Overlay */}
      {quickNavOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-plum-950/70 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={() => setQuickNavOpen(false)}
          />

          {/* Directory Drawer Modal */}
          <div className="absolute top-full left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-3 pb-8 animate-in slide-in-from-top-3 duration-200">
            <div className="max-w-7xl mx-auto bg-plum-950 text-white rounded-3xl border border-plum-800 shadow-2xl p-6 sm:p-8 space-y-6">
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-plum-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-peach-300 text-plum-950">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <span>SilarAI Quick Site Directory</span>
                      <span className="text-[10px] font-extrabold text-peach-300 bg-plum-900 border border-plum-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Full Site Navigation
                      </span>
                    </h3>
                    <p className="text-xs text-plum-300">
                      Click any heading or page link below to jump directly to that section or page
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setQuickNavOpen(false)}
                  className="p-2 rounded-xl bg-plum-900 hover:bg-plum-800 text-plum-200 hover:text-white transition-colors cursor-pointer border border-plum-800"
                  aria-label="Close navigation map"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 4 Column Directory Layout Mapping All Key Footer Headings */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
                {/* 1. Products & Platform */}
                <div className="flex flex-col justify-between bg-plum-900/50 hover:bg-plum-900/70 p-4 rounded-2xl border border-plum-800/80 transition-colors shadow-sm">
                  <div>
                    <div className="flex items-center justify-between border-b border-plum-800/80 pb-2.5 mb-3">
                      <h4 className="font-black uppercase tracking-wider text-peach-300 flex items-center gap-2 text-xs">
                        <div className="w-6 h-6 rounded-lg bg-plum-800/90 text-peach-300 flex items-center justify-center border border-plum-700/60">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <span>Products</span>
                      </h4>
                      <span className="text-[10px] font-bold text-plum-300 bg-plum-950/80 px-2 py-0.5 rounded-full border border-plum-800">
                        Platform
                      </span>
                    </div>

                    <ul className="space-y-1 text-plum-200">
                      <li>
                        <button
                          onClick={() => {
                            setQuickNavOpen(false);
                            if (onSelectAiShoppingPage) onSelectAiShoppingPage(1);
                            else scrollToSection('products');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-plum-200 hover:text-white hover:bg-plum-800/70 transition-all flex items-center justify-between group cursor-pointer border border-transparent hover:border-plum-700/50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-peach-400/80 group-hover:bg-peach-300 group-hover:scale-125 transition-all shrink-0"></span>
                            <span className="text-xs font-medium group-hover:font-semibold group-hover:text-peach-200 transition-colors truncate">
                              AI Shopping Assistant
                            </span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-peach-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            setQuickNavOpen(false);
                            if (onSelectAiCommercePage) onSelectAiCommercePage(1);
                            else scrollToSection('products');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-plum-200 hover:text-white hover:bg-plum-800/70 transition-all flex items-center justify-between group cursor-pointer border border-transparent hover:border-plum-700/50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-peach-400/80 group-hover:bg-peach-300 group-hover:scale-125 transition-all shrink-0"></span>
                            <span className="text-xs font-medium group-hover:font-semibold group-hover:text-peach-200 transition-colors truncate">
                              AI Commerce Platform
                            </span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-peach-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-3 mt-3 border-t border-plum-800/70">
                    <button
                      onClick={() => scrollToSection('pricing')}
                      className="w-full py-2 px-3 rounded-xl bg-plum-800/80 hover:bg-plum-700 text-peach-300 font-bold text-xs transition-colors flex items-center justify-between group cursor-pointer border border-plum-700/60"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-peach-300" />
                        <span>Pricing (From $10/mo)</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* 2. Solutions / Industries (Selected Element) */}
                <div className="flex flex-col justify-between bg-plum-900/50 hover:bg-plum-900/70 p-4 rounded-2xl border border-plum-800/80 transition-colors shadow-sm">
                  <div>
                    <div className="flex items-center justify-between border-b border-plum-800/80 pb-2.5 mb-3">
                      <h4 className="font-black uppercase tracking-wider text-peach-300 flex items-center gap-2 text-xs">
                        <div className="w-6 h-6 rounded-lg bg-plum-800/90 text-peach-300 flex items-center justify-center border border-plum-700/60">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <span>Solutions</span>
                      </h4>
                      <span className="text-[10px] font-bold text-plum-300 bg-plum-950/80 px-2 py-0.5 rounded-full border border-plum-800">
                        Industries
                      </span>
                    </div>

                    <ul className="space-y-1 text-plum-200">
                      <li>
                        <button
                          onClick={() => {
                            setQuickNavOpen(false);
                            if (onSelectIndustry) onSelectIndustry('fmcg');
                            else scrollToSection('industries');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-plum-200 hover:text-white hover:bg-plum-800/70 transition-all flex items-center justify-between group cursor-pointer border border-transparent hover:border-plum-700/50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-peach-400/80 group-hover:bg-peach-300 group-hover:scale-125 transition-all shrink-0"></span>
                            <span className="text-xs font-medium group-hover:font-semibold group-hover:text-peach-200 transition-colors truncate">
                              FMCG &amp; Packaged Goods
                            </span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-peach-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      </li>

                      <li>
                        <button
                          onClick={() => {
                            setQuickNavOpen(false);
                            if (onSelectD2cPage) onSelectD2cPage();
                            else if (onSelectIndustry) onSelectIndustry('d2c-brands');
                            else scrollToSection('industries');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-plum-200 hover:text-white hover:bg-plum-800/70 transition-all flex items-center justify-between group cursor-pointer border border-transparent hover:border-plum-700/50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-peach-400/80 group-hover:bg-peach-300 group-hover:scale-125 transition-all shrink-0"></span>
                            <span className="text-xs font-medium group-hover:font-semibold group-hover:text-peach-200 transition-colors truncate">
                              D2C Consumer Brands Suite
                            </span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-peach-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      </li>

                      <li>
                        <button
                          onClick={() => {
                            setQuickNavOpen(false);
                            if (onSelectManufacturingPage) onSelectManufacturingPage(1);
                            else if (onSelectIndustry) onSelectIndustry('manufacturers');
                            else scrollToSection('industries');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-plum-200 hover:text-white hover:bg-plum-800/70 transition-all flex items-center justify-between group cursor-pointer border border-transparent hover:border-plum-700/50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-peach-400/80 group-hover:bg-peach-300 group-hover:scale-125 transition-all shrink-0"></span>
                            <span className="text-xs font-medium group-hover:font-semibold group-hover:text-peach-200 transition-colors truncate">
                              Manufacturing &amp; Industrial
                            </span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-peach-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      </li>

                      <li>
                        <button
                          onClick={() => {
                            setQuickNavOpen(false);
                            if (onSelectIndustry) onSelectIndustry('wholesalers');
                            else scrollToSection('industries');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-plum-200 hover:text-white hover:bg-plum-800/70 transition-all flex items-center justify-between group cursor-pointer border border-transparent hover:border-plum-700/50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-peach-400/80 group-hover:bg-peach-300 group-hover:scale-125 transition-all shrink-0"></span>
                            <span className="text-xs font-medium group-hover:font-semibold group-hover:text-peach-200 transition-colors truncate">
                              Wholesalers &amp; B2B Trade
                            </span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-peach-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      </li>

                      <li>
                        <button
                          onClick={() => {
                            setQuickNavOpen(false);
                            if (onSelectIndustry) onSelectIndustry('distributors');
                            else scrollToSection('industries');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-plum-200 hover:text-white hover:bg-plum-800/70 transition-all flex items-center justify-between group cursor-pointer border border-transparent hover:border-plum-700/50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-peach-400/80 group-hover:bg-peach-300 group-hover:scale-125 transition-all shrink-0"></span>
                            <span className="text-xs font-medium group-hover:font-semibold group-hover:text-peach-200 transition-colors truncate">
                              Distributors
                            </span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-peach-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      </li>

                      <li>
                        <button
                          onClick={() => {
                            setQuickNavOpen(false);
                            if (onSelectIndustry) onSelectIndustry('retailers');
                            else scrollToSection('industries');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-plum-200 hover:text-white hover:bg-plum-800/70 transition-all flex items-center justify-between group cursor-pointer border border-transparent hover:border-plum-700/50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-peach-400/80 group-hover:bg-peach-300 group-hover:scale-125 transition-all shrink-0"></span>
                            <span className="text-xs font-medium group-hover:font-semibold group-hover:text-peach-200 transition-colors truncate">
                              Retail
                            </span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-peach-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-3 mt-3 border-t border-plum-800/70">
                    <button
                      onClick={() => scrollToSection('industries')}
                      className="w-full py-2 px-3 rounded-xl bg-plum-800/80 hover:bg-plum-700 text-peach-300 font-bold text-xs transition-colors flex items-center justify-between group cursor-pointer border border-plum-700/60"
                    >
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-peach-300" />
                        <span>Explore All 6 Industries</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* 3. Use Cases */}
                <div className="flex flex-col justify-between bg-plum-900/50 hover:bg-plum-900/70 p-4 rounded-2xl border border-plum-800/80 transition-colors shadow-sm">
                  <div>
                    <div className="flex items-center justify-between border-b border-plum-800/80 pb-2.5 mb-3">
                      <h4 className="font-black uppercase tracking-wider text-peach-300 flex items-center gap-2 text-xs">
                        <div className="w-6 h-6 rounded-lg bg-plum-800/90 text-peach-300 flex items-center justify-center border border-plum-700/60">
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </div>
                        <span>Use Cases</span>
                      </h4>
                      <span className="text-[10px] font-bold text-plum-300 bg-plum-950/80 px-2 py-0.5 rounded-full border border-plum-800">
                        Capabilities
                      </span>
                    </div>

                    <ul className="space-y-1 text-plum-200">
                      {[
                        { slug: 'sales-assistant', label: '24/7 AI Sales Assistant' },
                        { slug: 'lead-generation', label: 'Automated Lead Generation' },
                        { slug: 'conversion-engine', label: 'Conversion & Checkout AI' },
                        { slug: 'engagement-ai', label: 'Customer Retention Engine' },
                        { slug: 'product-discovery', label: 'Multimodal Vector Search' },
                        { slug: 'b2b-commerce', label: 'B2B Wholesale & Dealer Portal' },
                      ].map((uc) => (
                        <li key={uc.slug}>
                          <button
                            onClick={() => {
                              setQuickNavOpen(false);
                              scrollToSection('use-cases');
                              if (onSelectUseCase) onSelectUseCase(uc.slug);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-xl text-plum-200 hover:text-white hover:bg-plum-800/70 transition-all flex items-center justify-between group cursor-pointer border border-transparent hover:border-plum-700/50"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-peach-400/80 group-hover:bg-peach-300 group-hover:scale-125 transition-all shrink-0"></span>
                              <span className="text-xs font-medium group-hover:font-semibold group-hover:text-peach-200 transition-colors truncate">
                                {uc.label}
                              </span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-peach-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 mt-3 border-t border-plum-800/70">
                    <button
                      onClick={() => scrollToSection('use-cases')}
                      className="w-full py-2 px-3 rounded-xl bg-plum-800/80 hover:bg-plum-700 text-peach-300 font-bold text-xs transition-colors flex items-center justify-between group cursor-pointer border border-plum-700/60"
                    >
                      <span className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-peach-300" />
                        <span>All 12+ Use Cases</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* 4. Company & Comparisons */}
                <div className="flex flex-col justify-between bg-plum-900/50 hover:bg-plum-900/70 p-4 rounded-2xl border border-plum-800/80 transition-colors shadow-sm">
                  <div>
                    <div className="flex items-center justify-between border-b border-plum-800/80 pb-2.5 mb-3">
                      <h4 className="font-black uppercase tracking-wider text-peach-300 flex items-center gap-2 text-xs">
                        <div className="w-6 h-6 rounded-lg bg-plum-800/90 text-peach-300 flex items-center justify-center border border-plum-700/60">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                        <span>Company</span>
                      </h4>
                      <span className="text-[10px] font-bold text-plum-300 bg-plum-950/80 px-2 py-0.5 rounded-full border border-plum-800">
                        Resources
                      </span>
                    </div>

                    <ul className="space-y-1 text-plum-200">
                      <li>
                        <button
                          onClick={() => {
                            setQuickNavOpen(false);
                            if (onNavigateAbout) onNavigateAbout();
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-plum-200 hover:text-white hover:bg-plum-800/70 transition-all flex items-center justify-between group cursor-pointer border border-transparent hover:border-plum-700/50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-peach-400/80 group-hover:bg-peach-300 group-hover:scale-125 transition-all shrink-0"></span>
                            <span className="text-xs font-medium group-hover:font-semibold group-hover:text-peach-200 transition-colors truncate">
                              About SilarAI &amp; Mission
                            </span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-peach-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            setQuickNavOpen(false);
                            if (onNavigateWhyChooseUs) onNavigateWhyChooseUs();
                            else scrollToSection('why-choose-us');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-plum-200 hover:text-white hover:bg-plum-800/70 transition-all flex items-center justify-between group cursor-pointer border border-transparent hover:border-plum-700/50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-peach-400/80 group-hover:bg-peach-300 group-hover:scale-125 transition-all shrink-0"></span>
                            <span className="text-xs font-medium group-hover:font-semibold group-hover:text-peach-200 transition-colors truncate">
                              Why Choose SilarAI Platform
                            </span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-peach-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            setQuickNavOpen(false);
                            if (onNavigateShopifyComparison) onNavigateShopifyComparison();
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-plum-200 hover:text-white hover:bg-plum-800/70 transition-all flex items-center justify-between group cursor-pointer border border-transparent hover:border-plum-700/50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-peach-400/80 group-hover:bg-peach-300 group-hover:scale-125 transition-all shrink-0"></span>
                            <span className="text-xs font-medium group-hover:font-semibold group-hover:text-peach-200 transition-colors truncate">
                              Shopify vs SilarAI Platform
                            </span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-peach-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            setQuickNavOpen(false);
                            if (onNavigateWoocommerceComparison) onNavigateWoocommerceComparison();
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-plum-200 hover:text-white hover:bg-plum-800/70 transition-all flex items-center justify-between group cursor-pointer border border-transparent hover:border-plum-700/50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-peach-400/80 group-hover:bg-peach-300 group-hover:scale-125 transition-all shrink-0"></span>
                            <span className="text-xs font-medium group-hover:font-semibold group-hover:text-peach-200 transition-colors truncate">
                              WooCommerce vs SilarAI
                            </span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-peach-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            setQuickNavOpen(false);
                            if (onOpenAiDiscoveryModal) onOpenAiDiscoveryModal();
                            else scrollToSection('faq');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-plum-200 hover:text-white hover:bg-plum-800/70 transition-all flex items-center justify-between group cursor-pointer border border-transparent hover:border-plum-700/50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-peach-400/80 group-hover:bg-peach-300 group-hover:scale-125 transition-all shrink-0"></span>
                            <span className="text-xs font-medium group-hover:font-semibold group-hover:text-peach-200 transition-colors truncate">
                              AI Discovery &amp; RAG Hub
                            </span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-peach-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-3 mt-3 border-t border-plum-800/70">
                    <button
                      onClick={() => {
                        setQuickNavOpen(false);
                        onBookDemo();
                      }}
                      className="w-full py-2 px-3 bg-coral-400 hover:bg-coral-500 text-plum-950 font-extrabold rounded-xl transition-all text-center text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <span>Book Live Demo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
