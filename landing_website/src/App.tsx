import React, { useState, useEffect, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SectionQuickNav } from './components/SectionQuickNav';
import { DeferredSection } from './components/DeferredSection';
import { SmoothWaveBackground } from './components/SmoothWaveBackground';

import type { AiShoppingPageId } from './components/AiShoppingAssistantPages';
import type { AiCommercePageId } from './components/AiCommercePlatformPages';
import type { D2cPageId } from './types';

// Modular Lazy Loading for SEO Head Manager (defers 150KB+ of SEO dictionaries from critical path)
const SeoHead = React.lazy(() => import('./components/SeoHead').then(m => ({ default: m.SeoHead })));

// Modular Lazy Loading for Below-the-Fold Core Home Page Components
const ProductsSection = React.lazy(() => import('./components/ProductsSection').then(m => ({ default: m.ProductsSection })));
const HowItWorks = React.lazy(() => import('./components/HowItWorks').then(m => ({ default: m.HowItWorks })));
const AllInOneSection = React.lazy(() => import('./components/AllInOneSection').then(m => ({ default: m.AllInOneSection })));
const CustomDomainSection = React.lazy(() => import('./components/CustomDomainSection').then(m => ({ default: m.CustomDomainSection })));
const TrustedIntegrations = React.lazy(() => import('./components/TrustedIntegrations').then(m => ({ default: m.TrustedIntegrations })));
const IndustriesSection = React.lazy(() => import('./components/IndustriesSection').then(m => ({ default: m.IndustriesSection })));
const WhySilarAi = React.lazy(() => import('./components/WhySilarAi').then(m => ({ default: m.WhySilarAi })));
const Footer = React.lazy(() => import('./components/Footer').then(m => ({ default: m.Footer })));

// Modular Lazy Loading for Subpages and Industry Views
const AboutPage = React.lazy(() => import('./components/AboutPage').then(m => ({ default: m.AboutPage })));
const WhyChoosePage = React.lazy(() => import('./components/WhyChoosePage').then(m => ({ default: m.WhyChoosePage })));
const ShopifyComparisonPage = React.lazy(() => import('./components/ShopifyComparisonPage').then(m => ({ default: m.ShopifyComparisonPage })));
const WoocommerceComparisonPage = React.lazy(() => import('./components/WoocommerceComparisonPage').then(m => ({ default: m.WoocommerceComparisonPage })));
const AiShoppingAssistantPages = React.lazy(() => import('./components/AiShoppingAssistantPages').then(m => ({ default: m.AiShoppingAssistantPages })));
const AiCommercePlatformPages = React.lazy(() => import('./components/AiCommercePlatformPages').then(m => ({ default: m.AiCommercePlatformPages })));
const RetailIndustryPage = React.lazy(() => import('./components/RetailIndustryPage').then(m => ({ default: m.RetailIndustryPage })));
const D2cIndustryPage = React.lazy(() => import('./components/D2cIndustryPage').then(m => ({ default: m.D2cIndustryPage })));
const DistributorsIndustryPage = React.lazy(() => import('./components/DistributorsIndustryPage').then(m => ({ default: m.DistributorsIndustryPage })));
const WholesalersIndustryPage = React.lazy(() => import('./components/WholesalersIndustryPage').then(m => ({ default: m.WholesalersIndustryPage })));
const ManufacturingIndustryPage = React.lazy(() => import('./components/ManufacturingIndustryPage').then(m => ({ default: m.ManufacturingIndustryPage })));
const FmcgIndustryPage = React.lazy(() => import('./components/FmcgIndustryPage').then(m => ({ default: m.FmcgIndustryPage })));
const AiCommerceMarketingPlatformPage = React.lazy(() => import('./components/AiCommerceMarketingPlatformPage').then(m => ({ default: m.AiCommerceMarketingPlatformPage })));
const ContactUsPage = React.lazy(() => import('./components/ContactUsPage').then(m => ({ default: m.ContactUsPage })));
const SectorLandingPage = React.lazy(() => import('./components/SectorLandingPage').then(m => ({ default: m.SectorLandingPage })));

// Modular Lazy Loading for Below-the-Fold Home Page Sections
const CustomerMetrics = React.lazy(() => import('./components/CustomerMetrics').then(m => ({ default: m.CustomerMetrics })));
const UseCasesSection = React.lazy(() => import('./components/UseCasesSection').then(m => ({ default: m.UseCasesSection })));
const PricingSection = React.lazy(() => import('./components/PricingSection').then(m => ({ default: m.PricingSection })));
const FaqSection = React.lazy(() => import('./components/FaqSection').then(m => ({ default: m.FaqSection })));
const FinalCta = React.lazy(() => import('./components/FinalCta').then(m => ({ default: m.FinalCta })));
const SectionSeoMetaSnippet = React.lazy(() => import('./components/SectionSeoMetaSnippet').then(m => ({ default: m.SectionSeoMetaSnippet })));
const InternalLinkingSection = React.lazy(() => import('./components/InternalLinkingSection').then(m => ({ default: m.InternalLinkingSection })));

// Modular Lazy Loading for Modals and Interactive Widgets
const BookDemoModal = React.lazy(() => import('./components/BookDemoModal').then(m => ({ default: m.BookDemoModal })));
const ProductTourModal = React.lazy(() => import('./components/ProductTourModal').then(m => ({ default: m.ProductTourModal })));
const AiDiscoveryModal = React.lazy(() => import('./components/AiDiscoveryModal').then(m => ({ default: m.AiDiscoveryModal })));
const FloatingAiAssistantWidget = React.lazy(() => import('./components/FloatingAiAssistantWidget').then(m => ({ default: m.FloatingAiAssistantWidget })));

