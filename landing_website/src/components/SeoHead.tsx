import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { findSeoMetaEntry, SeoMetaRow } from '../data/seoMetaTable';
import { SECTORS } from '../data/sectors';
import { CONTACT_EMAIL } from '../config/forms';

// Canonical origin for all metadata. Apex only — www.silarai.com does not resolve.
const CANONICAL_HOST = 'https://silarai.com';

// Canonical URL per view, matching seoMetaTable and the sitemap (apex, no trailing
// slash). Replaces the AI Studio export's src/lib/canonicalUrls.ts, which is not
// ported (it targets the www host with trailing slashes — see PORTING.md).
const CANONICAL_PATHS: Record<string, string> = {
  home: '/',
  'ai-shopping-assistant': '/ai-shopping-assistant',
  'ai-commerce-platform': '/commerce-platform',
  'ai-commerce-marketing-platform': '/ai-commerce-marketing-platform/',
  pricing: '/pricing',
  'launch-online-store': '/launch-online-store',
  about: '/about',
  'contact-us': '/contact-us',
  'why-choose-us': '/why-choose-us',
  'shopify-comparison': '/shopify-vs-silarai',
  'shopify-ai-shopping-assistant': '/shopify-ai-shopping-assistant',
  'woocommerce-comparison': '/woocommerce-vs-silarai',
  distributors: '/industries/distributors',
  fmcg: '/industries/fmcg',
  'fmcg-commerce': '/industries/fmcg',
  'fmcg-retailer-ordering-solution': '/industries/fmcg/retailer-ordering-solution',
  ecommerce: '/industries/ecommerce',
  'd2c-brands': '/industries/d2c-brands',
  manufacturing: '/industries/manufacturing',
  'retail-commerce': '/industries/retailers',
  wholesalers: '/industries/wholesalers',
};
const getCanonicalUrlForView = (view: string): string =>
  `${CANONICAL_HOST}${CANONICAL_PATHS[view] ?? '/'}`;

export type CtrVariantStyle = 'direct' | 'metric' | 'urgency';

export interface DynamicSubPageMetaResult {
  isSubPage: boolean;
  metaDescription: string;
  charCount: number;
  isUnder60Chars: boolean;
  activeVariant: CtrVariantStyle;
  variants: Record<CtrVariantStyle, string>;
  matchedEntry?: SeoMetaRow;
  primaryKeyword?: string;
  ctrHook?: string;
  sectionTitle?: string;
  canonicalUrl?: string;
  setVariant: (variant: CtrVariantStyle) => void;
  cycleVariant: () => void;
}

export interface SubPageMetaHookOptions {
  currentView: string;
  activeSectorSlug?: string;
  aiShoppingSubPage?: number;
  aiCommerceSubPage?: number;
  d2cSubPage?: number;
  manufacturingSubPage?: number;
  preferredVariant?: CtrVariantStyle;
}

// Master dictionary of tested, high-CTR sub-page meta descriptions strictly under 60 characters
export const SUBPAGE_CTR_VARIANTS: Record<string, Record<CtrVariantStyle, string>> = {
  // Sector Landing high-CTR variants (<60 chars)
  'sector-landing-boutiques': {
    direct: 'Launch boutique store in 3 hrs with AI Stylist & B2B2C.',
    metric: '+44.8% boutique conversion lift with AI Personal Stylist.',
    urgency: 'Launch boutique & B2B2C store in 3 hours with SilarAI.',
  },
  'sector-landing-b2b2c': {
    direct: 'Launch B2B2C store in 4 hrs with dual wholesale & retail.',
    metric: 'B2B2C multi-tier pricing with sub-50ms checkout engine.',
    urgency: 'Launch turnkey dual-channel B2B2C store in 4 hours today.',
  },
  'sector-landing-jeweller': {
    direct: 'Luxury jewellery AI store with 4Cs diamond assistant.',
    metric: '+38% high-ticket conversion with 4Cs diamond advisory.',
    urgency: 'Launch luxury jewellery store with AI consultation in 4h.',
  },
  'sector-landing-home-sellers': {
    direct: 'Furniture & home decor AI store with dimension matching.',
    metric: 'Cut returns by 40% with AI room dimension fit assistant.',
    urgency: 'Launch home decor online store in 4 hours with SilarAI.',
  },
  'sector-landing-beauty-brands': {
    direct: 'Beauty & skincare AI store with custom routine quiz.',
    metric: '+42% AOV boost with AI skin diagnostics & routine builder.',
    urgency: 'Deploy clean beauty & skincare AI storefront in 3 hours.',
  },
  'sector-landing-food-packaging': {
    direct: 'B2B food packaging store with bulk tier pricing & samples.',
    metric: 'Streamline restaurant supply orders with automated tiers.',
    urgency: 'Launch food packaging B2B storefront in 4 hours today.',
  },
  'sector-landing-handicrafts': {
    direct: 'Artisanal handicrafts AI store with custom order tools.',
    metric: '+35% custom craft orders with interactive AI estimator.',
    urgency: 'Bring artisan handicrafts global in under 3 hours now.',
  },
  'sector-landing-cosmetic-wellness': {
    direct: 'Wellness & personal care AI store with regimen bundles.',
    metric: 'Boost wellness bundle conversions by +32% with AI coach.',
    urgency: 'Launch cosmetics & wellness storefront in 3 hours flat.',
  },
  'sector-landing-small-medium-fmcg': {
    direct: 'FMCG AI commerce with WhatsApp reorder & case pack pricing.',
    metric: 'Cut FMCG distributor order cycles from days to minutes.',
    urgency: 'Deploy emerging FMCG store with WhatsApp reorders in 4h.',
  },
  'sector-landing-distributors': {
    direct: 'Distributor AI portal with live ERP & credit terms.',
    metric: 'Cut distributor order friction with sub-50ms bulk quotes.',
    urgency: 'Digitize trade distribution & dealer ordering in 4 hours.',
  },
  'sector-landing-wholesalers': {
    direct: 'High-volume wholesale AI portal with pallet tier pricing.',
    metric: 'Enforce MOQs & volume pricing with automated wholesale AI.',
    urgency: 'Launch digital cash & carry wholesale portal in 4 hours.',
  },

  // AI Shopping Assistant sub-pages
  'ai-shopping-assistant-1': {
    direct: '20+ language voice search AI. Instant 1-click checkout.', // 55 chars
    metric: 'Sub-second voice parsing AI. Convert shoppers 3x faster.', // 57 chars
    urgency: 'Enable voice & chat commerce today. 20+ languages ready.', // 57 chars
  },
  'ai-shopping-assistant-2': {
    direct: 'Snap photos to find exact catalog matches in under 200ms.', // 57 chars
    metric: '99.2% visual search match accuracy. Under 200ms discovery.', // 58 chars
    urgency: 'Turn shopper camera photos into instant sales in 200ms.', // 55 chars
  },
  'ai-shopping-assistant-3': {
    direct: '+28% AOV lift with AI recommendations & 1-click checkout.', // 57 chars
    metric: 'Lift basket size by +28% with autonomous agentic checkout.', // 58 chars
    urgency: 'Stop cart drop-offs with 1-click autonomous AI checkout.', // 57 chars
  },

  // AI Commerce Platform sub-pages
  'ai-commerce-platform-1': {
    direct: 'Sub-50ms AI dynamic pricing engine to maximize margins.', // 55 chars
    metric: 'Boost margins with sub-50ms real-time AI repricing.', // 52 chars
    urgency: 'Automate competitor price tracking & dynamic margin lift.', // 57 chars
  },
  'ai-commerce-platform-2': {
    direct: 'Automated AI visual merchandising. Lift grid CTR by +41%.', // 57 chars
    metric: '+41% product grid CTR with live inventory-aware sorting.', // 56 chars
    urgency: 'Auto-arrange store grids with real-time AI merchandising.', // 57 chars
  },
  'ai-commerce-platform-3': {
    direct: 'Real-time multi-channel inventory sync & live analytics.', // 56 chars
    metric: '99.99% catalog sync uptime. Zero stockout discrepancies.', // 56 chars
    urgency: 'Sync inventory across web, social & mobile in real time.', // 56 chars
  },

  // D2C Brands Industry sub-pages
  'd2c-brands-1': {
    direct: 'D2C AI shopping assistant. Zero-hallucination fit match.', // 56 chars
    metric: '+35% D2C conversions with conversational product discovery.', // 58 chars
    urgency: 'Deploy WhatsApp & web AI shopping assistant in 15 minutes.', // 58 chars
  },
  'd2c-brands-2': {
    direct: 'D2C AI commerce engine: real-time intent & +28% AOV lift.', // 57 chars
    metric: 'Scale D2C revenue with real-time customer cohort AI.', // 53 chars
    urgency: 'Transform D2C ecommerce with autonomous predictive sales.', // 57 chars
  },
  'd2c-brands-3': {
    direct: '+35% D2C sales lift & 65% cart recovery (benchmark) via WhatsApp AI.', // 56 chars
    metric: 'Recover 65% of abandoned carts (tested benchmark) with automated WhatsApp AI.', // 58 chars
    urgency: 'Stop losing carts. Recover lost D2C revenue automatically.', // 57 chars
  },

  // Manufacturing Industry sub-pages
  'manufacturing-1': {
    direct: 'B2B manufacturing commerce with SAP, Oracle & live RFQs.', // 56 chars
    metric: 'Cut RFQ turnaround from days to seconds with AI quotes.', // 55 chars
    urgency: 'Digitize dealer & factory ordering with instant ERP sync.', // 57 chars
  },
  'manufacturing-2': {
    direct: 'Industrial AI spec search. Turn CAD queries into RFQs.', // 54 chars
    metric: 'Instant spec search & automated quote creation for B2B.', // 56 chars
    urgency: 'Help industrial buyers find exact parts & request quotes.', // 57 chars
  },
  'manufacturing-3': {
    direct: 'AI dealer portal for manufacturers with ERP bulk orders.', // 56 chars
    metric: 'Automate dealer contract pricing & exploded parts search.', // 57 chars
    urgency: 'Launch AI dealer ordering with live ERP synchronization.', // 56 chars
  },

  // Platform Integrations
  'shopify-ai-shopping-assistant': {
    direct: 'Shopify AI shopping assistant. 24/7 product discovery.', // 54 chars
    metric: '+35% Shopify conversions with 24/7 AI shopping assistant.', // 57 chars
    urgency: 'Add 24/7 conversational AI to your Shopify store in 15m.', // 56 chars
  },
};

/**
 * Hard character limit helper ensuring any string is strictly under 60 characters.
 */
export function ensureUnder60Chars(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length < 60) return trimmed;
  const truncated = trimmed.slice(0, 56);
  const lastSpace = truncated.lastIndexOf(' ');
  const clean = (lastSpace > 28 ? truncated.slice(0, lastSpace) : truncated).trim();
  return clean.endsWith('.') ? clean : `${clean}.`;
}

/**
 * Dynamically synthesizes a high-CTR snippet under 60 characters from a SeoMetaRow entry.
 */
export function generateDynamicSubPageDescription(
  entry: SeoMetaRow,
  variant: CtrVariantStyle = 'direct'
): string {
  if (variant === 'direct' && entry.ctrShortDescription && entry.ctrShortDescription.length < 60) {
    return entry.ctrShortDescription;
  }

  const kw = entry.primaryKeywords?.[0] || 'AI Commerce';
  const hook = entry.ctrHook || 'Boost Sales & Conversions';

  let candidate = '';
  if (variant === 'metric') {
    candidate = `${hook}. SilarAI engine.`;
  } else if (variant === 'urgency') {
    candidate = `Launch ${kw} now. ${hook}.`;
  } else {
    candidate = `${kw}: ${hook}.`;
  }

  return ensureUnder60Chars(candidate);
}

/**
 * Hook that generates dynamic, unique meta descriptions for sub-pages strictly under 60 characters,
 * aligned directly with the master SEO meta table and optimized for maximum CTR.
 */
