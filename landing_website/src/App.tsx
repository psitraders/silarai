import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TrustedIntegrations } from './components/TrustedIntegrations';
import { ProblemsSection } from './components/ProblemsSection';
import { ProductsSection } from './components/ProductsSection';
import { HowItWorks } from './components/HowItWorks';
import { IndustriesSection } from './components/IndustriesSection';
import { WhySilarAi } from './components/WhySilarAi';
import { CustomerMetrics } from './components/CustomerMetrics';
import { UseCasesSection } from './components/UseCasesSection';
import { PricingSection } from './components/PricingSection';
import { FaqSection } from './components/FaqSection';
import { FinalCta } from './components/FinalCta';
import { Footer } from './components/Footer';
import { BookDemoModal } from './components/BookDemoModal';
import { ProductTourModal } from './components/ProductTourModal';
import { FloatingAiAssistantWidget } from './components/FloatingAiAssistantWidget';
import { AboutPage } from './components/AboutPage';
import { WhyChoosePage } from './components/WhyChoosePage';
import { ShopifyComparisonPage } from './components/ShopifyComparisonPage';
import { WoocommerceComparisonPage } from './components/WoocommerceComparisonPage';
import { AiShoppingAssistantPages, AiShoppingPageId } from './components/AiShoppingAssistantPages';
import { AiCommercePlatformPages, AiCommercePageId } from './components/AiCommercePlatformPages';
import { D2cPageId } from './types';
import { RetailIndustryPage } from './components/RetailIndustryPage';
import { D2cIndustryPage } from './components/D2cIndustryPage';
import { DistributorsIndustryPage } from './components/DistributorsIndustryPage';
import { WholesalersIndustryPage } from './components/WholesalersIndustryPage';
import { ManufacturingIndustryPage } from './components/ManufacturingIndustryPage';
import { FmcgIndustryPage } from './components/FmcgIndustryPage';
import { SeoHead } from './components/SeoHead';
import { AiDiscoveryModal } from './components/AiDiscoveryModal';

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
    'home' | 'about' | 'ai-shopping-assistant' | 'ai-commerce-platform' | 'why-choose-us' | 'shopify-comparison' | 'woocommerce-comparison' | 'retail-commerce' | 'd2c-brands' | 'distributors' | 'wholesalers' | 'manufacturing' | 'fmcg-commerce' | 'fmcg'
  >(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    const pageParam = params.get('page');

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
    if (pageParam === 'ai-shopping-assistant' || path === '/ai-shopping-assistant' || path === '/ai-sales-assistant' || pageParam === 'ai-sales-assistant') {
      return 'ai-shopping-assistant';
    }
    if (
      pageParam === 'ai-commerce-platform' ||
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
    if (pageParam === 'fmcg' || pageParam === 'fmcg-commerce' || pageParam === 'fmcg-brands' || pageParam === 'cpg' || path === '/fmcg-commerce' || path === '/fmcg' || path === '/industries/fmcg') {
      return 'fmcg-commerce';
    }
    if (pageParam === 'retail-commerce' || pageParam === 'retail-ai-platform' || path === '/retail-ai-platform' || path === '/industries/retailers') {
      return 'retail-commerce';
    }
    if (
      pageParam === 'd2c-brands' ||
      pageParam === 'd2c-ai-platform' ||
      pageParam === 'd2c' ||
      path === '/d2c-ai-platform' ||
      path === '/industries/d2c-brands' ||
      path.startsWith('/industries/d2c-brands/') ||
      pageParam === 'd2c-ai-shopping-assistant' ||
      pageParam === 'd2c-ai-commerce-platform' ||
      pageParam === 'd2c-increase-sales'
    ) {
      return 'd2c-brands';
    }
    if (pageParam === 'distributors' || pageParam === 'distributors-ai-platform' || path === '/distributors-ai-platform' || path === '/industries/distributors') {
      return 'distributors';
    }
    if (pageParam === 'wholesalers' || pageParam === 'wholesalers-ai-platform' || pageParam === 'wholesale' || path === '/wholesalers-ai-platform' || path === '/industries/wholesalers') {
      return 'wholesalers';
    }
    if (
      pageParam === 'manufacturing' ||
      pageParam === 'manufacturing-ai-platform' ||
      pageParam === 'manufacturers' ||
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

  const [activeIndustryId, setActiveIndustryId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('industry');
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page');

      if (pageParam === 'about' || path === '/about') {
        setCurrentView('about');
      } else if (pageParam === 'why-choose-us' || path === '/why-choose-us') {
        setCurrentView('why-choose-us');
      } else if (pageParam === 'shopify-comparison' || pageParam === 'shopify-vs-silarai' || path === '/shopify-vs-silarai' || path === '/integrations/shopify') {
        setCurrentView('shopify-comparison');
      } else if (pageParam === 'woocommerce-comparison' || pageParam === 'woocommerce-vs-silarai' || path === '/woocommerce-vs-silarai' || path === '/integrations/woocommerce') {
        setCurrentView('woocommerce-comparison');
      } else if (pageParam === 'ai-shopping-assistant' || path === '/ai-shopping-assistant' || path === '/ai-sales-assistant' || pageParam === 'ai-sales-assistant') {
        setCurrentView('ai-shopping-assistant');
        const sub = params.get('subPage');
        if (sub === '2') setAiShoppingSubPage(2);
        else if (sub === '3') setAiShoppingSubPage(3);
        else setAiShoppingSubPage(1);
      } else if (
        pageParam === 'ai-commerce-platform' ||
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
      } else if (pageParam === 'fmcg' || pageParam === 'fmcg-commerce' || pageParam === 'fmcg-brands' || pageParam === 'cpg' || path === '/fmcg-commerce' || path === '/fmcg' || path === '/industries/fmcg') {
        setCurrentView('fmcg-commerce');
      } else if (pageParam === 'retail-commerce' || pageParam === 'retail-ai-platform' || path === '/retail-ai-platform' || path === '/industries/retailers') {
        setCurrentView('retail-commerce');
      } else if (
        pageParam === 'd2c-brands' ||
        pageParam === 'd2c-ai-platform' ||
        pageParam === 'd2c' ||
        path === '/d2c-ai-platform' ||
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
      } else if (pageParam === 'distributors' || pageParam === 'distributors-ai-platform' || path === '/distributors-ai-platform' || path === '/industries/distributors') {
        setCurrentView('distributors');
      } else if (pageParam === 'wholesalers' || pageParam === 'wholesalers-ai-platform' || pageParam === 'wholesale' || path === '/wholesalers-ai-platform' || path === '/industries/wholesalers') {
        setCurrentView('wholesalers');
      } else if (
        pageParam === 'manufacturing' ||
        pageParam === 'manufacturing-ai-platform' ||
        pageParam === 'manufacturers' ||
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

  const handleBackToHome = () => {
    setCurrentView('home');
    window.history.pushState(null, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <SeoHead
        currentView={currentView}
        aiShoppingSubPage={aiShoppingSubPage}
        aiCommerceSubPage={aiCommerceSubPage}
        d2cSubPage={d2cSubPage}
        manufacturingSubPage={manufacturingSubPage}
      />

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
        onSelectAiShoppingPage={(id) => handleSelectAiShoppingPage(id)}
        onSelectAiCommercePage={(id) => handleSelectAiCommercePage(id)}
        onSelectD2cPage={(id) => handleNavigateD2cCommerce(id)}
        onSelectManufacturingPage={(id) => handleNavigateManufacturing(id)}
        onOpenAiDiscoveryModal={() => setAiDiscoveryModalOpen(true)}
        onGoHome={handleBackToHome}
      />

      <main id="main-content" itemScope itemType="https://schema.org/WebPage">
        {currentView === 'about' ? (
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
        ) : (
          <>
            {/* Hero Section */}
            <HeroSection
              onBookDemo={() => handleOpenDemo()}
              onWatchTour={() => setTourModalOpen(true)}
              onLogin={handleLogin}
            />

            {/* Two Core Products */}
            <ProductsSection
              onLearnMoreAssistant={() => handleSelectAiShoppingPage(1)}
              onExplorePlatform={() => handleSelectAiCommercePage(1)}
            />

            {/* Trusted Integrations Logo Bar */}
            <TrustedIntegrations onBookDemo={(plan) => handleOpenDemo(plan)} />

            {/* Problems & SilarAI Advantage */}
            <ProblemsSection />

            {/* How It Works Timeline */}
            <HowItWorks />

            {/* Tailored Industries */}
            <IndustriesSection
              onBookDemo={(ind) => handleOpenDemo(ind)}
              activeIndustryId={activeIndustryId}
              onSelectIndustry={(id) => handleSelectIndustry(id)}
            />

            {/* Why SilarAI Comparison Table */}
            <WhySilarAi onOpenFullPage={handleNavigateWhyChooseUs} />

            {/* Customer Metrics & Growth Cards */}
            <CustomerMetrics />

            {/* AI Commerce Use Cases */}
            <UseCasesSection
              onBookDemo={(title) => handleOpenDemo(title)}
              activeSlug={activeUseCaseSlug}
              onSelectUseCase={(slug) => handleSelectUseCase(slug)}
            />

            {/* Interactive Pricing & ROI Estimator */}
            <PricingSection onSelectPlan={(plan) => handleOpenDemo(plan)} />

            {/* Accordion FAQ */}
            <FaqSection />

            {/* Final Conversion CTA */}
            <FinalCta
              onBookDemo={() => handleOpenDemo()}
              onTalkToSales={() => handleOpenDemo('Enterprise')}
            />
          </>
        )}
      </main>

      {/* Dark Footer */}
      <Footer
        onSelectIndustry={(id) => handleSelectIndustry(id)}
        onSelectUseCase={(slug) => handleSelectUseCase(slug)}
        onNavigateAbout={handleNavigateAbout}
        onNavigateWhyChooseUs={handleNavigateWhyChooseUs}
        onNavigateShopifyComparison={handleNavigateShopifyComparison}
        onNavigateWoocommerceComparison={handleNavigateWoocommerceComparison}
        onSelectAiShoppingPage={(id) => handleSelectAiShoppingPage(id)}
        onSelectAiCommercePage={(id) => handleSelectAiCommercePage(id)}
        onSelectD2cPage={(id) => handleNavigateD2cCommerce(id)}
        onSelectManufacturingPage={(id) => handleNavigateManufacturing(id)}
        onOpenAiDiscoveryModal={() => setAiDiscoveryModalOpen(true)}
        onGoHome={handleBackToHome}
      />

      {/* Interactive Modals */}
      <BookDemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        preselectedPlan={selectedPlan}
      />

      <ProductTourModal
        isOpen={tourModalOpen}
        onClose={() => setTourModalOpen(false)}
        onBookDemo={() => handleOpenDemo()}
      />

      {/* AI Discovery Hub Modal (RAG & AEO) */}
      <AiDiscoveryModal
        isOpen={aiDiscoveryModalOpen}
        onClose={() => setAiDiscoveryModalOpen(false)}
      />

      {/* Floating AI Shopping Assistant Widget */}
      <FloatingAiAssistantWidget />
    </div>
  );
}