const PageLoadingFallback = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 py-24 bg-[#F8F9FA] text-[#183a47]">
    <div className="w-8 h-8 rounded-full border-2 border-[#F47A38] border-t-transparent animate-spin" />
    <span className="text-xs font-semibold tracking-wide text-slate-600">Loading page...</span>
  </div>
);

const SectionLoadingFallback = () => (
  <div className="py-12 flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border-2 border-[#0D8F81] border-t-transparent animate-spin" />
  </div>
);

export default function App() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [aiDiscoveryModalOpen, setAiDiscoveryModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>(undefined);

  const [aiShoppingSubPage, setAiShoppingSubPage] = useState<AiShoppingPageId>(() => {
    const params = new URLSearchParams(window.location.search);
    const sub = params.get('subPage');
    if (sub === '2') return 2;
    if (sub === '3') return 3;
    return 1;
  });

  const [aiCommerceSubPage, setAiCommerceSubPage] = useState<AiCommercePageId>(() => {
    const params = new URLSearchParams(window.location.search);
    const sub = params.get('subPage');
    if (sub === '2') return 2;
    if (sub === '3') return 3;
    return 1;
  });

  const [manufacturingSubPage, setManufacturingSubPage] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    const sub = params.get('subPage');
    if (sub === '2' || path.includes('/ai-shopping-sales-assistant')) return 2;
    if (sub === '3' || path.includes('/dealer-distributor-commerce')) return 3;
    return 1;
  });

  const [d2cSubPage, setD2cSubPage] = useState<D2cPageId | undefined>(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    const sub = params.get('subPage');
    const pageParam = params.get('page');
    if (sub === '2' || path.includes('/ai-commerce-platform') || pageParam === 'd2c-ai-commerce-platform') return 2;
    if (sub === '3' || path.includes('/increase-sales-with-ai') || pageParam === 'd2c-increase-sales') return 3;
    if (sub === '1' || path.includes('/ai-shopping-assistant') || pageParam === 'd2c-ai-shopping-assistant') return 1;
    return undefined;
  });

  const [currentView, setCurrentView] = useState<
    'home' | 'about' | 'contact-us' | 'ai-shopping-assistant' | 'ai-commerce-platform' | 'ai-commerce-marketing-platform' | 'why-choose-us' | 'shopify-comparison' | 'woocommerce-comparison' | 'retail-commerce' | 'd2c-brands' | 'distributors' | 'wholesalers' | 'manufacturing' | 'fmcg-commerce' | 'fmcg' | 'sector-landing'
  >(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    const pageParam = params.get('page');
    const sectorParam = params.get('sector');

    if (pageParam === 'sector' || sectorParam || path.startsWith('/sector/')) {
      return 'sector-landing';
    }
    if (pageParam === 'contact-us' || pageParam === 'contact' || path === '/contact-us' || path === '/contact') {
      return 'contact-us';
    }
    if (pageParam === 'about' || path === '/about') {
      return 'about';
    }
    if (pageParam === 'why-choose-us' || path === '/why-choose-us') {
      return 'why-choose-us';
    }
    if (pageParam === 'shopify-comparison' || pageParam === 'shopify-vs-silarai' || path === '/shopify-vs-silarai' || path === '/integrations/shopify') {
      return 'shopify-comparison';
    }
    if (pageParam === 'woocommerce-comparison' || pageParam === 'woocommerce-vs-silarai' || path === '/woocommerce-vs-silarai' || path === '/integrations/woocommerce') {
      return 'woocommerce-comparison';
    }
    if (
      pageParam === 'ai-shopping-assistant' ||
      pageParam === 'shopping-assistant' ||
      path === '/ai-shopping-assistant' ||
      path === '/shopping-assistant' ||
      path === '/ai-sales-assistant' ||
      pageParam === 'ai-sales-assistant'
    ) {
      return 'ai-shopping-assistant';
    }
    if (
      pageParam === 'ai-commerce-marketing-platform' ||
      path === '/ai-commerce-marketing-platform' ||
      path === '/ai-commerce-marketing-platform/'
    ) {
      return 'ai-commerce-marketing-platform';
    }
    if (
      pageParam === 'ai-commerce-platform' ||
      pageParam === 'commerce-platform' ||
      path === '/commerce-platform' ||
      path === '/ai-commerce-platform' ||
      path === '/ai-marketing-platform' ||
      path === '/b2b-commerce-platform' ||
      path === '/b2b2c-commerce-platform' ||
      path === '/ai-product-discovery' ||
      path === '/dealer-portal' ||
      path === '/customer-portal' ||
      pageParam === 'ai-marketing-platform' ||
      pageParam === 'b2b-commerce-platform' ||
      pageParam === 'b2b2c-commerce-platform' ||
      pageParam === 'ai-product-discovery' ||
      pageParam === 'dealer-portal' ||
      pageParam === 'customer-portal'
    ) {
      return 'ai-commerce-platform';
    }
    if (pageParam === 'fmcg' || pageParam === 'fmcg-commerce' || pageParam === 'fmcg-brands' || pageParam === 'cpg' || path === '/fmcg-commerce' || path === '/fmcg' || path === '/industries/fmcg' || path === '/industries/fmcg-commerce') {
      return 'fmcg-commerce';
    }
    if (pageParam === 'retail-commerce' || pageParam === 'retail-ai-platform' || path === '/retail-ai-platform' || path === '/retail-commerce' || path === '/industries/retailers' || path === '/industries/retail-commerce') {
      return 'retail-commerce';
    }
    if (
      pageParam === 'd2c-brands' ||
      pageParam === 'd2c-ai-platform' ||
      pageParam === 'd2c' ||
      path === '/d2c-ai-platform' ||
      path === '/d2c-brands' ||
      path === '/industries/d2c-brands' ||
      path.startsWith('/industries/d2c-brands/') ||
      pageParam === 'd2c-ai-shopping-assistant' ||
      pageParam === 'd2c-ai-commerce-platform' ||
      pageParam === 'd2c-increase-sales'
    ) {
      return 'd2c-brands';
    }
    if (pageParam === 'distributors' || pageParam === 'distributors-ai-platform' || path === '/distributors-ai-platform' || path === '/distributors' || path === '/industries/distributors') {
      return 'distributors';
    }
    if (pageParam === 'wholesalers' || pageParam === 'wholesalers-ai-platform' || pageParam === 'wholesale' || path === '/wholesalers-ai-platform' || path === '/wholesalers' || path === '/industries/wholesalers') {
      return 'wholesalers';
    }
    if (
      pageParam === 'manufacturing' ||
      pageParam === 'manufacturing-ai-platform' ||
      pageParam === 'manufacturers' ||
      path === '/manufacturing' ||
      path === '/manufacturing-ai-platform' ||
      path === '/industries/manufacturing' ||
      path.startsWith('/industries/')
    ) {
      return 'manufacturing';
    }
    return 'home';
  });

  const [activeUseCaseSlug, setActiveUseCaseSlug] = useState<string | null>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/use-cases/')) {
      return path.replace('/use-cases/', '');
    }
    return null;
  });

  const [showFloatingWidget, setShowFloatingWidget] = useState(false);

  useEffect(() => {
    // Show widget promptly for testing and user interaction
    const timer = setTimeout(() => {
      setShowFloatingWidget(true);
    }, 1200);

    const onUserInteraction = () => {
      setShowFloatingWidget(true);
      window.removeEventListener('scroll', onUserInteraction);
      window.removeEventListener('pointerdown', onUserInteraction);
      window.removeEventListener('keydown', onUserInteraction);
    };

    const onExplicitOpen = () => {
      setShowFloatingWidget(true);
    };

    window.addEventListener('open-silarai-chat', onExplicitOpen);
    window.addEventListener('scroll', onUserInteraction, { passive: true, once: true });
    window.addEventListener('pointerdown', onUserInteraction, { passive: true, once: true });
    window.addEventListener('keydown', onUserInteraction, { passive: true, once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('open-silarai-chat', onExplicitOpen);
      window.removeEventListener('scroll', onUserInteraction);
      window.removeEventListener('pointerdown', onUserInteraction);
      window.removeEventListener('keydown', onUserInteraction);
    };
  }, []);

  const [activeIndustryId, setActiveIndustryId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('industry');
  });

  const [activeSectorSlug, setActiveSectorSlug] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    if (path.startsWith('/sector/')) {
      return path.replace('/sector/', '');
    }
    return params.get('sector') || 'boutiques';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page');
      const sectorParam = params.get('sector');

      if (pageParam === 'sector' || sectorParam || path.startsWith('/sector/')) {
        setCurrentView('sector-landing');
        const slug = path.startsWith('/sector/') ? path.replace('/sector/', '') : (sectorParam || 'boutiques');
        setActiveSectorSlug(slug);
      } else if (pageParam === 'contact-us' || pageParam === 'contact' || path === '/contact-us' || path === '/contact') {
        setCurrentView('contact-us');
      } else if (pageParam === 'about' || path === '/about') {
        setCurrentView('about');
      } else if (pageParam === 'why-choose-us' || path === '/why-choose-us') {
        setCurrentView('why-choose-us');
      } else if (pageParam === 'shopify-comparison' || pageParam === 'shopify-vs-silarai' || path === '/shopify-vs-silarai' || path === '/integrations/shopify') {
        setCurrentView('shopify-comparison');
      } else if (pageParam === 'woocommerce-comparison' || pageParam === 'woocommerce-vs-silarai' || path === '/woocommerce-vs-silarai' || path === '/integrations/woocommerce') {
        setCurrentView('woocommerce-comparison');
      } else if (
        pageParam === 'ai-shopping-assistant' ||
        pageParam === 'shopping-assistant' ||
        path === '/ai-shopping-assistant' ||
        path === '/shopping-assistant' ||
        path === '/ai-sales-assistant' ||
        pageParam === 'ai-sales-assistant'
      ) {
        setCurrentView('ai-shopping-assistant');
        const sub = params.get('subPage');
        if (sub === '2') setAiShoppingSubPage(2);
        else if (sub === '3') setAiShoppingSubPage(3);
        else setAiShoppingSubPage(1);
      } else if (
        pageParam === 'ai-commerce-marketing-platform' ||
        path === '/ai-commerce-marketing-platform' ||
        path === '/ai-commerce-marketing-platform/'
      ) {
        setCurrentView('ai-commerce-marketing-platform');
      } else if (
        pageParam === 'ai-commerce-platform' ||
        pageParam === 'commerce-platform' ||
        path === '/commerce-platform' ||
        path === '/ai-commerce-platform' ||
        path === '/ai-marketing-platform' ||
        path === '/b2b-commerce-platform' ||
        path === '/b2b2c-commerce-platform' ||
        path === '/ai-product-discovery' ||
        path === '/dealer-portal' ||
        path === '/customer-portal' ||
        pageParam === 'ai-marketing-platform' ||
        pageParam === 'b2b-commerce-platform' ||
        pageParam === 'b2b2c-commerce-platform' ||
        pageParam === 'ai-product-discovery' ||
        pageParam === 'dealer-portal' ||
        pageParam === 'customer-portal'
      ) {
        setCurrentView('ai-commerce-platform');
        const sub = params.get('subPage');
        if (sub === '2') setAiCommerceSubPage(2);
        else if (sub === '3') setAiCommerceSubPage(3);
        else setAiCommerceSubPage(1);
      } else if (pageParam === 'fmcg' || pageParam === 'fmcg-commerce' || pageParam === 'fmcg-brands' || pageParam === 'cpg' || path === '/fmcg-commerce' || path === '/fmcg' || path === '/industries/fmcg' || path === '/industries/fmcg-commerce') {
        setCurrentView('fmcg-commerce');
      } else if (pageParam === 'retail-commerce' || pageParam === 'retail-ai-platform' || path === '/retail-ai-platform' || path === '/retail-commerce' || path === '/industries/retailers' || path === '/industries/retail-commerce') {
        setCurrentView('retail-commerce');
      } else if (
        pageParam === 'd2c-brands' ||
        pageParam === 'd2c-ai-platform' ||
        pageParam === 'd2c' ||
        path === '/d2c-ai-platform' ||
        path === '/d2c-brands' ||
        path === '/industries/d2c-brands' ||
        path.startsWith('/industries/d2c-brands/') ||
        pageParam === 'd2c-ai-shopping-assistant' ||
        pageParam === 'd2c-ai-commerce-platform' ||
        pageParam === 'd2c-increase-sales'
      ) {
        setCurrentView('d2c-brands');
        const sub = params.get('subPage');
        if (sub === '2' || path.includes('/ai-commerce-platform') || pageParam === 'd2c-ai-commerce-platform') setD2cSubPage(2);
        else if (sub === '3' || path.includes('/increase-sales-with-ai') || pageParam === 'd2c-increase-sales') setD2cSubPage(3);
        else if (sub === '1' || path.includes('/ai-shopping-assistant') || pageParam === 'd2c-ai-shopping-assistant') setD2cSubPage(1);
        else setD2cSubPage(undefined);
      } else if (pageParam === 'distributors' || pageParam === 'distributors-ai-platform' || path === '/distributors-ai-platform' || path === '/distributors' || path === '/industries/distributors') {
        setCurrentView('distributors');
      } else if (pageParam === 'wholesalers' || pageParam === 'wholesalers-ai-platform' || pageParam === 'wholesale' || path === '/wholesalers-ai-platform' || path === '/wholesalers' || path === '/industries/wholesalers') {
        setCurrentView('wholesalers');
      } else if (
        pageParam === 'manufacturing' ||
        pageParam === 'manufacturing-ai-platform' ||
        pageParam === 'manufacturers' ||
        path === '/manufacturing' ||
        path === '/manufacturing-ai-platform' ||
        path === '/industries/manufacturing' ||
        path.startsWith('/industries/')
      ) {
        setCurrentView('manufacturing');
      } else {
        setCurrentView('home');
      }

      if (path.startsWith('/use-cases/')) {
        setActiveUseCaseSlug(path.replace('/use-cases/', ''));
      } else {
        setActiveUseCaseSlug(null);
      }
      setActiveIndustryId(params.get('industry'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const page = new URLSearchParams(window.location.search).get('page');
    if (path === '/pricing' || hash === '#pricing' || page === 'pricing') {
      const scrollTimer = setTimeout(() => {
        const el = document.getElementById('pricing');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 350);
      return () => clearTimeout(scrollTimer);
    }
  }, []);

  const handleNavigateSector = (sectorSlug: string = 'boutiques') => {
    setActiveSectorSlug(sectorSlug);
    setCurrentView('sector-landing');
    window.history.pushState(null, '', `?sector=${sectorSlug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateContactUs = () => {
    setCurrentView('contact-us');
    window.history.pushState(null, '', '?page=contact-us');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateAbout = () => {
    setCurrentView('about');
    window.history.pushState(null, '', '?page=about');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateWhyChooseUs = () => {
    setCurrentView('why-choose-us');
    window.history.pushState(null, '', '?page=why-choose-us');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateShopifyComparison = () => {
    setCurrentView('shopify-comparison');
    window.history.pushState(null, '', '?page=shopify-vs-silarai');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateWoocommerceComparison = () => {
    setCurrentView('woocommerce-comparison');
    window.history.pushState(null, '', '?page=woocommerce-vs-silarai');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateRetailCommerce = () => {
    setCurrentView('retail-commerce');
    window.history.pushState(null, '', '?page=retail-commerce');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateD2cCommerce = (sectionIdOrPage?: string | number) => {
    setCurrentView('d2c-brands');
    if (sectionIdOrPage === 1 || sectionIdOrPage === 'shopping-assistant' || sectionIdOrPage === 'ai-shopping-assistant') {
      setD2cSubPage(1);
      window.history.pushState(null, '', '/industries/d2c-brands/ai-shopping-assistant');
      setTimeout(() => {
        const el = document.getElementById('shopping-assistant');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else if (sectionIdOrPage === 2 || sectionIdOrPage === 'commerce-platform' || sectionIdOrPage === 'ai-commerce-platform') {
      setD2cSubPage(2);
      window.history.pushState(null, '', '/industries/d2c-brands/ai-commerce-platform');
      setTimeout(() => {
        const el = document.getElementById('commerce-platform');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else if (sectionIdOrPage === 3 || sectionIdOrPage === 'increase-sales' || sectionIdOrPage === 'increase-sales-with-ai') {
      setD2cSubPage(3);
      window.history.pushState(null, '', '/industries/d2c-brands/increase-sales-with-ai');
      setTimeout(() => {
        const el = document.getElementById('increase-sales');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      setD2cSubPage(undefined);
      window.history.pushState(null, '', '/industries/d2c-brands');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateDistributors = () => {
    setCurrentView('distributors');
    window.history.pushState(null, '', '?page=distributors');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateWholesalers = () => {
    setCurrentView('wholesalers');
    window.history.pushState(null, '', '?page=wholesalers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateManufacturing = (pageNumber?: number) => {
    setCurrentView('manufacturing');
    const sub = pageNumber || 1;
    setManufacturingSubPage(sub);
    if (sub === 2) {
      window.history.pushState(null, '', '/industries/manufacturing/ai-shopping-sales-assistant');
    } else if (sub === 3) {
      window.history.pushState(null, '', '/industries/manufacturing/dealer-distributor-commerce');
    } else {
      window.history.pushState(null, '', '/industries/manufacturing/ai-commerce-platform');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateFmcgCommerce = () => {
    setCurrentView('fmcg-commerce');
    window.history.pushState(null, '', '?page=fmcg-commerce');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAiShoppingPage = (pageId: AiShoppingPageId) => {
    setAiShoppingSubPage(pageId);
    setCurrentView('ai-shopping-assistant');
    window.history.pushState(null, '', `?page=ai-shopping-assistant&subPage=${pageId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAiCommercePage = (pageId: AiCommercePageId) => {
    setAiCommerceSubPage(pageId);
    setCurrentView('ai-commerce-platform');
    window.history.pushState(null, '', `?page=ai-commerce-platform&subPage=${pageId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateAiCommerceMarketingPlatform = () => {
    setCurrentView('ai-commerce-marketing-platform');
    window.history.pushState(null, '', '/ai-commerce-marketing-platform/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    window.history.pushState(null, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateUniversal = (view: string, options?: { pageId?: number; subPageId?: number; section?: string }) => {
    if (view === 'home') {
      handleBackToHome();
    } else if (view === 'about') {
      handleNavigateAbout();
    } else if (view === 'why-choose-us') {
      handleNavigateWhyChooseUs();
    } else if (view === 'shopify-comparison') {
      handleNavigateShopifyComparison();
    } else if (view === 'woocommerce-comparison') {
      handleNavigateWoocommerceComparison();
    } else if (view === 'ai-commerce-marketing-platform') {
      handleNavigateAiCommerceMarketingPlatform();
    } else if (view === 'ai-shopping-assistant') {
      handleSelectAiShoppingPage((options?.pageId || 1) as AiShoppingPageId);
    } else if (view === 'ai-commerce-platform') {
      handleSelectAiCommercePage((options?.pageId || 1) as AiCommercePageId);
    } else if (view === 'retail-commerce') {
      handleNavigateRetailCommerce();
    } else if (view === 'd2c-brands') {
      handleNavigateD2cCommerce(options?.subPageId || options?.section);
    } else if (view === 'distributors') {
      handleNavigateDistributors();
    } else if (view === 'wholesalers') {
      handleNavigateWholesalers();
    } else if (view === 'manufacturing') {
      handleNavigateManufacturing(options?.pageId);
    } else if (view === 'fmcg-commerce' || view === 'fmcg') {
      handleNavigateFmcgCommerce();
    } else if (view === 'contact-us') {
      handleNavigateContactUs();
    } else if (view === 'sector-landing' || view === 'boutiques' || view.startsWith('sector:')) {
      const slug = view.startsWith('sector:') ? view.replace('sector:', '') : (view === 'boutiques' ? 'boutiques' : 'boutiques');
      handleNavigateSector(slug);
    } else {
      handleBackToHome();
    }
  };

  const handleSelectIndustry = (id: string | null) => {
    if (id === 'retailers') {
      handleNavigateRetailCommerce();
      return;
    }
    if (id === 'd2c' || id === 'd2c-brands') {
      handleNavigateD2cCommerce();
      return;
    }
    if (id === 'distributors' || id === 'b2b-distributors') {
      handleNavigateDistributors();
      return;
    }
    if (id === 'wholesalers' || id === 'wholesaler' || id === 'wholesale') {
      handleNavigateWholesalers();
      return;
    }
    if (id === 'manufacturing' || id === 'manufacturers' || id === 'industrial-manufacturing' || id === 'industrial') {
      handleNavigateManufacturing();
      return;
    }
    if (id === 'fmcg' || id === 'fmcg-brands' || id === 'fmcg-commerce' || id === 'cpg') {
      handleNavigateFmcgCommerce();
      return;
    }
    if (id === 'boutiques' || id === 'b2b2c' || id === 'jeweller' || id === 'home-sellers' || id === 'beauty-brands' || id === 'food-packaging' || id === 'handicrafts' || id === 'cosmetic-wellness' || id === 'small-medium-fmcg') {
      handleNavigateSector(id);
      return;
    }
    setActiveIndustryId(id);
    if (currentView !== 'home') {
      setCurrentView('home');
      window.history.pushState(null, '', window.location.pathname);
    }
    if (id) {
      setTimeout(() => scrollToSection('industries'), 50);
    }
  };

  const handleOpenDemo = (plan?: string) => {
    setSelectedPlan(plan);
    setDemoModalOpen(true);
  };

  const scrollToSection = (id: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      window.history.pushState(null, '', window.location.pathname);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 100);
      return;
    }

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
  };

  const handleSelectUseCase = (slug: string | null) => {
    setActiveUseCaseSlug(slug);
    if (currentView !== 'home') {
      setCurrentView('home');
    }
    if (slug) {
      window.history.pushState(null, '', `/use-cases/${slug}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.history.pushState(null, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogin = () => {
    window.location.href = 'https://app.silarai.com/login';
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Dynamic SEO Head Manager */}
      <Suspense fallback={null}>
        <SeoHead
          currentView={currentView}
          activeSectorSlug={activeSectorSlug}
          activeUseCaseSlug={activeUseCaseSlug || undefined}
          aiShoppingSubPage={aiShoppingSubPage}
          aiCommerceSubPage={aiCommerceSubPage}
          d2cSubPage={d2cSubPage}
          manufacturingSubPage={manufacturingSubPage}
        />
      </Suspense>

      {/* Sticky Top Navigation */}
      <Navbar
        onBookDemo={() => handleOpenDemo()}
        onWatchTour={() => setTourModalOpen(true)}
        onLogin={handleLogin}
        onSelectIndustry={(id) => handleSelectIndustry(id)}
        onSelectUseCase={(slug) => handleSelectUseCase(slug)}
        onNavigateAbout={handleNavigateAbout}
        onNavigateWhyChooseUs={handleNavigateWhyChooseUs}
        onNavigateShopifyComparison={handleNavigateShopifyComparison}
        onNavigateWoocommerceComparison={handleNavigateWoocommerceComparison}
        onNavigateAiCommerceMarketingPlatform={handleNavigateAiCommerceMarketingPlatform}
        onSelectAiShoppingPage={(id) => handleSelectAiShoppingPage(id)}
        onSelectAiCommercePage={(id) => handleSelectAiCommercePage(id)}
        onSelectD2cPage={(id) => handleNavigateD2cCommerce(id)}
        onSelectManufacturingPage={(id) => handleNavigateManufacturing(id)}
        onOpenAiDiscoveryModal={() => setAiDiscoveryModalOpen(true)}
        onGoHome={handleBackToHome}
      />

      <main id="main-content" itemScope itemType="https://schema.org/WebPage">
        <Suspense fallback={<PageLoadingFallback />}>
          {currentView === 'contact-us' ? (
            <ContactUsPage
              onBackToHome={handleBackToHome}
              onRequestDemoModal={(plan) => handleOpenDemo(plan)}
            />
          ) : currentView === 'about' ? (
            <AboutPage
              onBackToHome={handleBackToHome}
              onBookDemo={(plan) => handleOpenDemo(plan)}
            />
          ) : currentView === 'why-choose-us' ? (
            <WhyChoosePage
              onBackToHome={handleBackToHome}
              onBookDemo={(plan) => handleOpenDemo(plan)}
            />
          ) : currentView === 'shopify-comparison' ? (
            <ShopifyComparisonPage
              onBackToHome={handleBackToHome}
              onBookDemo={(plan) => handleOpenDemo(plan)}
            />
          ) : currentView === 'woocommerce-comparison' ? (
            <WoocommerceComparisonPage
              onBackToHome={handleBackToHome}
              onBookDemo={(plan) => handleOpenDemo(plan)}
            />
          ) : currentView === 'ai-commerce-marketing-platform' ? (
            <AiCommerceMarketingPlatformPage
              onNavigateView={(view, options) => {
                if (view === 'home') {
                  handleBackToHome();
                } else if (view === 'ai-shopping-assistant') {
                  handleSelectAiShoppingPage((options?.pageId || 1) as AiShoppingPageId);
                } else if (view === 'ai-commerce-platform') {
                  handleSelectAiCommercePage((options?.pageId || 1) as AiCommercePageId);
                } else if (view === 'retail-commerce') {
                  handleNavigateRetailCommerce();
                } else if (view === 'd2c-brands') {
                  handleNavigateD2cCommerce(options?.subPageId);
                } else if (view === 'distributors') {
                  handleNavigateDistributors();
                } else if (view === 'wholesalers') {
                  handleNavigateWholesalers();
                } else if (view === 'manufacturing') {
                  handleNavigateManufacturing(options?.pageId);
                } else if (view === 'fmcg-commerce' || view === 'fmcg') {
                  handleNavigateFmcgCommerce();
                } else if (view === 'shopify-comparison') {
                  handleNavigateShopifyComparison();
                } else if (view === 'woocommerce-comparison') {
                  handleNavigateWoocommerceComparison();
                } else if (view === 'why-choose-us') {
                  handleNavigateWhyChooseUs();
                } else if (view === 'about') {
                  handleNavigateAbout();
                } else {
                  handleBackToHome();
                }
              }}
              onBookDemo={(plan) => handleOpenDemo(plan)}
              onOpenAiDiscovery={() => setAiDiscoveryModalOpen(true)}
            />
          ) : currentView === 'ai-shopping-assistant' ? (
            <AiShoppingAssistantPages
              activePage={aiShoppingSubPage}
              onSelectPage={(id) => handleSelectAiShoppingPage(id)}
              onBackToHome={handleBackToHome}
              onBookDemo={(plan) => handleOpenDemo(plan)}
            />
          ) : currentView === 'ai-commerce-platform' ? (
            <AiCommercePlatformPages
              activePage={aiCommerceSubPage}
              onSelectPage={(id) => handleSelectAiCommercePage(id)}
              onNavigateAiAssistantPage={(id) => handleSelectAiShoppingPage(id)}
              onBackToHome={handleBackToHome}
              onBookDemo={(plan) => handleOpenDemo(plan)}
            />
          ) : currentView === 'retail-commerce' ? (
            <RetailIndustryPage
              onBackToHome={handleBackToHome}
              onBookDemo={(plan) => handleOpenDemo(plan)}
            />
          ) : currentView === 'd2c-brands' ? (
            <D2cIndustryPage
              onBackToHome={handleBackToHome}
              onBookDemo={(plan) => handleOpenDemo(plan)}
              onNavigateAiShoppingAssistant={(subPage) => handleSelectAiShoppingPage((subPage || 1) as AiShoppingPageId)}
              onNavigateAiCommercePlatform={(subPage) => handleSelectAiCommercePage((subPage || 1) as AiCommercePageId)}
              onNavigateD2cSection={(sectionOrPage) => handleNavigateD2cCommerce(sectionOrPage)}
              initialSection={d2cSubPage === 1 ? 'shopping-assistant' : d2cSubPage === 2 ? 'commerce-platform' : d2cSubPage === 3 ? 'increase-sales' : undefined}
            />
          ) : currentView === 'distributors' ? (
            <DistributorsIndustryPage
              onBackToHome={handleBackToHome}
              onBookDemo={(plan) => handleOpenDemo(plan)}
            />
          ) : currentView === 'wholesalers' ? (
            <WholesalersIndustryPage
              onBackToHome={handleBackToHome}
              onBookDemo={(plan) => handleOpenDemo(plan)}
            />
          ) : currentView === 'manufacturing' ? (
            <ManufacturingIndustryPage
              onBackToHome={handleBackToHome}
              onBookDemo={(plan) => handleOpenDemo(plan)}
              activeSubPage={manufacturingSubPage}
              onSelectSubPage={(id) => handleNavigateManufacturing(id)}
            />
          ) : currentView === 'fmcg-commerce' || currentView === 'fmcg' ? (
            <FmcgIndustryPage
              onBackToHome={handleBackToHome}
              onBookDemo={(plan) => handleOpenDemo(plan)}
            />
          ) : currentView === 'sector-landing' ? (
            <SectorLandingPage
              initialSectorSlug={activeSectorSlug}
              onBackToHome={handleBackToHome}
              onBookDemo={(plan) => handleOpenDemo(plan)}
              onNavigateAiShoppingAssistant={(subPage) => handleSelectAiShoppingPage((subPage || 1) as AiShoppingPageId)}
              onNavigateAiCommercePlatform={(subPage) => handleSelectAiCommercePage((subPage || 1) as AiCommercePageId)}
              onSelectSector={(slug) => {
                setActiveSectorSlug(slug);
                window.history.pushState(null, '', `?sector=${slug}`);
              }}
            />
          ) : (
            <div className="relative overflow-hidden">
              {/* Continuous Silky 3D Contour Waves & Ambient Peach Aura from start to end of website */}
              <SmoothWaveBackground isHeroOnly={false} />

              <div className="relative z-10">
                {/* Hero Section */}
                <HeroSection
                  onBookDemo={() => handleOpenDemo()}
                  onWatchTour={() => setTourModalOpen(true)}
                  onLogin={handleLogin}
                  onSelectSector={handleNavigateSector}
                  showBackground={false}
                />

              {/* Sticky Quick-Jump Navigation & Back-to-Top Indicator */}
              <SectionQuickNav />

              {/* Two Core Products */}
              <DeferredSection minHeight="450px" id="products">
                <Suspense fallback={<SectionLoadingFallback />}>
                  <ProductsSection
                    onLearnMoreAssistant={(subPage) => handleSelectAiShoppingPage((subPage || 1) as AiShoppingPageId)}
                    onExplorePlatform={(subPage) => handleSelectAiCommercePage((subPage || 1) as AiCommercePageId)}
                    onNavigateShopifyComparison={handleNavigateShopifyComparison}
                    onNavigateWoocommerceComparison={handleNavigateWoocommerceComparison}
                    onSelectD2cPage={(id) => handleNavigateD2cCommerce(id)}
                    onSelectManufacturingPage={(id) => handleNavigateManufacturing(id)}
                  />
                </Suspense>
              </DeferredSection>

              {/* How It Works - Workflow for AI Commerce Platform */}
              <DeferredSection minHeight="400px" id="how-it-works">
                <Suspense fallback={<SectionLoadingFallback />}>
                  <HowItWorks onBookDemo={(plan) => handleOpenDemo(plan)} />
                </Suspense>
              </DeferredSection>

              {/* Everything in One Place - All Tools Suite with Integrated Domain Tester */}
              <DeferredSection minHeight="400px" id="all-in-one">
                <Suspense fallback={<SectionLoadingFallback />}>
                  <AllInOneSection onBookDemo={(plan) => handleOpenDemo(plan)} />
                </Suspense>
              </DeferredSection>

              {/* Trusted Integrations Logo Bar */}
              <DeferredSection minHeight="200px" id="integrations">
                <Suspense fallback={<SectionLoadingFallback />}>
                  <TrustedIntegrations onBookDemo={(plan) => handleOpenDemo(plan)} />
                </Suspense>
              </DeferredSection>

              {/* Tailored Industries */}
              <DeferredSection minHeight="450px" id="industries">
                <Suspense fallback={<SectionLoadingFallback />}>
                  <IndustriesSection
                    onBookDemo={(ind) => handleOpenDemo(ind)}
                    activeIndustryId={activeIndustryId}
                    onSelectIndustry={(id) => handleSelectIndustry(id)}
                  />
                </Suspense>
              </DeferredSection>

              {/* The SilarAI Advantage: Unified Comparison & Pain Points Solved */}
              <DeferredSection minHeight="400px" id="why-silarai">
                <Suspense fallback={<SectionLoadingFallback />}>
                  <WhySilarAi onOpenFullPage={handleNavigateWhyChooseUs} />
                </Suspense>
              </DeferredSection>

              {/* Customer Metrics & Growth Cards */}
              <DeferredSection minHeight="300px" id="metrics">
                <Suspense fallback={<SectionLoadingFallback />}>
                  <CustomerMetrics />
                </Suspense>
              </DeferredSection>

              {/* AI Commerce Use Cases */}
              <DeferredSection minHeight="400px" id="use-cases">
                <Suspense fallback={<SectionLoadingFallback />}>
                  <UseCasesSection
                    onBookDemo={(title) => handleOpenDemo(title)}
                    activeSlug={activeUseCaseSlug}
                    onSelectUseCase={(slug) => handleSelectUseCase(slug)}
                  />
                </Suspense>
              </DeferredSection>

              {/* Interactive Pricing & ROI Estimator */}
              <DeferredSection minHeight="500px" id="pricing">
                <Suspense fallback={<SectionLoadingFallback />}>
                  <PricingSection onSelectPlan={(plan) => handleOpenDemo(plan)} />
                </Suspense>
              </DeferredSection>

              {/* Accordion FAQ */}
              <DeferredSection minHeight="400px" id="faq">
                <Suspense fallback={<SectionLoadingFallback />}>
                  <FaqSection />
                </Suspense>
              </DeferredSection>

              {/* Final Conversion CTA */}
              <DeferredSection minHeight="300px" id="cta">
                <Suspense fallback={<SectionLoadingFallback />}>
                  <FinalCta
                    onBookDemo={() => handleOpenDemo()}
                    onTalkToSales={() => handleOpenDemo('Enterprise')}
                  />
                </Suspense>
              </DeferredSection>
              </div>
            </div>
          )}
        </Suspense>

        {/* Topical Internal Link Architecture: Exactly 8 Curated Nodes per Page (Machine & Crawler Layer) */}
        <Suspense fallback={null}>
          <InternalLinkingSection
            currentPage={currentView}
            onNavigate={handleNavigateUniversal}
          />
        </Suspense>

        {/* Dynamic SEO Meta Snippet & Head Tags Sync across All Sections (Machine & Crawler Layer) */}
        <Suspense fallback={null}>
          <SectionSeoMetaSnippet
            currentView={currentView}
            subPage={
              currentView === 'ai-shopping-assistant'
                ? aiShoppingSubPage
                : currentView === 'ai-commerce-platform'
                ? aiCommerceSubPage
                : currentView === 'd2c-brands'
                ? d2cSubPage
                : currentView === 'manufacturing'
                ? manufacturingSubPage
                : undefined
            }
          />
        </Suspense>
      </main>

      {/* Dark Footer */}
      <DeferredSection minHeight="300px" id="footer">
        <Suspense fallback={<SectionLoadingFallback />}>
          <Footer
            onSelectIndustry={(id) => handleSelectIndustry(id)}
            onSelectUseCase={(slug) => handleSelectUseCase(slug)}
            onNavigateAbout={handleNavigateAbout}
            onNavigateWhyChooseUs={handleNavigateWhyChooseUs}
            onNavigateShopifyComparison={handleNavigateShopifyComparison}
            onNavigateWoocommerceComparison={handleNavigateWoocommerceComparison}
            onNavigateAiCommerceMarketingPlatform={handleNavigateAiCommerceMarketingPlatform}
            onSelectAiShoppingPage={(id) => handleSelectAiShoppingPage(id)}
            onSelectAiCommercePage={(id) => handleSelectAiCommercePage(id)}
            onSelectD2cPage={(id) => handleNavigateD2cCommerce(id)}
            onSelectManufacturingPage={(id) => handleNavigateManufacturing(id)}
            onOpenAiDiscoveryModal={() => setAiDiscoveryModalOpen(true)}
            onNavigateContactUs={handleNavigateContactUs}
            onGoHome={handleBackToHome}
          />
        </Suspense>
      </DeferredSection>

      {/* Interactive Modals (Code-split and rendered only on user action) */}
      <Suspense fallback={null}>
        {demoModalOpen && (
          <BookDemoModal
            isOpen={demoModalOpen}
            onClose={() => setDemoModalOpen(false)}
            preselectedPlan={selectedPlan}
          />
        )}

        {tourModalOpen && (
          <ProductTourModal
            isOpen={tourModalOpen}
            onClose={() => setTourModalOpen(false)}
            onBookDemo={() => handleOpenDemo()}
          />
        )}

        {/* AI Discovery Hub Modal (RAG & AEO) */}
        {aiDiscoveryModalOpen && (
          <AiDiscoveryModal
            isOpen={aiDiscoveryModalOpen}
            onClose={() => setAiDiscoveryModalOpen(false)}
          />
        )}

        {/* Floating AI Shopping Assistant Widget (Deferred until idle or interaction) */}
        {showFloatingWidget && <FloatingAiAssistantWidget />}
      </Suspense>
    </div>
  );
}