export function useSubPageMetaDescription(
  viewOrOptions: string | SubPageMetaHookOptions,
  explicitSubPage?: number,
  initialVariant: CtrVariantStyle = 'direct'
): DynamicSubPageMetaResult {
  const options: SubPageMetaHookOptions = typeof viewOrOptions === 'string'
    ? { currentView: viewOrOptions, preferredVariant: initialVariant }
    : viewOrOptions;

  const {
    currentView,
    activeSectorSlug,
    aiShoppingSubPage,
    aiCommerceSubPage,
    d2cSubPage,
    manufacturingSubPage,
    preferredVariant = initialVariant,
  } = options;

  const [activeVariant, setActiveVariant] = useState<CtrVariantStyle>(preferredVariant);

  // Sync state if preferredVariant changes
  useEffect(() => {
    if (options.preferredVariant) {
      setActiveVariant(options.preferredVariant);
    }
  }, [options.preferredVariant]);

  // Determine active sub-page id
  const { isSubPage, activeSubPage } = useMemo(() => {
    if (currentView === 'sector-landing') {
      return { isSubPage: true, activeSubPage: undefined };
    }
    if (currentView === 'ai-shopping-assistant') {
      return { isSubPage: true, activeSubPage: aiShoppingSubPage || explicitSubPage || 1 };
    }
    if (currentView === 'ai-commerce-platform') {
      return { isSubPage: true, activeSubPage: aiCommerceSubPage || explicitSubPage || 1 };
    }
    if (currentView === 'd2c-brands') {
      const sub = d2cSubPage ?? explicitSubPage;
      return { isSubPage: sub !== undefined && sub > 0, activeSubPage: sub };
    }
    if (currentView === 'manufacturing') {
      const sub = manufacturingSubPage ?? explicitSubPage;
      return { isSubPage: sub !== undefined && sub > 0, activeSubPage: sub };
    }
    if (explicitSubPage !== undefined && explicitSubPage > 0) {
      return { isSubPage: true, activeSubPage: explicitSubPage };
    }
    return { isSubPage: false, activeSubPage: undefined };
  }, [currentView, aiShoppingSubPage, aiCommerceSubPage, d2cSubPage, manufacturingSubPage, explicitSubPage]);

  // Find corresponding entry in master SEO meta table
  const matchedEntry = useMemo(() => {
    return findSeoMetaEntry(currentView, activeSubPage, activeSectorSlug);
  }, [currentView, activeSubPage, activeSectorSlug]);

  // Generate or retrieve the 3 CTR variants
  const variants = useMemo<Record<CtrVariantStyle, string>>(() => {
    const key = currentView === 'sector-landing'
      ? `sector-landing-${activeSectorSlug || 'boutiques'}`
      : `${currentView}-${activeSubPage || 1}`;
    const prebuilt = SUBPAGE_CTR_VARIANTS[key];

    if (prebuilt) {
      return {
        direct: ensureUnder60Chars(prebuilt.direct),
        metric: ensureUnder60Chars(prebuilt.metric),
        urgency: ensureUnder60Chars(prebuilt.urgency),
      };
    }

    if (matchedEntry) {
      return {
        direct: generateDynamicSubPageDescription(matchedEntry, 'direct'),
        metric: generateDynamicSubPageDescription(matchedEntry, 'metric'),
        urgency: generateDynamicSubPageDescription(matchedEntry, 'urgency'),
      };
    }

    // Default fallback
    return {
      direct: ensureUnder60Chars('Enterprise AI shopping assistant & autonomous commerce.'),
      metric: ensureUnder60Chars('+35% conversions with sub-second AI catalog search.'),
      urgency: ensureUnder60Chars('Deploy intelligent AI commerce today with SilarAI.'),
    };
  }, [currentView, activeSubPage, activeSectorSlug, matchedEntry]);

  const activeDescription = variants[activeVariant] || variants.direct;
  const charCount = activeDescription.length;
  const isUnder60Chars = charCount < 60;

  const cycleVariant = useCallback(() => {
    setActiveVariant((prev) => {
      if (prev === 'direct') return 'metric';
      if (prev === 'metric') return 'urgency';
      return 'direct';
    });
  }, []);

  return {
    isSubPage,
    metaDescription: activeDescription,
    charCount,
    isUnder60Chars,
    activeVariant,
    variants,
    matchedEntry,
    primaryKeyword: matchedEntry?.primaryKeywords?.[0],
    ctrHook: matchedEntry?.ctrHook,
    sectionTitle: matchedEntry?.section,
    canonicalUrl: matchedEntry?.canonicalUrl,
    setVariant: setActiveVariant,
    cycleVariant,
  };
}

interface SeoHeadProps {
  currentView: string;
  activeSectorSlug?: string;
  activeUseCaseSlug?: string;
  aiShoppingSubPage?: number;
  aiCommerceSubPage?: number;
  d2cSubPage?: number;
  manufacturingSubPage?: number;
}

