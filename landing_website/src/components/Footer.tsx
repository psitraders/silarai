import React, { useState } from 'react';
import { Send, CheckCircle2, Github, Twitter, Linkedin, Youtube, Sparkles } from 'lucide-react';
import { SilarAiBrandLogo } from './SilarAiBrandLogo';

interface FooterProps {
  onSelectIndustry?: (industryId: string) => void;
  onSelectUseCase?: (slug: string) => void;
  onNavigateAbout?: () => void;
  onNavigateWhyChooseUs?: () => void;
  onNavigateShopifyComparison?: () => void;
  onNavigateWoocommerceComparison?: () => void;
  onNavigateAiCommerceMarketingPlatform?: () => void;
  onSelectAiShoppingPage?: (pageId: 1 | 2 | 3) => void;
  onSelectAiCommercePage?: (pageId: 1 | 2 | 3) => void;
  onSelectD2cPage?: (sectionId?: string) => void;
  onSelectManufacturingPage?: (pageId: 1 | 2 | 3) => void;
  onGoHome?: () => void;
  customLogoImg?: string;
  onOpenLogoModal?: () => void;
  onOpenAiDiscoveryModal?: () => void;
  onNavigateContactUs?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectIndustry,
  onSelectUseCase,
  onNavigateAbout,
  onNavigateWhyChooseUs,
  onNavigateShopifyComparison,
  onNavigateWoocommerceComparison,
  onNavigateAiCommerceMarketingPlatform,
  onSelectAiShoppingPage,
  onSelectAiCommercePage,
  onSelectD2cPage,
  onSelectManufacturingPage,
  onGoHome,
  customLogoImg,
  onOpenLogoModal,
  onOpenAiDiscoveryModal,
  onNavigateContactUs
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    } else if (onGoHome) {
      onGoHome();
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = el.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <footer className="bg-plum-950 text-plum-200 pt-16 pb-12 border-t border-plum-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer 5-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 pb-12 border-b border-plum-900">
          {/* Col 1 & 2: Brand Info & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center">
              <button
                onClick={() => {
                  if (onGoHome) {
                    onGoHome();
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="flex items-center group focus:outline-none text-left cursor-pointer transition-transform hover:scale-[1.02]"
                aria-label="SilarAI Home"
              >
                <SilarAiBrandLogo
                  customLogoImg={customLogoImg}
                  variant="dark"
                  showTagline={true}
                />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-plum-200 leading-relaxed max-w-sm">
              Build Smarter Commerce with AI. The intelligent commerce platform and conversational shopping assistant for modern businesses.
            </p>

            {/* Newsletter signup */}
            <div className="pt-2">
              <div className="text-xs font-bold text-white mb-2">
                Subscribe to Commerce AI Insights
              </div>

              {subscribed ? (
                <div className="text-xs text-peach-300 bg-plum-900/80 p-3 rounded-xl border border-plum-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-peach-300" />
                  <span>Thank you for subscribing! Check your inbox soon.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your work email"
                    className="w-full bg-plum-900 border border-plum-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-plum-300 focus:outline-none focus:ring-2 focus:ring-peach-300"
                  />
                  <button
                    type="submit"
                    className="bg-peach-300 hover:bg-peach-200 text-plum-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-colors shrink-0 flex items-center gap-1 shadow-sm"
                  >
                    <span>Join</span>
                    <Send className="w-3 h-3 text-plum-900" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Col 3: Products & Guides */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Products</h4>
            <ul className="space-y-2.5 text-xs text-plum-200">
              <li>
                <button
                  onClick={() => {
                    if (onSelectAiShoppingPage) onSelectAiShoppingPage(1);
                    else scrollToSection('products');
                  }}
                  className="hover:text-peach-300 transition-colors font-bold text-white flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-peach-300"></span>
                  <span>AI Shopping Assistant</span>
                </button>

                {/* Sub-pages under AI Shopping Assistant */}
                <ul className="mt-2 ml-3 space-y-1.5 border-l border-plum-800 pl-2 text-[11px] text-plum-300">
                  <li>
                    <button
                      onClick={() => onSelectAiShoppingPage && onSelectAiShoppingPage(1)}
                      className="hover:text-peach-300 transition-colors text-left block cursor-pointer"
                    >
                      1. What is an AI Assistant?
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onSelectAiShoppingPage && onSelectAiShoppingPage(2)}
                      className="hover:text-peach-300 transition-colors text-left block cursor-pointer"
                    >
                      2. Features & Benefits
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onSelectAiShoppingPage && onSelectAiShoppingPage(3)}
                      className="hover:text-peach-300 transition-colors text-left block cursor-pointer"
                    >
                      3. Help Businesses Grow
                    </button>
                  </li>
                </ul>
              </li>

              <li className="pt-2">
                <button
                  onClick={() => {
                    if (onNavigateAiCommerceMarketingPlatform) onNavigateAiCommerceMarketingPlatform();
                    else if (onSelectAiCommercePage) onSelectAiCommercePage(1);
                    else scrollToSection('products');
                  }}
                  className="hover:text-peach-300 transition-colors font-bold text-white flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-peach-300"></span>
                  <span>AI Commerce &amp; Marketing Platform</span>
                </button>

                {/* Sub-pages under AI Commerce Platform */}
                <ul className="mt-2 ml-3 space-y-1.5 border-l border-plum-800 pl-2 text-[11px] text-plum-300">
                  <li className="hidden" style={{ display: 'none' }}>
                    <button
                      onClick={() => onNavigateAiCommerceMarketingPlatform && onNavigateAiCommerceMarketingPlatform()}
                      className="hidden hover:text-peach-300 transition-colors text-left block text-emerald-400 font-medium"
                      style={{ display: 'none' }}
                      aria-hidden="true"
                    >
                      Central Pillar: /ai-commerce-marketing-platform/
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onSelectAiCommercePage && onSelectAiCommercePage(1)}
                      className="hover:text-peach-300 transition-colors text-left block"
                    >
                      1. Commerce &amp; Marketing
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onSelectAiCommercePage && onSelectAiCommercePage(2)}
                      className="hover:text-peach-300 transition-colors text-left block"
                    >
                      2. AI Shopping Assistant
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onSelectAiCommercePage && onSelectAiCommercePage(3)}
                      className="hover:text-peach-300 transition-colors text-left block"
                    >
                      3. Marketing Automation
                    </button>
                  </li>
                </ul>
              </li>

              {/* SEO Hyperlink for Pricing Page */}
              <li className="pt-2">
                <a
                  href="/#pricing"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('pricing');
                  }}
                  className="hover:text-peach-300 transition-colors font-extrabold text-peach-300 flex items-center justify-between group"
                  title="SilarAI Pricing & Plans — Starter $10, Growth $50, Enterprise"
                  rel="bookmark"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-peach-300 shrink-0" />
                    <span>Pricing &amp; Plans</span>
                  </span>
                  <span className="text-[10px] font-black uppercase bg-peach-300 text-plum-950 px-2 py-0.5 rounded-full shadow-2xs group-hover:bg-peach-200">
                    From $10/mo
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Solutions / Industries */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Solutions</h4>
            <ul data-focus-id="focus-0" className="space-y-2 text-xs text-plum-200">
              <li>
                <button
                  onClick={() => {
                    scrollToSection('industries');
                    if (onSelectIndustry) onSelectIndustry('fmcg');
                  }}
                  className="hover:text-peach-300 transition-colors text-left cursor-pointer"
                >
                  FMCG Brands
                </button>
              </li>

              {/* D2C Brands */}
              <li>
                <button
                  onClick={() => {
                    if (onSelectD2cPage) {
                      onSelectD2cPage();
                    } else if (onSelectIndustry) {
                      onSelectIndustry('d2c-brands');
                    }
                  }}
                  className="hover:text-peach-300 transition-colors text-left cursor-pointer"
                >
                  D2C Brands
                </button>
              </li>

              {/* Manufacturers */}
              <li>
                <button
                  onClick={() => {
                    if (onSelectManufacturingPage) {
                      onSelectManufacturingPage(1);
                    } else if (onSelectIndustry) {
                      onSelectIndustry('manufacturers');
                    }
                  }}
                  className="hover:text-peach-300 transition-colors text-left cursor-pointer"
                >
                  Manufacturers
                </button>

                {/* Sub-pages under Manufacturers - Hidden from storefront display, preserved in backend */}
                <ul
                  className="hidden mt-2 ml-3 space-y-1.5 border-l border-plum-800 pl-2 text-[11px] text-plum-300"
                  style={{ display: 'none' }}
                  aria-hidden="true"
                >
                  <li>
                    <button
                      onClick={() => onSelectManufacturingPage && onSelectManufacturingPage(1)}
                      className="hover:text-peach-300 transition-colors text-left block"
                    >
                      1. AI Commerce Platform
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onSelectManufacturingPage && onSelectManufacturingPage(2)}
                      className="hover:text-peach-300 transition-colors text-left block"
                    >
                      2. AI Shopping &amp; Sales Assistant
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onSelectManufacturingPage && onSelectManufacturingPage(3)}
                      className="hover:text-peach-300 transition-colors text-left block"
                    >
                      3. Dealer &amp; Distributor Commerce
                    </button>
                  </li>
                </ul>
              </li>

              {[
                { id: 'boutiques', label: 'Boutiques & Curated' },
                { id: 'b2b2c', label: 'B2B2C Multi-Tier' },
                { id: 'distributors', label: 'Distributors' },
                { id: 'wholesalers', label: 'Wholesalers' },
                { id: 'retailers', label: 'Retailers' },
              ].map((ind) => (
                <li key={ind.id}>
                  <button
                    onClick={() => {
                      scrollToSection('industries');
                      if (onSelectIndustry) {
                        onSelectIndustry(ind.id);
                      }
                    }}
                    className="hover:text-peach-300 transition-colors text-left cursor-pointer"
                  >
                    {ind.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Use Cases */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Use Cases</h4>
            <ul className="space-y-3 text-xs text-plum-200">
              {[
                {
                  slug: 'product-discovery',
                  title: 'Product Discovery',
                  subtitle: 'Find the right product from complex catalogs'
                },
                {
                  slug: 'sales-assistant',
                  title: 'AI Sales Assistant',
                  subtitle: 'Turn product conversations into sales'
                },
                {
                  slug: 'lead-generation',
                  title: 'Lead Generation',
                  subtitle: 'Capture and qualify high-intent buyers'
                },
                {
                  slug: 'conversion-engine',
                  title: 'Conversion & Cart Recovery',
                  subtitle: 'Turn more visitors into customers'
                },
                {
                  slug: 'engagement-ai',
                  title: 'Customer Engagement',
                  subtitle: 'Engage customers across web and WhatsApp'
                },
                {
                  slug: 'b2b-commerce',
                  title: 'B2B Commerce',
                  subtitle: 'Connect buyers, dealers, distributors and sales teams.'
                },
              ].map((uc) => (
                <li key={uc.slug}>
                  <a
                    href={`/use-cases/${uc.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('use-cases');
                      if (onSelectUseCase) {
                        onSelectUseCase(uc.slug);
                      }
                    }}
                    className="group block text-left transition-colors cursor-pointer"
                    title={`${uc.title} — ${uc.subtitle}`}
                  >
                    <div className="font-bold text-white group-hover:text-peach-300 transition-colors flex items-center justify-between">
                      <span>{uc.title}</span>
                      <span className="text-[10px] text-peach-300 opacity-0 group-hover:opacity-100 transition-opacity ml-1">↗</span>
                    </div>
                    <div className="text-[11px] text-plum-300/90 leading-tight mt-0.5 group-hover:text-plum-100 transition-colors">
                      {uc.subtitle}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 6: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Company</h4>
            <ul className="space-y-2 text-xs text-plum-200">
              <li>
                <button
                  onClick={() => {
                    if (onNavigateAbout) {
                      onNavigateAbout();
                    }
                  }}
                  className="hover:text-peach-300 transition-colors text-left"
                >
                  About SilarAI
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onNavigateWhyChooseUs) {
                      onNavigateWhyChooseUs();
                    } else {
                      scrollToSection('why-choose-us');
                    }
                  }}
                  className="hover:text-peach-300 transition-colors text-left flex items-center gap-1.5 font-bold text-peach-200"
                >
                  <Sparkles className="w-3.5 h-3.5 text-peach-300 shrink-0" />
                  <span>Why Choose SilarAI</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onNavigateShopifyComparison) {
                      onNavigateShopifyComparison();
                    }
                  }}
                  className="hover:text-peach-300 transition-colors text-left flex items-center gap-1.5 font-bold text-teal-300"
                >
                  <span>Shopify vs SilarAI</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onNavigateWoocommerceComparison) {
                      onNavigateWoocommerceComparison();
                    }
                  }}
                  className="hover:text-peach-300 transition-colors text-left flex items-center gap-1.5 font-bold text-teal-300"
                >
                  <span>WooCommerce vs SilarAI</span>
                </button>
              </li>
              <li>
                <a
                  href="/#pricing"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('pricing');
                  }}
                  className="hover:text-peach-300 transition-colors text-left flex items-center gap-1.5 font-bold text-white"
                  title="SilarAI Simple & Transparent Pricing ($10/mo)"
                >
                  <span>Simple &amp; Transparent Pricing</span>
                  <span className="text-[10px] font-black text-peach-300 bg-plum-900 px-1.5 py-0.2 rounded border border-plum-800">
                    $10
                  </span>
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); alert('We are hiring AI & Full-Stack Engineers!'); }} className="hover:text-peach-300 transition-colors flex items-center gap-1">
                  <span>Careers</span>
                  <span className="text-[9px] bg-peach-300 text-plum-950 px-1.5 py-0.2 rounded font-extrabold">Hiring</span>
                </a>
              </li>
              <li>
                <a
                  href="/contact-us"
                  onClick={(e) => {
                    if (onNavigateContactUs) {
                      e.preventDefault();
                      onNavigateContactUs();
                    }
                  }}
                  className="hover:text-peach-300 transition-colors cursor-pointer"
                >
                  Contact Us
                </a>
              </li>
              <li className="pt-2 text-[11px] text-plum-300/80 leading-relaxed border-t border-plum-900/60 mt-1">
                <a href="tel:+919444139089" className="hover:text-peach-300 text-peach-300/90 font-semibold block transition-colors">
                  (+91)9444139089
                </a>
                <span className="text-[10px] text-plum-300/70 block mt-0.5">
                  PSI traders OPC PVT LTD<br />
                  74 RR Nagar, NSNPALAYAM,<br />
                  Coimbatore, Tamil nadu 641031
                </span>
              </li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); alert('Security & Compliance: SOC2 Type II Certified.'); }} className="hover:text-peach-300 transition-colors">
                  Security
                </a>
              </li>
              <li className="hidden" style={{ display: 'none' }} aria-hidden="true">
                <a href="/ai/semantic-backlinks.json" tabIndex={-1}>
                  Authority &amp; Backlink Hub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Socials & Copyright */}
        <div className="pt-8 border-t border-plum-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-plum-300">
          <div>
            © {new Date().getFullYear()} SilarAI • PSI traders OPC PVT LTD. All rights reserved. 74 RR Nagar, NSNPALAYAM, Coimbatore, Tamil nadu 641031.
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-peach-300 transition-colors" aria-label="Twitter">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="hover:text-peach-300 transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="#" className="hover:text-peach-300 transition-colors" aria-label="GitHub">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="hover:text-peach-300 transition-colors" aria-label="YouTube">
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