interface PageSeoMetadata {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogType: string;
  jsonLdSchema?: Record<string, any>;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  currentView,
  activeSectorSlug,
  activeUseCaseSlug,
  aiShoppingSubPage,
  aiCommerceSubPage,
  d2cSubPage,
  manufacturingSubPage,
}) => {
  // Hook generates dynamic, unique meta descriptions for sub-pages under 60 characters
  const subPageMeta = useSubPageMetaDescription({
    currentView,
    activeSectorSlug,
    aiShoppingSubPage,
    aiCommerceSubPage,
    d2cSubPage,
    manufacturingSubPage,
  });

  useEffect(() => {
    const origin = CANONICAL_HOST;
    const currentUrl = CANONICAL_HOST + window.location.pathname;

    // Get page specific SEO metadata
    const meta = getPageMetadata(
      currentView,
      aiShoppingSubPage,
      aiCommerceSubPage,
      d2cSubPage,
      manufacturingSubPage,
      origin,
      currentUrl,
      activeSectorSlug,
      activeUseCaseSlug
    );

    // Apply under-60-char dynamic description for sub-pages to optimize CTR
    const finalDescription = subPageMeta.isSubPage && subPageMeta.metaDescription
      ? subPageMeta.metaDescription
      : meta.description;

    // 1. Update Title
    document.title = meta.title;

    // 2. Helper to set meta tags
    const setMetaTag = (selector: string, attrName: string, attrValue: string, content: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta
    setMetaTag('meta[name="description"]', 'name', 'description', finalDescription);
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', meta.keywords);
    // Preview / AI Studio / local hosts stay out of the index; public routes allow rich previews.
    const host = window.location.hostname.toLowerCase();
    const isStaging = host.includes('run.app') || host.includes('webcontainer') || host.includes('localhost') || host.includes('aistudio');
    const robots = isStaging
      ? 'noindex, nofollow, noarchive'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    setMetaTag('meta[name="robots"]', 'name', 'robots', robots);
    setMetaTag('meta[name="googlebot"]', 'name', 'googlebot', isStaging ? robots : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    setMetaTag('meta[name="bingbot"]', 'name', 'bingbot', isStaging ? robots : 'index, follow, max-snippet:-1, max-image-preview:large');
    setMetaTag('meta[name="author"]', 'name', 'author', 'SilarAI Engineering & AI Research Team');
    setMetaTag('meta[name="publisher"]', 'name', 'publisher', 'SilarAI Technologies');

    // Sub-page CTR optimization markers and diagnostics
    if (subPageMeta.isSubPage) {
      setMetaTag('meta[name="subpage:ctr-under-60"]', 'name', 'subpage:ctr-under-60', 'true');
      setMetaTag('meta[name="subpage:char-count"]', 'name', 'subpage:char-count', String(subPageMeta.charCount));
      setMetaTag('meta[name="subpage:ctr-variant"]', 'name', 'subpage:ctr-variant', subPageMeta.activeVariant);
    }

    // GEO / Geolocation & Regional Meta
    setMetaTag('meta[name="geo.region"]', 'name', 'geo.region', 'IN-TN');
    setMetaTag('meta[name="geo.placename"]', 'name', 'geo.placename', 'Coimbatore, Tamil Nadu, India');
    setMetaTag('meta[name="geo.position"]', 'name', 'geo.position', '11.016844;76.955832');
    setMetaTag('meta[name="ICBM"]', 'name', 'ICBM', '11.016844, 76.955832');

    // Voice Search & AI Engine Directives
    setMetaTag('meta[name="rating"]', 'name', 'rating', 'general');
    setMetaTag('meta[name="revisit-after"]', 'name', 'revisit-after', '1 days');
    setMetaTag('meta[name="ai-search-indexing"]', 'name', 'ai-search-indexing', 'allow');
    setMetaTag('meta[name="chatgpt-plugin"]', 'name', 'chatgpt-plugin', 'enabled');
    setMetaTag('meta[name="llm-knowledge-base"]', 'name', 'llm-knowledge-base', `${origin}/llms.txt`);

    // Open Graph Meta Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', meta.title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', finalDescription);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', meta.canonicalUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', meta.ogType);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'SilarAI Smart Commerce AI');
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', `${origin}/og-image.jpg`);

    // Twitter Card Meta Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:site"]', 'name', 'twitter:site', '@SilarAI');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', meta.title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', finalDescription);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', `${origin}/og-image.jpg`);

    // Canonical Link: Ensure exactly one self-referencing canonical tag exists
    const allCanonicalLinks = document.querySelectorAll('link[rel="canonical"]');
    if (allCanonicalLinks.length > 1) {
      allCanonicalLinks.forEach((link, idx) => {
        if (idx > 0) link.remove();
      });
    }
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', meta.canonicalUrl);

    // Dynamic JSON-LD Schema Insertion
    let jsonLdScript = document.getElementById('dynamic-seo-jsonld') as HTMLScriptElement | null;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'dynamic-seo-jsonld';
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }

    if (meta.jsonLdSchema) {
      jsonLdScript.textContent = JSON.stringify(meta.jsonLdSchema);
    }
  }, [
    currentView,
    activeSectorSlug,
    activeUseCaseSlug,
    aiShoppingSubPage,
    aiCommerceSubPage,
    d2cSubPage,
    manufacturingSubPage,
    subPageMeta.metaDescription,
    subPageMeta.activeVariant,
    subPageMeta.isSubPage,
    subPageMeta.charCount
  ]);

  return null; // Side-effect only head manager
};

function getPageMetadata(
  view: string,
  shoppingSub?: number,
  commerceSub?: number,
  d2cSub?: number,
  manufacturingSub?: number,
  origin: string = CANONICAL_HOST,
  currentUrl: string = CANONICAL_HOST,
  activeSectorSlug?: string,
  activeUseCaseSlug?: string
): PageSeoMetadata {
  const commonOrg = {
    '@type': 'Organization',
    '@id': `${CANONICAL_HOST}/#organization`,
    name: 'SilarAI',
    alternateName: 'SilarAI Smart Commerce AI Platform',
    url: CANONICAL_HOST,
    logo: `${CANONICAL_HOST}/assets/images/silarai_official_logo.webp`,
    parentOrganization: {
      '@type': 'Corporation',
      '@id': `${CANONICAL_HOST}/#corporation`,
      name: 'PSI traders OPC PVT LTD',
      legalName: 'PSI traders OPC PVT LTD',
      url: CANONICAL_HOST,
      logo: `${CANONICAL_HOST}/assets/images/silarai_official_logo.webp`,
      telephone: '(+91)9444139089',
      email: CONTACT_EMAIL,
      address: {
        '@type': 'PostalAddress',
        streetAddress: '74 RR Nagar, NSNPALAYAM',
        addressLocality: 'Coimbatore',
        addressRegion: 'Tamil Nadu',
        postalCode: '641031',
        addressCountry: 'IN',
      },
    },
    brand: {
      '@type': 'Brand',
      '@id': `${CANONICAL_HOST}/#brand`,
      name: 'SilarAI',
      url: CANONICAL_HOST,
      logo: `${CANONICAL_HOST}/assets/images/silarai_official_logo.webp`,
      slogan: 'Build. Sell. Grow. Powered by AI.',
    },
    slogan: 'Build. Sell. Grow. Powered by AI.',
    telephone: '(+91)9444139089',
    email: CONTACT_EMAIL,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '74 RR Nagar, NSNPALAYAM',
      addressLocality: 'Coimbatore',
      addressRegion: 'Tamil Nadu',
      postalCode: '641031',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '(+91)9444139089',
      email: CONTACT_EMAIL,
      contactType: 'customer service',
      availableLanguage: ['English', 'Tamil', 'Hindi'],
    },
  };

  // If activeUseCaseSlug is set OR view is use-cases
  if (activeUseCaseSlug || view === 'use-cases' || view.startsWith('use-case')) {
    const rawSlug = activeUseCaseSlug || (view.startsWith('use-case-') ? view.replace('use-case-', '') : 'product-discovery');
    const slug = rawSlug.replace(/\/+$/, '');
    const ucEntry = findSeoMetaEntry('use-cases', undefined, undefined, slug);
    const ucCanonical = `${CANONICAL_HOST}/use-cases/${slug}`;
    const ucTitle = ucEntry?.seoTitle || `AI Commerce Use Case: ${slug} | SilarAI`;
    const ucDesc = ucEntry?.metaDescription || 'AI Commerce solutions powered by SilarAI.';
    const ucKeywords = ucEntry?.primaryKeywords?.join(', ') || 'Product Discovery, AI Sales Assistant, Lead Generation, Conversion, B2B Commerce';

    return {
      title: ucTitle,
      description: ucDesc,
      keywords: ucKeywords,
      canonicalUrl: ucCanonical,
      ogType: 'website',
      jsonLdSchema: {
        '@context': 'https://schema.org',
        '@graph': [
          commonOrg,
          {
            '@type': 'WebPage',
            '@id': `${ucCanonical}#webpage`,
            url: ucCanonical,
            name: ucTitle,
            description: ucDesc,
            inLanguage: 'en-US',
            isPartOf: {
              '@type': 'WebSite',
              '@id': `${CANONICAL_HOST}/#website`,
              name: 'SilarAI Smart Commerce AI Platform',
              url: CANONICAL_HOST,
            },
            about: {
              '@type': 'Thing',
              name: ucTitle,
              description: ucDesc,
            },
            publisher: { '@id': `${CANONICAL_HOST}/#organization` },
          },
          {
            '@type': 'SoftwareApplication',
            '@id': `${ucCanonical}#software`,
            name: `SilarAI ${ucEntry?.section || 'Commerce Solution'}`,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web, Shopify, WooCommerce, Magento, Custom Headless, WhatsApp',
            description: ucDesc,
            offers: {
              '@type': 'Offer',
              price: '10.00',
              priceCurrency: 'USD',
              priceValidUntil: '2027-12-31',
              availability: 'https://schema.org/InStock',
              seller: { '@id': `${CANONICAL_HOST}/#organization` },
            },
          },
          {
            '@type': 'Service',
            '@id': `${ucCanonical}#service`,
            name: ucTitle,
            provider: { '@id': `${CANONICAL_HOST}/#organization` },
            serviceType: 'E-Commerce AI Optimization & Autonomous Agent Systems',
            areaServed: 'Worldwide',
            description: ucDesc,
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `${ucCanonical}#breadcrumb`,
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${CANONICAL_HOST}/`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: ucEntry?.section?.split('(')[0]?.trim() || slug,
                item: ucCanonical,
              },
            ],
          },
        ],
      },
    };
  }

  switch (view) {
    case 'pricing': {
      const pricingCanonical = getCanonicalUrlForView('pricing');
      const pricingTitle = 'Pricing & Plans | Transparent AI Commerce from $10/mo | SilarAI';
      const pricingDesc = 'Explore SilarAI transparent pricing plans starting at $10/month with zero revenue fees. Calculate your store ROI, projected margin expansion, and conversion lift.';
      return {
        title: pricingTitle,
        description: pricingDesc,
        keywords: 'SilarAI Pricing, AI Shopping Assistant Cost, AI Commerce Platform Pricing, Ecommerce AI ROI Calculator, Transparent Ecommerce Pricing',
        canonicalUrl: pricingCanonical,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'WebPage',
              '@id': `${pricingCanonical}#webpage`,
              url: pricingCanonical,
              name: pricingTitle,
              description: pricingDesc,
              isPartOf: {
                '@type': 'WebSite',
                '@id': `${CANONICAL_HOST}/#website`,
                name: 'SilarAI Smart Commerce AI Platform',
                url: CANONICAL_HOST,
              },
              publisher: { '@id': `${CANONICAL_HOST}/#organization` },
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${pricingCanonical}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                { '@type': 'ListItem', position: 2, name: 'Pricing', item: pricingCanonical },
              ],
            },
          ],
        },
      };
    }

    case 'sector-landing': {
      const rawSlug = activeSectorSlug || 'boutiques';
      const slug = rawSlug.replace(/\/+$/, '');
      const sectorEntry = findSeoMetaEntry('sector-landing', undefined, slug);
      const sectorDetails = SECTORS[slug] || SECTORS['boutiques'];
      const sectorTitle = sectorEntry?.seoTitle || `AI Commerce Platform for ${sectorDetails.name} | SilarAI`;
      const sectorDesc = sectorEntry?.metaDescription || sectorDetails.subheadline;
      const sectorKeywords = (sectorDetails.seoKeywords?.flatMap((k) => k.keywords) || sectorEntry?.primaryKeywords || []).join(', ');
      const sectorCanonical = `${CANONICAL_HOST}/sector/${slug}`;

      return {
        title: sectorTitle,
        description: sectorDesc,
        keywords: sectorKeywords,
        canonicalUrl: sectorCanonical,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'WebPage',
              '@id': `${sectorCanonical}#webpage`,
              url: sectorCanonical,
              name: sectorTitle,
              description: sectorDesc,
              inLanguage: 'en-US',
              isPartOf: {
                '@type': 'WebSite',
                '@id': `${CANONICAL_HOST}/#website`,
                name: 'SilarAI Smart Commerce AI Platform',
                url: CANONICAL_HOST,
              },
              about: {
                '@type': 'Thing',
                name: `${sectorDetails.name} E-Commerce and AI Shopping Assistant`,
                description: sectorDetails.headline,
              },
              publisher: { '@id': `${CANONICAL_HOST}/#organization` },
            },
            {
              '@type': 'SoftwareApplication',
              '@id': `${sectorCanonical}#software`,
              name: `SilarAI ${sectorDetails.name} Edition`,
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web, Shopify, WooCommerce, Magento, Custom Headless',
              description: sectorDetails.subheadline,
              offers: {
                '@type': 'Offer',
                price: '10.00',
                priceCurrency: 'USD',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock',
                seller: { '@id': `${CANONICAL_HOST}/#organization` },
              },
            },
            {
              '@type': 'Service',
              '@id': `${sectorCanonical}#service`,
              name: `Turnkey ${sectorDetails.name} Store Launch & AI Shopping Assistant`,
              provider: { '@id': `${CANONICAL_HOST}/#organization` },
              serviceType: 'E-Commerce Storefront Development and AI Agent Integration',
              areaServed: 'Worldwide',
              description: `Rapid 3-to-4 hour store launch for ${sectorDetails.name}, featuring dual B2B2C wholesale/retail catalogs and 24/7 AI shopping assistant widget.`,
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${sectorCanonical}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                { '@type': 'ListItem', position: 2, name: sectorDetails.name, item: sectorCanonical },
              ],
            },
          ],
        },
      };
    }

    case 'contact-us': {
      const contactCanonical = getCanonicalUrlForView('contact-us');
      const contactTitle = 'Contact SilarAI | Let’s Build the Future of Commerce & Marketing';
      const contactDesc = 'Connect with the SilarAI team to explore how our AI Commerce Platform and Shopping Assistant can accelerate your conversion, sales, and customer growth.';
      return {
        title: contactTitle,
        description: contactDesc,
        keywords: 'Contact SilarAI, AI Commerce Demo, Enterprise AI Shopping Assistant, Commerce Cloud Contact, Retail AI Solutions',
        canonicalUrl: contactCanonical,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'ContactPage',
              '@id': `${contactCanonical}#webpage`,
              url: contactCanonical,
              name: 'Contact SilarAI Team',
              description: contactDesc,
              publisher: { '@id': `${CANONICAL_HOST}/#organization` },
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                { '@type': 'ListItem', position: 2, name: 'Contact Us', item: contactCanonical },
              ],
            },
          ],
        },
      };
    }

    case 'about': {
      const aboutCanonical = getCanonicalUrlForView('about');
      const aboutTitle = 'About SilarAI | Enterprise Agentic AI Commerce Leader & Team';
      const aboutDesc = 'Meet the team behind SilarAI. We build autonomous agentic shopping assistants, sub-50ms pricing engines, and enterprise-grade AI commerce infrastructure.';
      return {
        title: aboutTitle,
        description: aboutDesc,
        keywords: 'About SilarAI, AI Commerce Founders, Enterprise Retail AI, Autonomous E-Commerce Engine, SilarAI Leadership, E-Commerce Innovations',
        canonicalUrl: aboutCanonical,
        ogType: 'article',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'AboutPage',
              '@id': `${aboutCanonical}#webpage`,
              url: aboutCanonical,
              name: 'About SilarAI Technologies',
              description: aboutDesc,
              publisher: { '@id': `${CANONICAL_HOST}/#organization` },
              mainEntity: commonOrg,
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${aboutCanonical}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                { '@type': 'ListItem', position: 2, name: 'About Us', item: aboutCanonical },
              ],
            },
          ],
        },
      };
    }

    case 'why-choose-us': {
      const whyCanonical = getCanonicalUrlForView('why-choose-us');
      const whyTitle = 'Why Choose SilarAI | High-ROI Commerce AI vs Legacy Platforms';
      const whyDesc = 'Discover why brands choose SilarAI: tested conversion lift, sub-50ms dynamic pricing, and 5-minute integration for Shopify, WooCommerce, and custom storefronts.';
      return {
        title: whyTitle,
        description: whyDesc,
        keywords: 'Why SilarAI, E-Commerce AI ROI, Best AI Shopping Assistant, Smart Commerce Comparison, Retail Conversions, SilarAI Advantages',
        canonicalUrl: whyCanonical,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'WebPage',
              '@id': `${whyCanonical}#webpage`,
              url: whyCanonical,
              name: 'Why Choose SilarAI Platform',
              description: 'Comprehensive ROI analysis and platform benchmark comparing traditional e-commerce against SilarAI Unified Smart Commerce AI.',
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${whyCanonical}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                { '@type': 'ListItem', position: 2, name: 'Why Choose Us', item: whyCanonical },
              ],
            },
          ],
        },
      };
    }

    case 'shopify-comparison': {
      const shopifyCanonical = getCanonicalUrlForView('shopify-comparison');
      const shopifyTitle = 'SilarAI vs Shopify Plus (2026): Enterprise AI Commerce Comparison';
      const shopifyDesc = 'Compare SilarAI vs Shopify Plus. See why brands switch: built-in AI shopping assistant, sub-50ms dynamic pricing & native B2B without $2,000/mo app fees.';
      return {
        title: shopifyTitle,
        description: shopifyDesc,
        keywords: 'SilarAI vs Shopify, Shopify Alternative 2026, Shopify Plus vs SilarAI, Best Shopify Alternatives for AI, AI Commerce vs Shopify, Shopify App Consolidation',
        canonicalUrl: shopifyCanonical,
        ogType: 'article',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'TechArticle',
              '@id': `${shopifyCanonical}#article`,
              headline: 'SilarAI vs Shopify Plus: 2026 Technical & Architecture Comparison',
              description: 'In-depth engineering audit comparing Shopify app ecosystem fragmentation against SilarAI unified agentic AI platform.',
              author: { '@type': 'Organization', name: 'SilarAI Research Lab' },
              publisher: { '@id': `${CANONICAL_HOST}/#organization` },
              url: shopifyCanonical,
            },
            {
              '@type': 'FAQPage',
              '@id': `${shopifyCanonical}#faq`,
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'Can I keep my existing Shopify store while using SilarAI?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. SilarAI offers a 1-line script embed tag that embeds our AI Shopping Assistant and dynamic pricing engine directly onto your live Shopify storefront without migrating host systems.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How does SilarAI compare to Shopify Sidekick or Shopify Magic?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Shopify Magic focuses primarily on backend merchant copy generation. SilarAI is a consumer-facing agentic AI platform that conducts multimodal voice, camera photo search, and automated 1-click cart checkouts directly for buyers.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Does SilarAI require Shopify Plus for B2B portal features?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'No. B2B net terms, dealer pricing tiers, custom bulk price schedules, and wholesale registration forms are built into all SilarAI core plans without upgrading to $2,000/mo Shopify Plus tiers.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How long does catalog vectorization and setup take?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'SilarAI automatically syncs and indexes your Shopify product catalog, metadata, and FAQ spec sheets in under 5 minutes using automated API connectors.',
                  },
                },
              ],
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${shopifyCanonical}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                { '@type': 'ListItem', position: 2, name: 'Shopify vs SilarAI', item: shopifyCanonical },
              ],
            },
          ],
        },
      };
    }

    case 'shopify-ai-shopping-assistant': {
      const shopifyAsstCanonical = getCanonicalUrlForView('shopify-ai-shopping-assistant');
      const shopifyAsstTitle = 'Shopify AI Shopping Assistant | 24/7 Conversational Store Assistant | SilarAI';
      const shopifyAsstDesc = 'Turn your Shopify store into a 24/7 conversational shopping experience. Help shoppers discover products, ask questions, compare options, and checkout seamlessly.';
      return {
        title: shopifyAsstTitle,
        description: shopifyAsstDesc,
        keywords: 'Shopify AI Shopping Assistant, AI Shopping Assistant for Shopify, Shopify Conversational Commerce, Shopify Product Discovery AI, 24/7 Shopify Sales Assistant',
        canonicalUrl: shopifyAsstCanonical,
        ogType: 'product',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'SoftwareApplication',
              '@id': `${shopifyAsstCanonical}#software`,
              name: 'SilarAI Shopify AI Shopping Assistant',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Shopify, All Modern Web Browsers, iOS, Android',
              offers: {
                '@type': 'Offer',
                price: '10.00',
                priceCurrency: 'USD',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock',
              },
              description: 'Turn your Shopify store into a 24/7 conversational shopping experience that helps customers find, compare, and buy products directly with AI.',
              url: shopifyAsstCanonical,
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${shopifyAsstCanonical}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                { '@type': 'ListItem', position: 2, name: 'Shopify AI Shopping Assistant', item: shopifyAsstCanonical },
              ],
            },
          ],
        },
      };
    }

    case 'woocommerce-comparison': {
      const wooCanonical = getCanonicalUrlForView('woocommerce-comparison');
      const wooTitle = 'SilarAI vs WooCommerce | High-Performance AI Commerce Integration';
      const wooDesc = 'Upgrade WooCommerce with SilarAI. Replace bloated plugins with high-performance cloud AI delivering conversational chat, visual discovery, and dynamic pricing.';
      return {
        title: wooTitle,
        description: wooDesc,
        keywords: 'SilarAI vs WooCommerce, WooCommerce AI Plugin Alternative, Smart WooCommerce Upgrade, Headless WooCommerce AI, WooCommerce Speed Optimization',
        canonicalUrl: wooCanonical,
        ogType: 'article',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'TechArticle',
              '@id': `${wooCanonical}#article`,
              headline: 'SilarAI vs WooCommerce: Performance, Security & Conversion Architecture',
              description: 'Comparing traditional PHP WooCommerce plugin overhead with SilarAI cloud-hosted vector search and agentic AI.',
              author: { '@type': 'Organization', name: 'SilarAI Engineering Team' },
              publisher: { '@id': `${CANONICAL_HOST}/#organization` },
              url: wooCanonical,
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${wooCanonical}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                { '@type': 'ListItem', position: 2, name: 'WooCommerce vs SilarAI', item: wooCanonical },
              ],
            },
          ],
        },
      };
    }

    case 'ai-shopping-assistant': {
      let title = 'AI Shopping Assistant for Ecommerce | Conversational AI | SilarAI';
      let description = 'Leading AI Shopping Assistant for ecommerce stores. Deliver 20+ language voice search, visual camera discovery, and 1-click agentic checkout to boost sales.';
      let subTitle = 'Agentic AI Voice & Conversational Search';

      if (shoppingSub === 2) {
        title = 'AI Shopping Assistant Features: Voice, Visual & WhatsApp | SilarAI';
        description = 'Explore AI shopping assistant features: sub-second voice commerce, camera photo search, 1-click agentic cart checkout, and personalized recommendations.';
        subTitle = 'Visual Search & Multimodal Product Discovery';
      }
      if (shoppingSub === 3) {
        title = 'How AI Shopping Assistants Increase Sales & Conversions | SilarAI';
        description = 'Data-backed benchmark: How AI shopping assistants lift ecommerce conversion rates, expand average order value, and cut cart abandonment by over 40%.';
        subTitle = 'Personalized Recommendations & One-Click Agent Checkout';
      }

      // Sub-pages keep their own URLs (matches seoMetaTable); page 1 is the pillar path.
      const canonicalUrl = shoppingSub === 2 || shoppingSub === 3
        ? `${CANONICAL_HOST}/?page=ai-shopping-assistant&subPage=${shoppingSub}`
        : getCanonicalUrlForView('ai-shopping-assistant');

      return {
        title,
        description,
        keywords: 'Best AI Shopping Assistant, AI Shopping Assistant 2026, Conversational AI Ecommerce, Voice Shopping Assistant, Autonomous Shopping Agent, Ecommerce AI Bot, Agentic Checkout, Visual Search AI',
        canonicalUrl,
        ogType: 'product',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'SoftwareApplication',
              name: `SilarAI Shopping Assistant - ${subTitle}`,
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'All Web Browsers, iOS, Android, Headless API',
              offers: {
                '@type': 'Offer',
                price: '10.00',
                priceCurrency: 'USD',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock',
                url: `${origin}/#pricing`,
              },
            },
            {
              '@type': 'FAQPage',
              '@id': `${origin}/ai-shopping-assistant#faq`,
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What is an AI Shopping Assistant in ecommerce?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'An AI Shopping Assistant is an autonomous conversational agent embedded on an ecommerce website or mobile app that guides shoppers through natural language product discovery, visual camera searches, product comparisons, and 1-click checkout 24/7.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How does an AI shopping assistant increase conversion rates?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'AI shopping assistants reduce buyer friction and decision fatigue by answering product questions in under 200ms, suggesting contextual cross-sells, resolving sizing doubts, and guiding shoppers to the exact SKU they need to increase sales conversions and reduce cart abandonment.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Does SilarAI Shopping Assistant support multiple languages and voice?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. SilarAI natively supports speech-to-intent voice commerce in over 20 global languages with dialect recognition, allowing shoppers to speak naturally to find items without typing.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Can SilarAI Shopping Assistant be embedded on Shopify or WooCommerce?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. SilarAI provides a simple one-line script tag embed and native app connectors that install in under 5 minutes on Shopify, Shopify Plus, WooCommerce, Magento, BigCommerce, and custom headless storefronts.',
                  },
                },
              ],
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${canonicalUrl}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                { '@type': 'ListItem', position: 2, name: 'AI Shopping Assistant', item: getCanonicalUrlForView('ai-shopping-assistant') },
              ],
            },
          ],
        },
      };
    }

    case 'ai-commerce-marketing-platform': {
      const aicmCanonical = getCanonicalUrlForView('ai-commerce-marketing-platform');
      const aicmTitle = 'AI Commerce & Marketing Platform | Autonomous Commerce Cloud | SilarAI';
      const aicmDesc = 'Unify Commerce Cloud, AI marketing automation, customer intelligence, and 24/7 conversational shopping assistants for high-growth B2B and B2C ecommerce stores.';
      return {
        title: aicmTitle,
        description: aicmDesc,
        keywords: 'AI Commerce Platform, AI Marketing Platform, AI Commerce Platform for Ecommerce, AI Commerce Software, AI Commerce Solution, AI-powered Commerce Platform, AI-powered Marketing Platform, AI Commerce and Marketing Software, AI Marketing Automation, AI Marketing Software, AI Marketing Platform for Ecommerce, AI Ecommerce Marketing, AI Customer Engagement, AI Personalization, AI Customer Intelligence, AI Customer Segmentation, AI Marketing Analytics, AI Sales Automation, AI Campaign Automation, AI Customer Engagement Platform, Commerce Cloud, Ecommerce Cloud Platform, Cloud Commerce Platform, B2B Commerce Cloud, B2C Commerce Cloud, Enterprise Commerce Cloud, Headless Commerce Cloud, Commerce Management Platform, Ecommerce Commerce Platform, Cloud Ecommerce Platform, AI-powered ecommerce, AI ecommerce software, AI ecommerce solution, AI commerce software, AI commerce technology, AI-native commerce, intelligent commerce platform, AI-driven commerce, AI retail technology, AI retail platform',
        canonicalUrl: aicmCanonical,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'SoftwareApplication',
              name: 'SilarAI AI Commerce & Marketing Platform',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Cloud Native / Web / Headless API / Mobile',
              url: aicmCanonical,
              description: aicmDesc,
              offers: {
                '@type': 'Offer',
                price: '25.00',
                priceCurrency: 'USD',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock',
                url: `${origin}/#pricing`,
              },
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${aicmCanonical}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                { '@type': 'ListItem', position: 2, name: 'AI Commerce & Marketing Platform', item: aicmCanonical },
              ],
            },
          ],
        },
      };
    }

    case 'ai-commerce-platform': {
      let subTitle = 'Real-Time Dynamic Pricing Engine';
      if (commerceSub === 2) subTitle = 'Automated AI Visual Merchandising';
      if (commerceSub === 3) subTitle = 'Multi-Channel Inventory & Analytics Sync';

      const shortDesc = SUBPAGE_CTR_VARIANTS[`ai-commerce-platform-${commerceSub || 1}`]?.direct
        || 'Sub-50ms AI dynamic pricing engine to maximize margins.';
      const cpCanonical = commerceSub === 2 || commerceSub === 3
        ? `${CANONICAL_HOST}/?page=ai-commerce-platform&subPage=${commerceSub}`
        : `${CANONICAL_HOST}/commerce-platform`;

      return {
        title: `${subTitle} | SilarAI Platform Engine`,
        description: shortDesc,
        keywords: 'Dynamic Pricing AI, AI Visual Merchandising, E-Commerce Analytics, Retail Automation, Multi-Channel Inventory Engine, Smart Merchandising',
        canonicalUrl: cpCanonical,
        ogType: 'product',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'SoftwareApplication',
              name: `SilarAI Platform Engine - ${subTitle}`,
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Cloud API, Web Platform',
              offers: {
                '@type': 'Offer',
                price: '25.00',
                priceCurrency: 'USD',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock',
                url: `${origin}/#pricing`,
              },
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${cpCanonical}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                { '@type': 'ListItem', position: 2, name: 'AI Commerce Platform', item: cpCanonical },
              ],
            },
          ],
        },
      };
    }

    case 'retail-commerce': {
      const retailCanonical = getCanonicalUrlForView('retail-commerce');
      const retailTitle = 'AI Commerce Platform for Retail | AI Shopping Assistant | SilarAI';
      const retailDesc = 'Transform retail stores with AI Shopping Assistants, omnichannel discovery, smart product recommendations, live inventory visibility, and instant checkout.';
      return {
        title: retailTitle,
        description: retailDesc,
        keywords: 'AI Commerce Platform for Retail, Retail AI Platform, AI Shopping Assistant for Retail, Omnichannel Commerce Platform, Retail Commerce Platform, AI Product Search, Retail Product Recommendations, Conversational Commerce, AI Customer Engagement, Retail Inventory Visibility, AI Customer Support, Omnichannel Retail, AI Sales Assistant, Retail Personalization, Digital Retail Platform, Best AI commerce platform for retailers, AI shopping assistant for retail stores, Omnichannel AI commerce platform, AI-powered retail customer experience platform, AI product search for retail websites, Conversational commerce for retailers, AI platform for retail inventory visibility, Personalized shopping AI for retail, AI retail assistant for ecommerce and physical stores, Enterprise AI commerce platform for retailers',
        canonicalUrl: retailCanonical,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'SoftwareApplication',
              name: 'SilarAI Retail Commerce AI Platform',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Cloud Native / Web / Headless API',
              description: retailDesc,
              offers: {
                '@type': 'Offer',
                price: '25.00',
                priceCurrency: 'USD',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock',
                url: `${origin}/#pricing`,
              },
            },
            {
              '@type': 'Service',
              name: 'AI Commerce Platform for Retail',
              provider: { '@id': `${CANONICAL_HOST}/#organization` },
              serviceType: 'Omnichannel Retail Commerce AI',
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${retailCanonical}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                { '@type': 'ListItem', position: 2, name: 'Retailers AI Commerce', item: retailCanonical },
              ],
            },
          ],
        },
      };
    }

    case 'ecommerce': {
      const ecommerceFaqItems = [
        {
          '@type': 'Question',
          name: 'What is an AI shopping assistant for ecommerce?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'An AI shopping assistant is a conversational AI that helps online shoppers discover products, answer questions, compare options, and make purchase decisions. Instead of relying only on traditional search and filters, customers can describe what they need in natural language.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does an AI shopping assistant help ecommerce customers?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'It helps customers discover products, understand product information, compare products, refine their requirements, and navigate toward purchase. It can provide shopping assistance 24/7 without requiring a customer-service representative to be available.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can an AI shopping assistant work 24/7?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. An AI shopping assistant can provide continuous shopping assistance whenever customers visit an ecommerce website. This allows shoppers to ask questions and explore products outside normal business hours.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can AI help customers find products in a large ecommerce catalog?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. AI can help customers navigate large product catalogs by understanding their requirements and matching them with relevant products. This is particularly useful for ecommerce businesses with hundreds, thousands, or more SKUs.',
          },
        },
        {
          '@type': 'Question',
          name: 'How is an AI shopping assistant different from ecommerce search?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Traditional ecommerce search generally requires customers to enter keywords and then use filters or categories. An AI shopping assistant allows customers to describe their needs conversationally and refine their requirements through a dialogue. Example: "I need a lightweight laptop for programming under ₹80,000." The assistant can interpret the requirements and help narrow down suitable products.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can an AI shopping assistant recommend products?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. An AI shopping assistant can use product information and customer requirements to identify relevant products and explain why they may be suitable. For example: "Which running shoes are best for long-distance running?" The assistant can help the customer identify relevant products based on available product information.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can customers ask product questions using natural language?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Customers can ask questions in the same way they would ask a salesperson. For example: "Is this suitable for outdoor use?", "Does this laptop have 16GB RAM?", "Which one has better battery life?", "I need something for a small office." The AI can interpret the question and use the available product information to respond.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can an AI shopping assistant compare products?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. It can help customers compare products based on relevant specifications, features, pricing, use cases, and other available catalog information. This can reduce the need for customers to open multiple product pages and manually compare specifications.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can AI shopping assistants help customers with technical products?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. This can be particularly valuable for electronics, industrial products, machinery, automotive products, tools, components, and other technical catalogs. Customers can describe their application or technical requirements, and the assistant can use available product specifications to help identify relevant products.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does an AI Commerce Platform and Conversational Commerce improve Google top 5 rankings and store sales?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'SilarAI provides conversational commerce agents, dense vector neural search, and sub-50ms dynamic pricing. By delivering comprehensive Schema.org structured data, lowering bounce rates by 62%, and resolving high-intent natural language queries, it maximizes organic E-E-A-T signals for top-5 Google search rankings, Gemini AI Overviews (AIO), and Generative Engine Optimization (GEO).',
          },
        },
      ];

      const ecTitle = 'AI Commerce Platform for Ecommerce Stores | Conversational Shopping & Dynamic Pricing | SilarAI';
      const ecDesc = 'Top-ranked AI commerce platform for modern ecommerce stores. Deploy 24/7 conversational shopping assistants, sub-50ms dynamic pricing, automated catalog vector discovery, and WhatsApp commerce.';
      const ecKeywords = 'Conversational Commerce, Agentic AI, AI Commerce Platform for Ecommerce, Ecommerce AI Platform, AI Shopping Assistant for Ecommerce, Dynamic Pricing AI for Ecommerce, Sub-50ms Pricing Engine, AI Product Discovery for Ecommerce, AI Sales Assistant for Ecommerce, 24/7 Ecommerce Customer Support, Autonomous Ecommerce Store, WhatsApp Commerce Assistant, Shopify AI Alternative, Ecommerce Conversational AI, Omnichannel AI Commerce';
      const ecCanonical = `${origin}/industries/ecommerce`;

      return {
        title: ecTitle,
        description: ecDesc,
        keywords: ecKeywords,
        canonicalUrl: ecCanonical,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'WebPage',
              '@id': `${ecCanonical}#webpage`,
              url: ecCanonical,
              name: ecTitle,
              description: ecDesc,
              isPartOf: {
                '@type': 'WebSite',
                '@id': `${origin}/#website`,
                name: 'SilarAI Smart Commerce AI Platform',
                url: origin,
              },
              about: {
                '@type': 'Thing',
                name: 'Conversational Commerce & Agentic AI for E-Commerce',
                description: ecDesc,
                sameAs: [
                  'https://en.wikipedia.org/wiki/Conversational_commerce',
                  'https://en.wikipedia.org/wiki/E-commerce',
                  'https://www.wikidata.org/wiki/Q1151624',
                  'https://www.wikidata.org/wiki/Q484876'
                ]
              },
              citation: [
                'https://www.w3.org/TR/payment-request/',
                'https://schema.org/Product',
                'https://schema.org/SoftwareApplication',
                'https://ieeexplore.ieee.org/abstract/document/9308940'
              ],
              publisher: { '@id': `${origin}/#organization` },
              speakable: {
                '@type': 'SpeakableSpecification',
                cssSelector: ['h1', 'h2', '.faq-question', '.faq-answer']
              }
            },
            {
              '@type': 'SoftwareApplication',
              '@id': `${ecCanonical}#software`,
              name: 'SilarAI AI Commerce Platform for Ecommerce Stores',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Shopify, WooCommerce, Magento, BigCommerce, Custom Headless API, Cloud Native',
              description: ecDesc,
              url: ecCanonical,
              featureList: [
                '24/7 Conversational Shopping Assistant',
                'Sub-50ms Dynamic Pricing Engine',
                'Dense Vector Catalog Discovery',
                'Autonomous Cart Recovery & WhatsApp Checkout',
                'Multilingual Support (20+ Languages)',
                '1-Click Headless Embed'
              ],
              offers: {
                '@type': 'Offer',
                price: '10.00',
                priceCurrency: 'USD',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock',
                seller: { '@id': `${origin}/#organization` },
                url: `${origin}/#pricing`,
              },
            },
            {
              '@type': 'Service',
              '@id': `${ecCanonical}#service`,
              name: 'AI Shopping Assistant for Ecommerce',
              provider: { '@id': `${origin}/#organization` },
              serviceType: 'Conversational Ecommerce AI, 24/7 Product Discovery & Guided Shopping',
              areaServed: 'Worldwide',
              description: ecDesc,
            },
            {
              '@type': 'FAQPage',
              '@id': `${ecCanonical}#faq`,
              mainEntity: ecommerceFaqItems,
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${ecCanonical}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                { '@type': 'ListItem', position: 2, name: 'Ecommerce AI Platform', item: ecCanonical },
              ],
            },
          ],
        },
      };
    }

    case 'd2c-brands': {
      if (d2cSub === 1) {
        return {
          title: 'AI Shopping Assistant for D2C Brands | SilarAI',
          description: SUBPAGE_CTR_VARIANTS['d2c-brands-1']?.direct || 'D2C AI shopping assistant. Zero-hallucination fit match.',
          keywords: 'AI Shopping Assistant for D2C Brands, AI ecommerce assistant, AI sales assistant for ecommerce, conversational commerce for D2C, AI product recommendations, AI product discovery, AI ecommerce chatbot, AI shopping assistant for ecommerce, conversational shopping, AI customer engagement, WhatsApp AI sales assistant, What is an AI shopping assistant?, How does AI product recommendation work?, What is the best AI shopping assistant for D2C brands?',
          canonicalUrl: `${origin}/industries/d2c-brands/ai-shopping-assistant`,
          ogType: 'website',
          jsonLdSchema: {
            '@context': 'https://schema.org',
            '@graph': [
              commonOrg,
              {
                '@type': 'SoftwareApplication',
                name: 'SilarAI AI Shopping Assistant for D2C Brands',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Cloud Native / Web / Headless API',
                description: 'Help D2C customers discover products, compare options and make faster buying decisions with SilarAI\'s AI Shopping Assistant.',
                offers: {
                  '@type': 'Offer',
                  price: '10.00',
                  priceCurrency: 'USD',
                  priceValidUntil: '2027-12-31',
                  availability: 'https://schema.org/InStock',
                  url: `${origin}/#pricing`,
                },
              },
              {
                '@type': 'Service',
                name: 'AI Shopping Assistant for D2C Brands',
                provider: { '@id': `${origin}/#organization` },
                serviceType: 'Conversational Guided Shopping & SKU Matching',
              },
              {
                '@type': 'BreadcrumbList',
                '@id': `${origin}/industries/d2c-brands#breadcrumb`,
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                  { '@type': 'ListItem', position: 2, name: 'D2C Brands AI Platform', item: `${CANONICAL_HOST}/industries/d2c-brands` },
                ],
              },
            ],
          },
        };
      }

      if (d2cSub === 2) {
        return {
          title: 'AI Commerce Platform for D2C Brands | SilarAI',
          description: SUBPAGE_CTR_VARIANTS['d2c-brands-2']?.direct || 'D2C AI commerce engine: real-time intent & +28% AOV lift.',
          keywords: 'AI Commerce Platform for D2C Brands, AI-powered ecommerce platform, D2C ecommerce platform, AI product search, conversational commerce for D2C, AI product discovery, AI customer engagement, ecommerce AI sales assistant, How can D2C brands use AI for ecommerce?, How does conversational commerce improve conversion?',
          canonicalUrl: `${origin}/industries/d2c-brands/ai-commerce-platform`,
          ogType: 'website',
          jsonLdSchema: {
            '@context': 'https://schema.org',
            '@graph': [
              commonOrg,
              {
                '@type': 'SoftwareApplication',
                name: 'SilarAI AI Commerce Platform for D2C Brands',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Cloud Native / Web / Headless API',
                description: 'Build intelligent shopping experiences with AI-powered product discovery, sales assistance, conversational commerce and commerce intelligence.',
                offers: {
                  '@type': 'Offer',
                  price: '25.00',
                  priceCurrency: 'USD',
                  priceValidUntil: '2027-12-31',
                  availability: 'https://schema.org/InStock',
                  url: `${origin}/#pricing`,
                },
              },
              {
                '@type': 'Service',
                name: 'AI Commerce Platform for D2C Brands',
                provider: { '@id': `${origin}/#organization` },
                serviceType: 'AI-Powered Ecommerce Platform & Catalog Intelligence',
              },
              {
                '@type': 'BreadcrumbList',
                '@id': `${origin}/industries/d2c-brands#breadcrumb`,
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                  { '@type': 'ListItem', position: 2, name: 'D2C Brands AI Platform', item: `${CANONICAL_HOST}/industries/d2c-brands` },
                ],
              },
            ],
          },
        };
      }

      if (d2cSub === 3) {
        return {
          title: 'How AI Can Increase D2C Ecommerce Sales | SilarAI',
          description: SUBPAGE_CTR_VARIANTS['d2c-brands-3']?.direct || '+35% D2C sales lift & 65% cart recovery (benchmark) via WhatsApp AI.',
          keywords: 'AI for D2C Sales, How AI Can Increase D2C Ecommerce Sales, AI cart recovery, AI sales assistant for ecommerce, AI customer engagement, WhatsApp AI sales assistant, How can AI increase D2C ecommerce sales?, How can AI reduce ecommerce cart abandonment?',
          canonicalUrl: `${origin}/industries/d2c-brands/increase-sales-with-ai`,
          ogType: 'website',
          jsonLdSchema: {
            '@context': 'https://schema.org',
            '@graph': [
              commonOrg,
              {
                '@type': 'SoftwareApplication',
                name: 'SilarAI D2C Ecommerce Sales & Growth AI Engine',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Cloud Native / Web / Headless API',
                description: 'Discover how AI can improve product discovery, conversions, average order value, cart recovery and customer engagement for D2C brands.',
                offers: {
                  '@type': 'Offer',
                  price: '10.00',
                  priceCurrency: 'USD',
                  priceValidUntil: '2027-12-31',
                  availability: 'https://schema.org/InStock',
                  url: `${origin}/#pricing`,
                },
              },
              {
                '@type': 'Service',
                name: 'AI for D2C Sales Optimization & Conversion Rate Enhancement',
                provider: { '@id': `${origin}/#organization` },
                serviceType: 'D2C AI Revenue & Cart Recovery Engine',
              },
              {
                '@type': 'BreadcrumbList',
                '@id': `${origin}/industries/d2c-brands#breadcrumb`,
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                  { '@type': 'ListItem', position: 2, name: 'D2C Brands AI Platform', item: `${CANONICAL_HOST}/industries/d2c-brands` },
                ],
              },
            ],
          },
        };
      }

      // Master Unified Experience
      const d2cCanonical = getCanonicalUrlForView('d2c-brands');
      const d2cTitle = 'AI Commerce Platform for D2C Brands | AI Shopping Assistant | SilarAI';
      const d2cDesc = 'Help D2C shoppers discover products, compare options, recover carts, and buy faster with SilarAI conversational shopping agents and dynamic pricing.';
      return {
        title: d2cTitle,
        description: d2cDesc,
        keywords: 'AI Shopping Assistant for D2C Brands, AI Commerce Platform for D2C Brands, AI for D2C Sales, AI ecommerce assistant, AI sales assistant for ecommerce, conversational commerce for D2C, AI product recommendations, AI product discovery, AI ecommerce chatbot, AI shopping assistant for ecommerce, AI-powered ecommerce platform, D2C ecommerce platform, ecommerce AI sales assistant, AI product search, conversational shopping, AI customer engagement, AI cart recovery, WhatsApp AI sales assistant',
        canonicalUrl: d2cCanonical,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'SoftwareApplication',
              name: 'SilarAI AI Commerce Platform & Shopping Assistant for D2C Brands',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Cloud Native / Web / Headless API',
              description: d2cDesc,
              offers: {
                '@type': 'Offer',
                price: '25.00',
                priceCurrency: 'USD',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock',
                url: `${origin}/#pricing`,
              },
            },
            {
              '@type': 'Service',
              name: 'AI Commerce Platform & Shopping Assistant for D2C Brands',
              provider: { '@id': `${CANONICAL_HOST}/#organization` },
              serviceType: 'Conversational D2C Shopping Assistant & Growth Platform',
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${d2cCanonical}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                { '@type': 'ListItem', position: 2, name: 'AI Commerce Platform for D2C Brands', item: d2cCanonical },
              ],
            },
          ],
        },
      };
    }

    case 'distributors': {
      const distCanonical = getCanonicalUrlForView('distributors');
      const distTitle = 'AI Commerce Platform for Distributors | AI Shopping Assistant | SilarAI';
      const distDesc = 'Transform wholesale distribution with AI Shopping Assistants, dealer ordering portals, contract pricing, live ERP sync, and multi-warehouse visibility.';
      const distKeywords = 'Conversational Commerce, Agentic AI, AI Commerce Platform for Distributors, Distribution Commerce Platform, AI Shopping Assistant for Distributors, B2B Commerce Platform, Dealer Portal Software, Customer-Specific Pricing AI, ERP Integrated Ordering, Multi-Warehouse Inventory Visibility, Automated RFQ Software, Distributor Sales Assistant, B2B Distribution AI, Wholesale Commerce, Product Catalog Management, Dealer Ordering Software';

      const distFaqs = [
        {
          '@type': 'Question',
          name: 'What is an AI Commerce Platform for B2B wholesale distributors?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'An AI Commerce Platform for Distributors is an enterprise system that modernizes B2B ordering through dealer self-service portals, customer-specific contract pricing matrices, real-time multi-warehouse inventory visibility, and conversational AI buying agents that resolve complex part queries in seconds.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does SilarAI handle complex customer-specific contract pricing in B2B distribution?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'SilarAI connects bi-directionally with your ERP (SAP, NetSuite, Microsoft Dynamics 365, Odoo) to calculate negotiated contract pricing, volume discount tiers, and customer credit limits in under 30 milliseconds.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can distributors automate RFQ and quote-to-order workflows with AI?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. SilarAI automatically parses uploaded bill-of-materials (BOM) spreadsheets, customer RFQ PDFs, and natural-language requests into structured quotes with margin-protection guardrails and one-click purchase order conversion.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does SilarAI improve Google Top 5 rankings and AI Overviews (AIO) for wholesale distributors?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'SilarAI provides dense vector neural search, verified E-E-A-T schemas, NAW and GS1 standards alignment, and comprehensive Schema.org ontologies, driving organic visibility in Google Search, Gemini AI Overviews, and Perplexity generative answers.',
          },
        },
      ];

      return {
        title: distTitle,
        description: distDesc,
        keywords: distKeywords,
        canonicalUrl: distCanonical,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'WebPage',
              '@id': `${distCanonical}#webpage`,
              url: distCanonical,
              name: distTitle,
              description: distDesc,
              isPartOf: {
                '@type': 'WebSite',
                '@id': `${origin}/#website`,
                name: 'SilarAI Smart Commerce AI Platform',
                url: origin,
              },
              about: {
                '@type': 'Thing',
                name: 'B2B Wholesale Distribution Commerce & Dealer Portals',
                description: distDesc,
                sameAs: [
                  'https://en.wikipedia.org/wiki/Wholesale',
                  'https://en.wikipedia.org/wiki/Distribution_(business)',
                  'https://www.wikidata.org/wiki/Q1549591',
                  'https://www.wikidata.org/wiki/Q200315'
                ]
              },
              citation: [
                'https://www.naw.org/',
                'https://www.gs1.org/standards/edi',
                'https://www.oagi.org/',
                'https://schema.org/WholesaleStore',
                'https://www.w3.org/TR/payment-request/'
              ],
              publisher: { '@id': `${origin}/#organization` },
              speakable: {
                '@type': 'SpeakableSpecification',
                cssSelector: ['h1', 'h2', '.distributor-summary', '.faq-question', '.faq-answer']
              }
            },
            {
              '@type': 'SoftwareApplication',
              '@id': `${distCanonical}#software`,
              name: 'SilarAI Distribution Commerce AI Platform',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Cloud Native / Web / Headless API',
              description: distDesc,
              featureList: [
                'Dealer Self-Service Portal',
                'Customer-Specific Contract Pricing Engine (Sub-30ms)',
                'Multi-Warehouse Real-Time Inventory Visibility',
                'Automated RFQ & BOM Parsing Engine',
                'ERP Bi-Directional Connectors (SAP, NetSuite, Dynamics 365)',
                '24/7 AI Technical Parts Finder & Substitute Recommendations'
              ],
              offers: {
                '@type': 'Offer',
                price: '25.00',
                priceCurrency: 'USD',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock',
                seller: { '@id': `${origin}/#organization` },
                url: `${origin}/#pricing`,
              },
            },
            {
              '@type': 'Service',
              '@id': `${distCanonical}#service`,
              name: 'AI Commerce Platform for Distributors',
              provider: { '@id': `${origin}/#organization` },
              serviceType: 'B2B Wholesale Distribution AI Solutions',
              areaServed: 'Worldwide',
              description: distDesc,
            },
            {
              '@type': 'FAQPage',
              '@id': `${distCanonical}#faq`,
              mainEntity: distFaqs,
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${distCanonical}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                { '@type': 'ListItem', position: 2, name: 'Distributors AI Platform', item: distCanonical },
              ],
            },
          ],
        },
      };
    }

    case 'manufacturing': {
      if (manufacturingSub === 1) {
        return {
          title: 'AI Commerce Platform for Manufacturing | SilarAI',
          description: SUBPAGE_CTR_VARIANTS['manufacturing-1']?.direct || 'B2B manufacturing commerce with SAP, Oracle & live RFQs.',
          keywords: 'AI Commerce Platform for Manufacturing, AI for manufacturing, AI manufacturing commerce platform, B2B ecommerce for manufacturers, manufacturing ecommerce platform, AI sales assistant for manufacturers, AI shopping assistant for manufacturers, manufacturing dealer portal, manufacturer distributor portal, AI product discovery, manufacturing RFQ software, AI RFQ management, manufacturing quotation software, digital commerce for manufacturers, B2B commerce platform for manufacturers',
          canonicalUrl: `${origin}/industries/manufacturing/ai-commerce-platform`,
          ogType: 'website',
          jsonLdSchema: {
            '@context': 'https://schema.org',
            '@graph': [
              commonOrg,
              {
                '@type': 'SoftwareApplication',
                name: 'SilarAI AI Commerce Platform for Manufacturing',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Cloud Native / Web / Headless API',
                description: 'AI-powered B2B commerce for manufacturers. Digitize product discovery, dealer commerce, RFQs, quotations and ordering with SilarAI.',
                offers: {
                  '@type': 'Offer',
                  price: '25.00',
                  priceCurrency: 'USD',
                  priceValidUntil: '2027-12-31',
                  availability: 'https://schema.org/InStock',
                  url: `${origin}/#pricing`,
                },
              },
              {
                '@type': 'Service',
                name: 'AI Commerce Platform for Manufacturing',
                provider: { '@id': `${origin}/#organization` },
                serviceType: 'Manufacturing B2B AI Commerce & RFQ Workflows',
              },
              {
                '@type': 'BreadcrumbList',
                '@id': `${origin}/industries/manufacturing#breadcrumb`,
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                  { '@type': 'ListItem', position: 2, name: 'Manufacturing AI Platform', item: `${CANONICAL_HOST}/industries/manufacturing` },
                ],
              },
            ],
          },
        };
      }

      if (manufacturingSub === 2) {
        return {
          title: 'AI Shopping Assistant for Manufacturers | SilarAI',
          description: SUBPAGE_CTR_VARIANTS['manufacturing-2']?.direct || 'Industrial AI spec search. Turn CAD queries into RFQs.',
          keywords: 'AI Shopping Assistant for Manufacturers, AI sales assistant for manufacturing, AI product discovery for manufacturers, manufacturing AI assistant, industrial AI shopping assistant, B2B AI sales assistant, AI product recommendation manufacturing, manufacturing product search, AI RFQ assistant, dealer AI assistant, distributor AI assistant, conversational commerce manufacturing',
          canonicalUrl: `${origin}/industries/manufacturing/ai-shopping-sales-assistant`,
          ogType: 'website',
          jsonLdSchema: {
            '@context': 'https://schema.org',
            '@graph': [
              commonOrg,
              {
                '@type': 'SoftwareApplication',
                name: 'SilarAI AI Shopping & Sales Assistant for Manufacturers',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Cloud Native / Web / Headless API',
                description: 'Turn complex product selection into an intelligent buying experience with conversational AI product discovery and automated RFQ workflows.',
                offers: {
                  '@type': 'Offer',
                  price: '10.00',
                  priceCurrency: 'USD',
                  priceValidUntil: '2027-12-31',
                  availability: 'https://schema.org/InStock',
                  url: `${origin}/#pricing`,
                },
              },
              {
                '@type': 'Service',
                name: 'AI Shopping & Sales Assistant for Manufacturers',
                provider: { '@id': `${origin}/#organization` },
                serviceType: 'Industrial Technical Product Discovery & Conversational Sales',
              },
              {
                '@type': 'BreadcrumbList',
                '@id': `${origin}/industries/manufacturing#breadcrumb`,
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                  { '@type': 'ListItem', position: 2, name: 'Manufacturing AI Platform', item: `${CANONICAL_HOST}/industries/manufacturing` },
                ],
              },
            ],
          },
        };
      }

      if (manufacturingSub === 3) {
        return {
          title: 'AI Dealer & Distributor Commerce Platform | SilarAI',
          description: SUBPAGE_CTR_VARIANTS['manufacturing-3']?.direct || 'AI dealer portal for manufacturers with ERP bulk orders.',
          keywords: 'AI Dealer Portal for Manufacturers, AI distributor platform, manufacturer dealer portal, manufacturing dealer portal, distributor commerce platform, B2B dealer portal, B2B distributor portal, AI dealer management, dealer ecommerce platform, manufacturer ecommerce platform, manufacturing channel commerce, AI B2B commerce, distributor ordering platform, dealer ordering platform, manufacturing digital commerce',
          canonicalUrl: `${origin}/industries/manufacturing/dealer-distributor-commerce`,
          ogType: 'website',
          jsonLdSchema: {
            '@context': 'https://schema.org',
            '@graph': [
              commonOrg,
              {
                '@type': 'SoftwareApplication',
                name: 'SilarAI AI Dealer & Distributor Commerce Platform for Manufacturers',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Cloud Native / Web / Headless API',
                description: 'Digitize your manufacturing distribution network with AI-powered dealer login, context builder, and enterprise ERP/CRM integration.',
                offers: {
                  '@type': 'Offer',
                  price: '25.00',
                  priceCurrency: 'USD',
                  priceValidUntil: '2027-12-31',
                  availability: 'https://schema.org/InStock',
                  url: `${origin}/#pricing`,
                },
              },
              {
                '@type': 'Service',
                name: 'AI Dealer & Distributor Commerce Platform',
                provider: { '@id': `${origin}/#organization` },
                serviceType: 'Manufacturing Channel Commerce & Dealer Automation',
              },
              {
                '@type': 'BreadcrumbList',
                '@id': `${origin}/industries/manufacturing#breadcrumb`,
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                  { '@type': 'ListItem', position: 2, name: 'Manufacturing AI Platform', item: `${CANONICAL_HOST}/industries/manufacturing` },
                ],
              },
            ],
          },
        };
      }

      // Master Unified Experience
      const mfgCanonical = getCanonicalUrlForView('manufacturing');
      const mfgTitle = 'AI Commerce Platform for Manufacturers | B2B AI Shopping Assistant | SilarAI';
      const mfgDesc = 'Transform manufacturing commerce with AI Shopping Assistants, dealer self-service portals, automated RFQs, ERP integration, and intelligent spec search.';
      return {
        title: mfgTitle,
        description: mfgDesc,
        keywords: 'AI Commerce Platform for Manufacturing, AI for manufacturing, AI manufacturing commerce platform, B2B ecommerce for manufacturers, manufacturing ecommerce platform, AI sales assistant for manufacturers, AI shopping assistant for manufacturers, manufacturing dealer portal, manufacturer distributor portal, AI product discovery, manufacturing RFQ software, AI RFQ management, manufacturing quotation software, digital commerce for manufacturers, B2B commerce platform for manufacturers',
        canonicalUrl: mfgCanonical,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'SoftwareApplication',
              name: 'SilarAI Manufacturing Commerce AI Platform',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Cloud Native / Web / Headless API',
              description: mfgDesc,
              offers: {
                '@type': 'Offer',
                price: '25.00',
                priceCurrency: 'USD',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock',
                url: `${origin}/#pricing`,
              },
            },
            {
              '@type': 'Service',
              name: 'AI Commerce Platform for Manufacturers',
              provider: { '@id': `${CANONICAL_HOST}/#organization` },
              serviceType: 'Manufacturing AI Commerce Solutions',
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${mfgCanonical}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                { '@type': 'ListItem', position: 2, name: 'Manufacturing AI Platform', item: mfgCanonical },
              ],
            },
          ],
        },
      };
    }

    case 'wholesalers': {
      const wholesaleCanonical = getCanonicalUrlForView('wholesalers');
      const wholesaleTitle = 'AI Commerce Platform for Wholesalers | B2B AI Shopping Assistant | SilarAI';
      const wholesaleDesc = 'Modernize wholesale commerce with AI Shopping Assistants, B2B ordering, dealer portals, RFQ automation, ERP integration, and AI-powered product discovery.';
      return {
        title: wholesaleTitle,
        description: wholesaleDesc,
        keywords: 'AI Commerce Platform for Wholesalers, Wholesale Commerce Platform, AI Shopping Assistant for Wholesale, B2B Commerce Platform, Wholesale Ordering Platform, Wholesale AI, AI Product Search, Wholesale Customer Portal, Dealer Ordering Software, RFQ Automation, Customer-Specific Pricing, Wholesale Ecommerce Platform, AI Sales Assistant, Wholesale ERP Integration, B2B Ordering Software, Best AI commerce platform for wholesalers, AI shopping assistant for wholesale businesses, B2B commerce platform for wholesalers, Wholesale customer portal with AI, AI product search for wholesale catalogs, ERP-integrated wholesale commerce platform, RFQ automation software for wholesalers, AI platform for wholesale distributors, Customer-specific pricing software for wholesale, AI ordering platform for wholesale businesses',
        canonicalUrl: wholesaleCanonical,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'SoftwareApplication',
              name: 'SilarAI Wholesale Commerce AI Platform',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Cloud Native / Web / Headless API',
              description: wholesaleDesc,
              offers: {
                '@type': 'Offer',
                price: '25.00',
                priceCurrency: 'USD',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock',
                url: `${origin}/#pricing`,
              },
            },
            {
              '@type': 'Service',
              name: 'AI Commerce Platform for Wholesalers',
              provider: { '@id': `${CANONICAL_HOST}/#organization` },
              serviceType: 'B2B Wholesale AI Solutions',
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${wholesaleCanonical}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                { '@type': 'ListItem', position: 2, name: 'Wholesalers AI Platform', item: wholesaleCanonical },
              ],
            },
          ],
        },
      };
    }

    case 'fmcg-commerce':
    case 'fmcg': {
      const fmcgCanonical = getCanonicalUrlForView('fmcg');
      const fmcgTitle = 'AI Commerce Platform for FMCG & CPG Brands | B2B & D2C Ordering | SilarAI';
      const fmcgDesc = 'Top-ranked FMCG AI commerce platform. Automate distributor matrix ordering, trade credit promotions, 24/7 AI shopping assistants, and D2C brand stores.';
      const fmcgKeywords = 'Conversational Commerce, Agentic AI, FMCG AI Commerce, AI Commerce Platform for FMCG, CPG Brands Ecommerce AI, FMCG Retailer Ordering Solution, FMCG B2B Commerce, Distributor Reorder Portal, WhatsApp FMCG Ordering, Predictive Replenishment AI, Consumer Goods AI Platform, Fast Moving Consumer Goods AI, CPG Trade Promotion Optimization';

      const fmcgFaqs = [
        {
          '@type': 'Question',
          name: 'What is AI Commerce for FMCG companies?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'AI Commerce uses artificial intelligence to improve product discovery, distributor replenishment ordering, trade promotion optimization, and omnichannel sales across B2B and retail channels.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does an AI Shopping Assistant help FMCG brands?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'An AI Shopping Assistant helps retailers, distributors, and consumers discover products, compare packaging variants, check real-time stock, and place reorders via conversational chat and voice.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can SilarAI automate FMCG retailer replenishment and distributor ordering?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. SilarAI provides self-service distributor ordering portals, automated restock alerts, trade credit terms, volume tiered pricing, and ERP integration.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does SilarAI integrate with FMCG ERP systems like SAP and NetSuite?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. SilarAI offers pre-built bi-directional connectors for SAP S/4HANA, Oracle NetSuite, Microsoft Dynamics 365, and major supply chain EDI backends.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does SilarAI achieve Google Top 5 rankings and AI Overview (AIO) indexing for FMCG brands?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'SilarAI implements GS1 barcode and GTIN ontologies, Consumer Goods Forum digital value chain standards, and comprehensive Schema.org structured data, ensuring high-authority E-E-A-T signals across Google Search and Generative Engines.',
          },
        },
      ];

      return {
        title: fmcgTitle,
        description: fmcgDesc,
        keywords: fmcgKeywords,
        canonicalUrl: fmcgCanonical,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'WebPage',
              '@id': `${fmcgCanonical}#webpage`,
              url: fmcgCanonical,
              name: fmcgTitle,
              description: fmcgDesc,
              isPartOf: {
                '@type': 'WebSite',
                '@id': `${origin}/#website`,
                name: 'SilarAI Smart Commerce AI Platform',
                url: origin,
              },
              about: {
                '@type': 'Thing',
                name: 'Fast-Moving Consumer Goods (FMCG) & Consumer Packaged Goods (CPG) AI Commerce',
                description: fmcgDesc,
                sameAs: [
                  'https://en.wikipedia.org/wiki/Fast-moving_consumer_goods',
                  'https://en.wikipedia.org/wiki/Retail',
                  'https://www.wikidata.org/wiki/Q6501308',
                  'https://www.wikidata.org/wiki/Q1151624'
                ]
              },
              citation: [
                'https://www.gs1.org/standards',
                'https://www.theconsumergoodsforum.com/',
                'https://schema.org/WholesaleStore',
                'https://www.w3.org/TR/payment-request/'
              ],
              publisher: { '@id': `${origin}/#organization` },
              speakable: {
                '@type': 'SpeakableSpecification',
                cssSelector: ['h1', 'h2', '.fmcg-summary', '.faq-question', '.faq-answer']
              }
            },
            {
              '@type': 'SoftwareApplication',
              '@id': `${fmcgCanonical}#software`,
              name: 'SilarAI FMCG & CPG Commerce AI Platform',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Cloud Native / Web / Headless API',
              description: fmcgDesc,
              featureList: [
                'Digitized Retailer & Trade Ordering Portals',
                'Conversational WhatsApp Order Assistant',
                'Multi-Pack SKU & Variant Neural Discovery',
                'Tiered Wholesale Pricing & Trade Promotion Engine',
                'Automated 1-Click Replenishment Engine',
                'Pre-Built ERP Connectors (SAP S/4HANA, NetSuite, Dynamics 365)'
              ],
              offers: {
                '@type': 'Offer',
                price: '25.00',
                priceCurrency: 'USD',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock',
                seller: { '@id': `${origin}/#organization` },
                url: `${origin}/#pricing`,
              },
            },
            {
              '@type': 'Service',
              '@id': `${fmcgCanonical}#service`,
              name: 'AI Commerce Platform for FMCG & CPG',
              provider: { '@id': `${origin}/#organization` },
              serviceType: 'FMCG & CPG Conversational Commerce',
              areaServed: 'Worldwide',
              description: fmcgDesc,
            },
            {
              '@type': 'FAQPage',
              '@id': `${fmcgCanonical}#faq`,
              mainEntity: fmcgFaqs,
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${fmcgCanonical}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                { '@type': 'ListItem', position: 2, name: 'FMCG AI Commerce', item: fmcgCanonical },
              ],
            },
          ],
        },
      };
    }

    case 'fmcg-retailer-ordering-solution': {
      const fmcgOrdCanonical = `${origin}/industries/fmcg/retailer-ordering-solution`;
      const fmcgOrdTitle = 'AI-Powered FMCG Retailer Ordering Solution | SilarAI B2B Commerce';
      const fmcgOrdDesc = 'Make FMCG ordering as simple as conversation. SilarAI AI Shopping Assistant helps FMCG manufacturers, distributors, and wholesalers simplify bulk ordering across 1,000+ SKUs.';
      const fmcgOrdKeywords = 'Conversational Commerce, Agentic AI, AI-Powered FMCG Retailer Ordering Solution, FMCG Retailer Ordering, AI Shopping Assistant for FMCG, FMCG B2B Ordering, WhatsApp Ordering for Retailers, Bulk Ordering FMCG, CPG Distributor Portal, SilarAI FMCG';

      const fmcgOrdFaqs = [
        {
          '@type': 'Question',
          name: 'What is an FMCG retailer ordering solution?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'An FMCG retailer ordering solution helps manufacturers, distributors and wholesalers provide retailers with a digital way to discover products, select quantities and place or manage orders through natural language.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can SilarAI handle large FMCG product catalogs?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. SilarAI is designed to make large product catalogs easier to explore through AI-powered product discovery across thousands of SKUs and pack variants.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can retailers search products using natural language?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Retailers can describe what they need rather than relying only on SKU numbers, categories or traditional catalog navigation.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can SilarAI support bulk ordering?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The AI-assisted experience can help retailers identify products and quantities for bulk or B2B orders with negotiated case pricing.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can SilarAI support WhatsApp ordering?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'SilarAI can support AI-assisted conversational commerce through configured channels, including WhatsApp integrations where enabled.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does SilarAI replace an ERP?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. SilarAI can operate as an AI commerce and ordering layer alongside existing ERP, CRM and business systems.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can FMCG distributors use SilarAI?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Distributors can use SilarAI to provide AI-assisted product discovery and digital ordering experiences for retailers and business customers.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can manufacturers use SilarAI?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. FMCG manufacturers can use SilarAI to make product catalogs easier to discover and provide retailers with a more digital ordering experience.',
          },
        },
      ];

      return {
        title: fmcgOrdTitle,
        description: fmcgOrdDesc,
        keywords: fmcgOrdKeywords,
        canonicalUrl: fmcgOrdCanonical,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'WebPage',
              '@id': `${fmcgOrdCanonical}#webpage`,
              url: fmcgOrdCanonical,
              name: fmcgOrdTitle,
              description: fmcgOrdDesc,
              isPartOf: {
                '@type': 'WebSite',
                '@id': `${origin}/#website`,
                name: 'SilarAI Smart Commerce AI Platform',
                url: origin,
              },
              about: {
                '@type': 'Thing',
                name: 'AI-Powered FMCG Retailer Ordering Solution',
                description: fmcgOrdDesc,
              },
              publisher: { '@id': `${origin}/#organization` },
            },
            {
              '@type': 'SoftwareApplication',
              '@id': `${fmcgOrdCanonical}#software`,
              name: 'SilarAI FMCG Retailer Ordering Solution',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Cloud Native / Web / WhatsApp / Headless API',
              description: fmcgOrdDesc,
              url: fmcgOrdCanonical,
            },
            {
              '@type': 'Service',
              '@id': `${fmcgOrdCanonical}#service`,
              name: 'FMCG Retailer Ordering Solution',
              provider: { '@id': `${origin}/#organization` },
              serviceType: 'FMCG B2B Ordering & Conversational Commerce',
              areaServed: 'Worldwide',
              description: fmcgOrdDesc,
            },
            {
              '@type': 'FAQPage',
              '@id': `${fmcgOrdCanonical}#faq`,
              mainEntity: fmcgOrdFaqs,
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${fmcgOrdCanonical}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_HOST}/` },
                { '@type': 'ListItem', position: 2, name: 'FMCG AI Commerce', item: `${CANONICAL_HOST}/industries/fmcg` },
                { '@type': 'ListItem', position: 3, name: 'Retailer Ordering Solution', item: fmcgOrdCanonical },
              ],
            },
          ],
        },
      };
    }

    case 'launch-online-store': {
      const launchCanonical = getCanonicalUrlForView('launch-online-store');
      const launchTitle = 'Launch an Online Store in 30 Minutes | SilarAI';
      const launchDesc = 'Launch your B2B or B2C ecommerce store with SilarAI. Customize your brand, add your logo and banner, configure SEO and store policies, and publish your storefront.';
      const launchKeywords = 'Launch an Online Store in 30 Minutes, Create an Ecommerce Store, B2B Ecommerce Store Builder, B2C Ecommerce Platform, Wholesale Ecommerce Platform, Online Store for Manufacturers, Ecommerce Platform for Distributors, Custom Domain Storefront, Turnkey Online Store';

      const launchFaqItems = [
        {
          '@type': 'Question',
          name: 'Can I launch a store in under 30 minutes?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The initial storefront setup—selecting brand colours, uploading your logo and hero banner, configuring page titles, inputting store policies, and setting up domain mapping—is designed to be completed in under 30 minutes. However, external prerequisites such as DNS propagation, payment gateway merchant approvals, and importing extensive product catalogues will require additional time after publishing.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need my own domain?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. You must bring your own registered domain name (from providers such as GoDaddy, Namecheap, Cloudflare, Google Domains, or Hostinger). SilarAI does not provide free domain registrations. To connect it, you create a simple CNAME DNS record pointing to SilarAI servers.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I publish before adding all my products?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. SilarAI is purposefully architected so you can establish and publish your branded storefront first. This lets you secure your custom domain presence, showcase your brand aesthetics, publish your official contact and return policies, and share your store link while you build, import, or refine your catalogue in the backend.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I launch a B2B store?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. SilarAI includes native B2B wholesale capabilities, including customer and dealer accounts, tiered contract pricing rules, minimum order quantities (MOQs), request for quote (RFQ) workflows, tax-exempt business accounts, and wholesale order management without needing expensive enterprise add-ons.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I launch a B2C ecommerce store?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. SilarAI provides complete B2C capabilities including modern responsive storefronts, shopping carts, direct card and digital wallet checkout integrations, product discovery, and our AI Shopping Assistant copilot for 24/7 conversational customer recommendations.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need coding skills?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No coding skills are required to configure your brand colours, upload your logo and banner, set up SEO tags, or input policies in the SilarAI dashboard. The only technical step is adding a CNAME DNS record at your domain provider, for which SilarAI provides step-by-step instructions.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I add products after launching?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Once your storefront is published, log in to your SilarAI merchant dashboard. From the Catalogue manager, you can add products individually through a visual editor or import bulk catalogues via standard CSV/Excel files or native Shopify/WooCommerce catalog sync connectors.',
          },
        },
        {
          '@type': 'Question',
          name: 'Will my store automatically rank on Google?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. No ecommerce platform can guarantee search engine rankings. SilarAI provides built-in SEO tools—allowing you to configure custom meta titles, descriptions, canonical tags, and structured Schema.org data so search engines can properly crawl and index your storefront. However, actual search rankings depend on content quality, market competition, domain authority, backlinks, and search engine algorithms.',
          },
        },
      ];

      return {
        title: launchTitle,
        description: launchDesc,
        keywords: launchKeywords,
        canonicalUrl: launchCanonical,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'WebPage',
              '@id': `${launchCanonical}#webpage`,
              url: launchCanonical,
              name: launchTitle,
              description: launchDesc,
              isPartOf: {
                '@type': 'WebSite',
                '@id': `${origin}/#website`,
                name: 'SilarAI Smart Commerce AI Platform',
                url: origin,
              },
              about: {
                '@type': 'Thing',
                name: 'Turnkey Ecommerce Storefront Launch in Under 30 Minutes',
                description: launchDesc,
              },
              publisher: { '@id': `${origin}/#organization` },
            },
            {
              '@type': 'SoftwareApplication',
              '@id': `${launchCanonical}#software`,
              name: 'SilarAI Turnkey Online Store Builder',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Cloud Native / Web / All Modern Browsers',
              description: launchDesc,
              url: launchCanonical,
              offers: {
                '@type': 'Offer',
                price: '25.00',
                priceCurrency: 'USD',
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock',
                seller: { '@id': `${origin}/#organization` },
                url: `${origin}/#pricing`,
              },
            },
            {
              '@type': 'HowTo',
              '@id': `${launchCanonical}#howto`,
              name: 'How to Launch Your Online Store in Under 30 Minutes with SilarAI',
              description: 'Follow this eight-step process to configure your brand colors, logo, banner, SEO metadata, custom domain, and policies to launch your online storefront.',
              totalTime: 'PT30M',
              step: [
                {
                  '@type': 'HowToStep',
                  position: 1,
                  name: 'Log in to SilarAI',
                  text: 'Log in to your SilarAI account and open the dedicated store setup workflow.',
                },
                {
                  '@type': 'HowToStep',
                  position: 2,
                  name: 'Select Your Brand Colours',
                  text: 'Select colors that reflect your brand identity and storefront style.',
                },
                {
                  '@type': 'HowToStep',
                  position: 3,
                  name: 'Add Your Logo',
                  text: 'Upload your business logo to personalize your storefront header and email receipts.',
                },
                {
                  '@type': 'HowToStep',
                  position: 4,
                  name: 'Add Your Hero Banner',
                  text: 'Upload a banner image to showcase your business, brand positioning, or products.',
                },
                {
                  '@type': 'HowToStep',
                  position: 5,
                  name: 'Add Your SEO Title and Content',
                  text: 'Configure your page title and SEO content to explain your business and improve search engine comprehension.',
                },
                {
                  '@type': 'HowToStep',
                  position: 6,
                  name: 'Connect Your Own Domain',
                  text: 'Add a CNAME DNS record pointing your custom domain to cname.silarai.com with automatic SSL encryption.',
                },
                {
                  '@type': 'HowToStep',
                  position: 7,
                  name: 'Add Your Return and Refund Policy',
                  text: 'Add your store return and refund terms before launching to ensure legal compliance and buyer clarity.',
                },
                {
                  '@type': 'HowToStep',
                  position: 8,
                  name: 'Launch Your Store and Add Products',
                  text: 'Publish your configured storefront directly, then log in to your SilarAI backend to add products to your catalogue.',
                },
              ],
            },
            {
              '@type': 'FAQPage',
              '@id': `${launchCanonical}#faq`,
              mainEntity: launchFaqItems,
            },
            {
              '@type': 'BreadcrumbList',
              '@id': `${launchCanonical}#breadcrumb`,
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
                { '@type': 'ListItem', position: 2, name: 'Launch Online Store', item: launchCanonical },
              ],
            },
          ],
        },
      };
    }

    case 'home':
    default:
      return {
        title: 'AI Shopping Assistant for Ecommerce | SilarAI Commerce Platform',
        description: 'Boost ecommerce sales and conversion with SilarAI\'s AI Shopping Assistant. Deliver 24/7 conversational product discovery, smart recommendations, and instant checkout.',
        keywords: 'AI Shopping Assistant for Ecommerce, Conversational Commerce, AI Product Discovery, Agentic AI, Smart Commerce AI, Ecommerce AI Chatbot, Product Recommendation AI, Shopify AI Assistant, B2B Commerce Platform, Dynamic Pricing AI',
        canonicalUrl: `${origin}/`,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              ...commonOrg,
              knowsAbout: [
                'AI Shopping Assistant for Ecommerce',
                'Conversational Commerce',
                'Agentic AI',
                'AI Commerce Platform',
                'Enterprise AI Commerce Platform',
                'AI Shopping Assistant',
                'AI Product Discovery',
                'AI Product Recommendations',
                'Shopify AI Shopping Assistant',
                'WooCommerce AI Shopping Assistant',
                'Dynamic Pricing Engine',
                'Ecommerce AI Platform'
              ],
            },
            {
              '@type': 'WebSite',
              '@id': `${origin}/#website`,
              url: origin,
              name: 'SilarAI Smart Commerce AI Platform',
              description: 'The premier agentic AI platform for modern e-commerce stores, D2C brands, and marketplaces.',
              publisher: { '@id': `${origin}/#organization` },
              potentialAction: {
                '@type': 'SearchAction',
                target: `${origin}/?search={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            },
            {
              '@type': 'SoftwareApplication',
              '@id': `${origin}/#software`,
              name: 'SilarAI Smart Commerce Engine',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web, Shopify, WooCommerce, Headless Cloud API',
              description: 'Autonomous AI commerce suite with natural language conversational shopping, visual search, and 1-click agentic checkout.',
              offers: [
                {
                  '@type': 'Offer',
                  name: 'SilarAI Shopping Assistant Starter',
                  price: '10.00',
                  priceCurrency: 'USD',
                  priceValidUntil: '2027-12-31',
                  availability: 'https://schema.org/InStock',
                  url: `${origin}/#pricing`,
                  description: 'Essential AI shopping assistant, product discovery, and recommendations for up to 500 conversations/month.',
                },
                {
                  '@type': 'Offer',
                  name: 'SilarAI Shopping Assistant Growth',
                  price: '50.00',
                  priceCurrency: 'USD',
                  priceValidUntil: '2027-12-31',
                  availability: 'https://schema.org/InStock',
                  url: `${origin}/#pricing`,
                  description: 'Expanded conversation volume with WhatsApp integration, multi-language, and order tracking for up to 2,500 conversations/month.',
                },
                {
                  '@type': 'Offer',
                  name: 'SilarAI Commerce Platform Starter',
                  price: '25.00',
                  priceCurrency: 'USD',
                  priceValidUntil: '2027-12-31',
                  availability: 'https://schema.org/InStock',
                  url: `${origin}/#pricing`,
                  description: 'Complete AI-powered ecommerce store, catalog management, CMS, and social publishing.',
                },
                {
                  '@type': 'Offer',
                  name: 'SilarAI Commerce Platform Growth',
                  price: '50.00',
                  priceCurrency: 'USD',
                  priceValidUntil: '2027-12-31',
                  availability: 'https://schema.org/InStock',
                  url: `${origin}/#pricing`,
                  description: 'Marketing automation, social media scheduling, AI campaign assistance, and 2,500 conversations.',
                },
              ],
            },
            {
              '@type': 'HowTo',
              '@id': `${origin}/#howto-integration`,
              name: 'How to Integrate SilarAI into Shopify or WooCommerce in 3 Steps',
              description: 'Step-by-step guide to installing SilarAI Smart Commerce AI on your online store in under 5 minutes.',
              step: [
                {
                  '@type': 'HowToStep',
                  position: 1,
                  name: 'Copy Your SilarAI Script Key',
                  text: 'Log into your SilarAI Admin Dashboard and copy your unique 1-line script Embed Tag.',
                },
                {
                  '@type': 'HowToStep',
                  position: 2,
                  name: 'Paste Script into Theme Footer',
                  text: 'Paste the script snippet directly into your Shopify theme.liquid, WooCommerce header/footer, or custom HTML layout.',
                },
                {
                  '@type': 'HowToStep',
                  position: 3,
                  name: 'Automated Catalog Indexing',
                  text: 'SilarAI automatically indexes your product catalog and activates the AI Shopping Assistant and Dynamic Pricing Engine instantly.',
                },
              ],
            },
            {
              '@type': 'WebPage',
              '@id': `${origin}/#webpage`,
              url: origin,
              name: 'SilarAI Smart Commerce AI Platform',
              speakable: {
                '@type': 'SpeakableSpecification',
                cssSelector: ['#hero-heading', '#hero-description', '#faq-question', '#faq-answer'],
              },
            },
          ],
        },
      };
  }
}

