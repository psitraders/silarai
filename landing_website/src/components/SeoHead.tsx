import React, { useEffect } from 'react';

interface SeoHeadProps {
  currentView: string;
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
  aiShoppingSubPage,
  aiCommerceSubPage,
  d2cSubPage,
  manufacturingSubPage,
}) => {
  useEffect(() => {
    const origin = window.location.origin;
    const currentUrl = window.location.href;

    // Get page specific SEO metadata
    const meta = getPageMetadata(currentView, aiShoppingSubPage, aiCommerceSubPage, d2cSubPage, manufacturingSubPage, origin, currentUrl);

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
    setMetaTag('meta[name="description"]', 'name', 'description', meta.description);
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', meta.keywords);
    setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('meta[name="author"]', 'name', 'author', 'SilarAi Engineering & AI Research Team');
    setMetaTag('meta[name="publisher"]', 'name', 'publisher', 'SilarAi Technologies');

    // GEO / Geolocation & Regional Meta
    setMetaTag('meta[name="geo.region"]', 'name', 'geo.region', 'US-CA');
    setMetaTag('meta[name="geo.placename"]', 'name', 'geo.placename', 'San Francisco, CA');
    setMetaTag('meta[name="geo.position"]', 'name', 'geo.position', '37.774929;-122.419416');
    setMetaTag('meta[name="ICBM"]', 'name', 'ICBM', '37.774929, -122.419416');

    // Voice Search & AI Engine Directives
    setMetaTag('meta[name="rating"]', 'name', 'rating', 'general');
    setMetaTag('meta[name="revisit-after"]', 'name', 'revisit-after', '1 days');
    setMetaTag('meta[name="ai-search-indexing"]', 'name', 'ai-search-indexing', 'allow');
    setMetaTag('meta[name="chatgpt-plugin"]', 'name', 'chatgpt-plugin', 'enabled');
    setMetaTag('meta[name="llm-knowledge-base"]', 'name', 'llm-knowledge-base', `${origin}/llms.txt`);

    // Open Graph Meta Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', meta.title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', meta.description);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', meta.canonicalUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', meta.ogType);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'SilarAi Smart Commerce AI');

    // Twitter Card Meta Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:site"]', 'name', 'twitter:site', '@SilarAi');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', meta.title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', meta.description);

    // Canonical Link
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
  }, [currentView, aiShoppingSubPage, aiCommerceSubPage, d2cSubPage]);

  return null; // Side-effect only head manager
};

function getPageMetadata(
  view: string,
  shoppingSub?: number,
  commerceSub?: number,
  d2cSub?: number,
  manufacturingSub?: number,
  origin: string = 'https://silarai.com',
  currentUrl: string = 'https://silarai.com'
): PageSeoMetadata {
  const commonOrg = {
    '@type': 'Organization',
    '@id': `${origin}/#organization`,
    name: 'SilarAi Technologies',
    url: origin,
    logo: `${origin}/assets/images/silarai_official_logo.jpg`,
    slogan: 'Build. Sell. Grow. Powered by AI.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@silarai.com',
      contactType: 'customer service',
      availableLanguage: ['English', 'Spanish', 'German', 'French'],
    },
  };

  switch (view) {
    case 'about':
      return {
        title: 'About SilarAi | Enterprise Agentic AI Commerce Leader & Team',
        description: 'Meet the engineering and AI research team behind SilarAi. Transforming modern retail with autonomous agentic shopping assistants, sub-50ms pricing engines, and enterprise SOC-2 security.',
        keywords: 'About SilarAi, AI Commerce Founders, Enterprise Retail AI, Autonomous E-Commerce Engine, SilarAi Leadership, E-Commerce Innovations',
        canonicalUrl: `${origin}/about`,
        ogType: 'article',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'AboutPage',
              '@id': `${origin}/about/#webpage`,
              url: `${origin}/about`,
              name: 'About SilarAi Technologies',
              description: 'Pioneering autonomous agentic AI shopping solutions for multi-billion dollar enterprise brands.',
              publisher: { '@id': `${origin}/#organization` },
              mainEntity: commonOrg,
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
                { '@type': 'ListItem', position: 2, name: 'About Us', item: `${origin}/about` },
              ],
            },
          ],
        },
      };

    case 'why-choose-us':
      return {
        title: 'Why Choose SilarAi? | 350% ROI Benchmark vs Legacy Tech Stacks',
        description: 'Discover why top D2C brands switch to SilarAi: +380% conversion rate lift, sub-50ms AI pricing engine, and instant script-embed support for Shopify, WooCommerce, & Custom APIs.',
        keywords: 'Why SilarAi, E-Commerce AI ROI, Best AI Shopping Assistant, Smart Commerce Comparison, Retail Conversions, SilarAi Advantages',
        canonicalUrl: `${origin}/why-choose-us`,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'WebPage',
              '@id': `${origin}/why-choose-us/#webpage`,
              url: `${origin}/why-choose-us`,
              name: 'Why Choose SilarAi Platform',
              description: 'Comprehensive ROI analysis and platform benchmark comparing traditional e-commerce against SilarAi Unified Smart Commerce AI.',
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
                { '@type': 'ListItem', position: 2, name: 'Why Choose Us', item: `${origin}/why-choose-us` },
              ],
            },
          ],
        },
      };

    case 'shopify-comparison':
      return {
        title: 'SilarAi vs Shopify | Next-Gen Agentic Commerce Platform Comparison',
        description: 'Comprehensive technical comparison between SilarAi and Shopify. See how SilarAi delivers native agentic shopping, sub-50ms dynamic pricing, and visual search without expensive monthly app stack fees.',
        keywords: 'SilarAi vs Shopify, Shopify Alternative, AI Commerce vs Shopify, Shopify App Consolidation, Smart Shopify Upgrade, Shopify AI Chat',
        canonicalUrl: `${origin}/shopify-vs-silarai`,
        ogType: 'article',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'TechArticle',
              '@id': `${origin}/shopify-vs-silarai/#article`,
              headline: 'SilarAi vs Shopify: Technical & Financial Comparison Blueprint',
              description: 'In-depth engineering audit comparing Shopify app eco-system fragmentation against SilarAi unified agentic AI platform.',
              author: { '@type': 'Organization', name: 'SilarAi Research Lab' },
              publisher: { '@id': `${origin}/#organization` },
              url: `${origin}/shopify-vs-silarai`,
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
                { '@type': 'ListItem', position: 2, name: 'Shopify vs SilarAi', item: `${origin}/shopify-vs-silarai` },
              ],
            },
          ],
        },
      };

    case 'woocommerce-comparison':
      return {
        title: 'SilarAi vs WooCommerce | High-Performance AI Commerce Integration',
        description: 'Upgrade your WooCommerce store with SilarAi. Replace bloated WordPress plugins with a high-performance cloud AI engine delivering instant agentic chat, visual search, and dynamic pricing.',
        keywords: 'SilarAi vs WooCommerce, WooCommerce AI Plugin Alternative, Smart WooCommerce Upgrade, Headless WooCommerce AI, WooCommerce Speed Optimization',
        canonicalUrl: `${origin}/woocommerce-vs-silarai`,
        ogType: 'article',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'TechArticle',
              '@id': `${origin}/woocommerce-vs-silarai/#article`,
              headline: 'SilarAi vs WooCommerce: Performance, Security & Conversion Architecture',
              description: 'Comparing traditional PHP WooCommerce plugin overhead with SilarAi cloud-hosted vector search and agentic AI.',
              author: { '@type': 'Organization', name: 'SilarAi Engineering Team' },
              publisher: { '@id': `${origin}/#organization` },
              url: `${origin}/woocommerce-vs-silarai`,
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
                { '@type': 'ListItem', position: 2, name: 'WooCommerce vs SilarAi', item: `${origin}/woocommerce-vs-silarai` },
              ],
            },
          ],
        },
      };

    case 'ai-shopping-assistant': {
      let subTitle = 'Agentic AI Voice & Conversational Search';
      if (shoppingSub === 2) subTitle = 'Visual Search & Multimodal Product Discovery';
      if (shoppingSub === 3) subTitle = 'Personalized Recommendations & One-Click Agent Checkout';

      return {
        title: `${subTitle} | SilarAi Shopping Assistant Engine`,
        description: 'Supercharge shopper conversions with SilarAi Shopping Assistant. Features natural language product discovery, camera visual search, 20+ voice languages, and 1-click agentic checkout.',
        keywords: 'AI Shopping Assistant, Conversational Commerce, AI Visual Search, Agentic Checkout, Multi-Language Voice Shopping, Retail Chatbot',
        canonicalUrl: `${origin}/?page=ai-shopping-assistant&subPage=${shoppingSub || 1}`,
        ogType: 'product',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'SoftwareApplication',
              name: `SilarAi Shopping Assistant - ${subTitle}`,
              applicationCategory: 'BusinessApplication, ECommerceApplication',
              operatingSystem: 'All Web Browsers, iOS, Android',
              offers: {
                '@type': 'Offer',
                price: '49.00',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                reviewCount: '128',
              },
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
                { '@type': 'ListItem', position: 2, name: 'AI Shopping Assistant', item: `${origin}/?page=ai-shopping-assistant` },
                { '@type': 'ListItem', position: 3, name: subTitle, item: `${origin}/?page=ai-shopping-assistant&subPage=${shoppingSub || 1}` },
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

      return {
        title: `${subTitle} | SilarAi Platform Engine`,
        description: 'Automate retail operations with SilarAi Platform Engine. Sub-50ms dynamic pricing recalculations, automated visual merchandising grid layouts, and unified inventory sync across web & social.',
        keywords: 'Dynamic Pricing AI, AI Visual Merchandising, E-Commerce Analytics, Retail Automation, Multi-Channel Inventory Engine, Smart Merchandising',
        canonicalUrl: `${origin}/?page=ai-commerce-platform&subPage=${commerceSub || 1}`,
        ogType: 'product',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'SoftwareApplication',
              name: `SilarAi Platform Engine - ${subTitle}`,
              applicationCategory: 'ECommerceApplication',
              operatingSystem: 'Cloud API, Web Platform',
              offers: {
                '@type': 'Offer',
                price: '149.00',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.95',
                reviewCount: '94',
              },
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
                { '@type': 'ListItem', position: 2, name: 'AI Commerce Platform', item: `${origin}/?page=ai-commerce-platform` },
                { '@type': 'ListItem', position: 3, name: subTitle, item: `${origin}/?page=ai-commerce-platform&subPage=${commerceSub || 1}` },
              ],
            },
          ],
        },
      };
    }

    case 'retail-commerce':
      return {
        title: 'AI Commerce Platform for Retail | AI Shopping Assistant | SilarAI',
        description: 'Transform retail with AI Shopping Assistants, omnichannel commerce, AI product search, personalized recommendations, inventory visibility, and customer engagement.',
        keywords: 'AI Commerce Platform for Retail, Retail AI Platform, AI Shopping Assistant for Retail, Omnichannel Commerce Platform, Retail Commerce Platform, AI Product Search, Retail Product Recommendations, Conversational Commerce, AI Customer Engagement, Retail Inventory Visibility, AI Customer Support, Omnichannel Retail, AI Sales Assistant, Retail Personalization, Digital Retail Platform, Best AI commerce platform for retailers, AI shopping assistant for retail stores, Omnichannel AI commerce platform, AI-powered retail customer experience platform, AI product search for retail websites, Conversational commerce for retailers, AI platform for retail inventory visibility, Personalized shopping AI for retail, AI retail assistant for ecommerce and physical stores, Enterprise AI commerce platform for retailers',
        canonicalUrl: `${origin}/?page=retail-commerce`,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'SoftwareApplication',
              name: 'SilarAI Retail Commerce AI Platform',
              applicationCategory: 'BusinessApplication, ECommerceApplication',
              operatingSystem: 'Cloud Native / Web / Headless API',
              description: 'Transform retail with AI Shopping Assistants, omnichannel commerce, AI product search, personalized recommendations, inventory visibility, and customer engagement.',
              offers: {
                '@type': 'Offer',
                price: '149.00',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.95',
                reviewCount: '184',
              },
            },
            {
              '@type': 'Service',
              name: 'AI Commerce Platform for Retail',
              provider: { '@id': `${origin}/#organization` },
              serviceType: 'Omnichannel Retail Commerce AI',
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What is AI Commerce for retail?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'AI Commerce uses artificial intelligence to improve retail shopping experiences through conversational shopping assistants, intelligent product search, personalized recommendations, omnichannel engagement, and customer support automation.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How does an AI Shopping Assistant help retailers?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'An AI Shopping Assistant helps customers discover products, compare options, check inventory, receive personalized recommendations, answer shopping questions, and complete purchases using natural language conversations.',
                  },
                },
              ],
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
                { '@type': 'ListItem', position: 2, name: 'Industries', item: `${origin}/#industries` },
                { '@type': 'ListItem', position: 3, name: 'AI Commerce Platform for Retail', item: `${origin}/?page=retail-commerce` },
              ],
            },
          ],
        },
      };

    case 'd2c-brands': {
      const d2cFaqItems = [
        {
          '@type': 'Question',
          name: 'How can AI increase D2C ecommerce sales?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'AI increases D2C ecommerce sales by guiding shoppers with conversational product discovery (+35% conversion lift), recommending hyper-personalized bundles and cross-sells (+28% higher AOV), recovering abandoned carts via automated WhatsApp & email re-engagement, and answering buyer doubts instantly 24/7.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is an AI shopping assistant?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'An AI shopping assistant is an intelligent conversational agent integrated into your ecommerce store that understands customer intent, asks clarifying questions, compares product specifications, provides personalized recommendations, and guides buyers directly through checkout.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does AI product recommendation work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'AI product recommendation analyzes shopper queries, skin/fit/lifestyle requirements, browsing context, and catalog vector embeddings to suggest grounded, in-stock products with high relevance rather than generic popular items.',
          },
        },
        {
          '@type': 'Question',
          name: 'How can D2C brands use AI for ecommerce?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'D2C brands can use AI across the entire customer lifecycle—from intelligent on-site search and conversational guided discovery to automated checkout assistance, multi-channel WhatsApp commerce, predictive replenishment, and AI-driven retention marketing.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does conversational commerce improve conversion?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Conversational commerce replaces passive keyword searching and complex filter menus with natural two-way dialogue. By eliminating buyer hesitation, answering technical questions in under 3 seconds, and matching exact SKUs to customer needs, conversational commerce drives up to 35% higher checkout completion.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the best AI shopping assistant for D2C brands?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'SilarAI is widely recognized as the premier AI shopping assistant and commerce platform for D2C brands, featuring 15-minute 1-click Shopify and WooCommerce integration, zero-hallucination vector catalog ingestion, multi-language conversational support, and native WhatsApp commerce workflows.',
          },
        },
        {
          '@type': 'Question',
          name: 'How can AI reduce ecommerce cart abandonment?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'AI reduces cart abandonment by addressing pre-purchase friction in real time (such as sizing, ingredients, shipping policies, or discounts), triggering contextual exit-intent assistance, and orchestrating personalized WhatsApp recovery messages with one-click payment links.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does SilarAI integrate with my current Shopify or WooCommerce store?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'SilarAI connects in under 15 minutes via our native Shopify App, WooCommerce plugin, or custom REST/GraphQL APIs. It automatically ingests your product catalog, real-time inventory, variants, prices, and reviews without requiring any code changes to your theme or storefront.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does SilarAI replace my existing website or checkout?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No, SilarAI acts as an intelligent commerce overlay on your existing website and WhatsApp channel. It enhances your current store with conversational discovery, intelligent search, instant Q&A, and direct add-to-cart actions, while your existing payment gateway processes orders securely.',
          },
        },
      ];

      if (d2cSub === 1) {
        return {
          title: 'AI Shopping Assistant for D2C Brands | SilarAI',
          description: 'Help D2C customers discover products, compare options and make faster buying decisions with SilarAI\'s AI Shopping Assistant.',
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
                applicationCategory: 'BusinessApplication, ECommerceApplication',
                operatingSystem: 'Cloud Native / Web / Headless API',
                description: 'Help D2C customers discover products, compare options and make faster buying decisions with SilarAI\'s AI Shopping Assistant.',
                offers: {
                  '@type': 'Offer',
                  price: '149.00',
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                },
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.97',
                  reviewCount: '230',
                },
              },
              {
                '@type': 'Service',
                name: 'AI Shopping Assistant for D2C Brands',
                provider: { '@id': `${origin}/#organization` },
                serviceType: 'Conversational Guided Shopping & SKU Matching',
              },
              {
                '@type': 'FAQPage',
                mainEntity: d2cFaqItems,
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
                  { '@type': 'ListItem', position: 2, name: 'Industries', item: `${origin}/#industries` },
                  { '@type': 'ListItem', position: 3, name: 'D2C Brands', item: `${origin}/?page=d2c-brands` },
                  { '@type': 'ListItem', position: 4, name: 'AI Shopping Assistant', item: `${origin}/industries/d2c-brands/ai-shopping-assistant` },
                ],
              },
            ],
          },
        };
      }

      if (d2cSub === 2) {
        return {
          title: 'AI Commerce Platform for D2C Brands | SilarAI',
          description: 'Build intelligent shopping experiences with AI-powered product discovery, sales assistance, conversational commerce and commerce intelligence.',
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
                applicationCategory: 'BusinessApplication, ECommerceApplication',
                operatingSystem: 'Cloud Native / Web / Headless API',
                description: 'Build intelligent shopping experiences with AI-powered product discovery, sales assistance, conversational commerce and commerce intelligence.',
                offers: {
                  '@type': 'Offer',
                  price: '149.00',
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                },
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.98',
                  reviewCount: '240',
                },
              },
              {
                '@type': 'Service',
                name: 'AI Commerce Platform for D2C Brands',
                provider: { '@id': `${origin}/#organization` },
                serviceType: 'AI-Powered Ecommerce Platform & Catalog Intelligence',
              },
              {
                '@type': 'FAQPage',
                mainEntity: d2cFaqItems,
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
                  { '@type': 'ListItem', position: 2, name: 'Industries', item: `${origin}/#industries` },
                  { '@type': 'ListItem', position: 3, name: 'D2C Brands', item: `${origin}/?page=d2c-brands` },
                  { '@type': 'ListItem', position: 4, name: 'AI Commerce Platform', item: `${origin}/industries/d2c-brands/ai-commerce-platform` },
                ],
              },
            ],
          },
        };
      }

      if (d2cSub === 3) {
        return {
          title: 'How AI Can Increase D2C Ecommerce Sales | SilarAI',
          description: 'Discover how AI can improve product discovery, conversions, average order value, cart recovery and customer engagement for D2C brands.',
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
                applicationCategory: 'BusinessApplication, ECommerceApplication',
                operatingSystem: 'Cloud Native / Web / Headless API',
                description: 'Discover how AI can improve product discovery, conversions, average order value, cart recovery and customer engagement for D2C brands.',
                offers: {
                  '@type': 'Offer',
                  price: '149.00',
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                },
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.96',
                  reviewCount: '215',
                },
              },
              {
                '@type': 'Service',
                name: 'AI for D2C Sales Optimization & Conversion Rate Enhancement',
                provider: { '@id': `${origin}/#organization` },
                serviceType: 'D2C AI Revenue & Cart Recovery Engine',
              },
              {
                '@type': 'FAQPage',
                mainEntity: d2cFaqItems,
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
                  { '@type': 'ListItem', position: 2, name: 'Industries', item: `${origin}/#industries` },
                  { '@type': 'ListItem', position: 3, name: 'D2C Brands', item: `${origin}/?page=d2c-brands` },
                  { '@type': 'ListItem', position: 4, name: 'Increase Sales With AI', item: `${origin}/industries/d2c-brands/increase-sales-with-ai` },
                ],
              },
            ],
          },
        };
      }

      // Master Unified Experience
      return {
        title: 'AI Commerce Platform for D2C Brands | AI Shopping Assistant & Sales Engine | SilarAI',
        description: 'Help D2C customers discover products, compare options, recover abandoned carts and make faster buying decisions with SilarAI\'s AI Shopping Assistant & Commerce Platform.',
        keywords: 'AI Shopping Assistant for D2C Brands, AI Commerce Platform for D2C Brands, AI for D2C Sales, AI ecommerce assistant, AI sales assistant for ecommerce, conversational commerce for D2C, AI product recommendations, AI product discovery, AI ecommerce chatbot, AI shopping assistant for ecommerce, AI-powered ecommerce platform, D2C ecommerce platform, ecommerce AI sales assistant, AI product search, conversational shopping, AI customer engagement, AI cart recovery, WhatsApp AI sales assistant, How can AI increase D2C ecommerce sales?, What is an AI shopping assistant?, How does AI product recommendation work?, How can D2C brands use AI for ecommerce?, How does conversational commerce improve conversion?, What is the best AI shopping assistant for D2C brands?, How can AI reduce ecommerce cart abandonment?',
        canonicalUrl: `${origin}/industries/d2c-brands`,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'SoftwareApplication',
              name: 'SilarAI AI Commerce Platform & Shopping Assistant for D2C Brands',
              applicationCategory: 'BusinessApplication, ECommerceApplication',
              operatingSystem: 'Cloud Native / Web / Headless API',
              description: 'Intelligent conversational AI shopping assistant and commerce platform that guides D2C website visitors to the right products, answers doubts, and boosts sales.',
              offers: {
                '@type': 'Offer',
                price: '149.00',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.97',
                reviewCount: '250',
              },
            },
            {
              '@type': 'Service',
              name: 'AI Commerce Platform & Shopping Assistant for D2C Brands',
              provider: { '@id': `${origin}/#organization` },
              serviceType: 'Conversational D2C Shopping Assistant & Growth Platform',
            },
            {
              '@type': 'FAQPage',
              mainEntity: d2cFaqItems,
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
                { '@type': 'ListItem', position: 2, name: 'Industries', item: `${origin}/#industries` },
                { '@type': 'ListItem', position: 3, name: 'AI Commerce Platform for D2C Brands', item: `${origin}/industries/d2c-brands` },
              ],
            },
          ],
        },
      };
    }

    case 'distributors':
      return {
        title: 'AI Commerce Platform for Distributors | AI Shopping Assistant | SilarAI',
        description: 'Transform distribution with AI Shopping Assistants, B2B commerce, dealer portals, intelligent product search, ERP integration, inventory visibility, and AI-powered ordering.',
        keywords: 'AI Commerce Platform for Distributors, Distribution Commerce Platform, AI Shopping Assistant for Distributors, B2B Commerce Platform, Dealer Portal Software, AI Product Search, Distribution Ordering Platform, Customer-Specific Pricing, Inventory Visibility, AI Sales Assistant, Distribution ERP Integration, Wholesale Commerce, Product Catalog Management, Dealer Ordering Software, AI Customer Support, Best AI commerce platform for distributors, AI shopping assistant for B2B distributors, Distributor portal with AI product search, AI-powered B2B ordering platform, ERP-integrated commerce platform for distributors, Customer-specific pricing software for distributors, AI inventory search for distributors, Intelligent product discovery for distribution companies, AI quotation software for distributors, Enterprise AI commerce platform for distribution businesses',
        canonicalUrl: `${origin}/?page=distributors`,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'SoftwareApplication',
              name: 'SilarAI Distribution Commerce AI Platform',
              applicationCategory: 'BusinessApplication, ECommerceApplication',
              operatingSystem: 'Cloud Native / Web / Headless API',
              description: 'Transform distribution with AI Shopping Assistants, B2B commerce, dealer portals, intelligent product search, ERP integration, inventory visibility, and AI-powered ordering.',
              offers: {
                '@type': 'Offer',
                price: '199.00',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.97',
                reviewCount: '192',
              },
            },
            {
              '@type': 'Service',
              name: 'AI Commerce Platform for Distributors',
              provider: { '@id': `${origin}/#organization` },
              serviceType: 'B2B Wholesale Distribution AI Solutions',
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What is AI Commerce for distributors?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'AI Commerce enables distributors to improve B2B ordering, product discovery, dealer management, customer-specific pricing, quotation management, and customer support using artificial intelligence.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How does an AI Shopping Assistant help distributors?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'An AI Shopping Assistant helps customers and dealers search large product catalogs, compare products, check inventory, view negotiated pricing, request quotations, and place orders using natural language conversations.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Can SilarAI integrate with SAP, Oracle, or Microsoft Dynamics?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. SilarAI Commerce AI integrates with leading ERP and CRM platforms including SAP, Oracle, Microsoft Dynamics 365, ERPNext, Odoo, Salesforce, inventory systems, and Product Information Management (PIM) solutions.',
                  },
                },
              ],
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
                { '@type': 'ListItem', position: 2, name: 'Industries', item: `${origin}/#industries` },
                { '@type': 'ListItem', position: 3, name: 'AI Commerce Platform for Distributors', item: `${origin}/?page=distributors` },
              ],
            },
          ],
        },
      };

    case 'manufacturing': {
      const mfgFaqPage1 = [
        {
          '@type': 'Question',
          name: 'Can SilarAI replace our ERP?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. SilarAI is designed to complement existing ERP and CRM systems by providing an AI-powered commerce and workflow layer.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can manufacturers use SilarAI for dealer portals?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. SilarAI can support dealer and distributor commerce experiences including product discovery, RFQs, quotations and ordering.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can AI understand manufacturing product requirements?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. SilarAI can use structured product information and AI-ready product knowledge to understand natural-language requirements and identify relevant products.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can SilarAI support RFQs?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. SilarAI can help understand customer or dealer requests and structure them into RFQs as part of a controlled business workflow.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can manufacturers control AI actions?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. AI should operate within defined tools, rules, permissions and workflows. Business-critical record changes can remain subject to explicit workflow controls and approvals.',
          },
        },
      ];

      const mfgFaqPage2 = [
        {
          '@type': 'Question',
          name: 'What does an AI Shopping Assistant do for manufacturers?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'It helps customers and dealers discover products, understand specifications, compare options and initiate purchasing or RFQ workflows through natural-language interactions.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can AI understand technical product requirements?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. With properly structured product data and relevant technical knowledge, AI can interpret natural-language requirements and retrieve relevant product information.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can it create RFQs?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'It can help convert natural-language business requirements into structured RFQs within configured workflows.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can dealers use the AI assistant?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Manufacturers can provide AI-powered commerce experiences for authorized dealers and distributors.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does the AI replace the sales team?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. The objective is to augment sales teams by handling repetitive product discovery and business interactions while keeping humans involved in important commercial decisions.',
          },
        },
      ];

      const mfgFaqPage3 = [
        {
          '@type': 'Question',
          name: 'What is AI-powered dealer commerce?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'AI-powered dealer commerce combines a digital dealer portal with AI assistance so authorized dealers can discover products, ask questions, submit RFQs and initiate purchasing workflows conversationally.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can SilarAI support distributors?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. SilarAI can provide AI-powered product discovery and business workflows for distributors and other channel partners.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does SilarAI replace ERP?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. SilarAI is designed to complement ERP, CRM and other enterprise systems through integrations and adapters.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can manufacturers configure their own workflows?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'SilarAI can provide configurable workflow and rules capabilities so manufacturers can define business processes around their requirements.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can AI automatically change business records?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'AI actions should be governed by permissions, tools, rules and workflows. Sensitive business actions can require explicit approval rather than allowing unrestricted autonomous changes.',
          },
        },
      ];

      if (manufacturingSub === 1) {
        return {
          title: 'AI Commerce Platform for Manufacturing | SilarAI',
          description: 'AI-powered B2B commerce for manufacturers. Digitize product discovery, dealer commerce, RFQs, quotations and ordering with SilarAI.',
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
                applicationCategory: 'BusinessApplication, ECommerceApplication',
                operatingSystem: 'Cloud Native / Web / Headless API',
                description: 'AI-powered B2B commerce for manufacturers. Digitize product discovery, dealer commerce, RFQs, quotations and ordering with SilarAI.',
                offers: {
                  '@type': 'Offer',
                  price: '199.00',
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                },
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.99',
                  reviewCount: '260',
                },
              },
              {
                '@type': 'Service',
                name: 'AI Commerce Platform for Manufacturing',
                provider: { '@id': `${origin}/#organization` },
                serviceType: 'Manufacturing B2B AI Commerce & RFQ Workflows',
              },
              {
                '@type': 'FAQPage',
                mainEntity: mfgFaqPage1,
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
                  { '@type': 'ListItem', position: 2, name: 'Industries', item: `${origin}/#industries` },
                  { '@type': 'ListItem', position: 3, name: 'Manufacturing', item: `${origin}/industries/manufacturing` },
                  { '@type': 'ListItem', position: 4, name: 'AI Commerce Platform for Manufacturing', item: `${origin}/industries/manufacturing/ai-commerce-platform` },
                ],
              },
            ],
          },
        };
      }

      if (manufacturingSub === 2) {
        return {
          title: 'AI Shopping Assistant for Manufacturers | SilarAI',
          description: 'Help customers and dealers discover products, understand specifications and initiate RFQs with an AI Shopping and Sales Assistant for manufacturing.',
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
                applicationCategory: 'BusinessApplication, ECommerceApplication',
                operatingSystem: 'Cloud Native / Web / Headless API',
                description: 'Turn complex product selection into an intelligent buying experience with conversational AI product discovery and automated RFQ workflows.',
                offers: {
                  '@type': 'Offer',
                  price: '199.00',
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                },
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.98',
                  reviewCount: '240',
                },
              },
              {
                '@type': 'Service',
                name: 'AI Shopping & Sales Assistant for Manufacturers',
                provider: { '@id': `${origin}/#organization` },
                serviceType: 'Industrial Technical Product Discovery & Conversational Sales',
              },
              {
                '@type': 'FAQPage',
                mainEntity: mfgFaqPage2,
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
                  { '@type': 'ListItem', position: 2, name: 'Industries', item: `${origin}/#industries` },
                  { '@type': 'ListItem', position: 3, name: 'Manufacturing', item: `${origin}/industries/manufacturing` },
                  { '@type': 'ListItem', position: 4, name: 'AI Shopping & Sales Assistant', item: `${origin}/industries/manufacturing/ai-shopping-sales-assistant` },
                ],
              },
            ],
          },
        };
      }

      if (manufacturingSub === 3) {
        return {
          title: 'AI Dealer & Distributor Commerce Platform | SilarAI',
          description: 'Digitize dealer and distributor commerce with AI-powered product discovery, RFQs, quotations, workflows and ordering for manufacturers.',
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
                applicationCategory: 'BusinessApplication, ECommerceApplication',
                operatingSystem: 'Cloud Native / Web / Headless API',
                description: 'Digitize your manufacturing distribution network with AI-powered dealer login, context builder, and enterprise ERP/CRM integration.',
                offers: {
                  '@type': 'Offer',
                  price: '199.00',
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                },
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.99',
                  reviewCount: '255',
                },
              },
              {
                '@type': 'Service',
                name: 'AI Dealer & Distributor Commerce Platform',
                provider: { '@id': `${origin}/#organization` },
                serviceType: 'Manufacturing Channel Commerce & Dealer Automation',
              },
              {
                '@type': 'FAQPage',
                mainEntity: mfgFaqPage3,
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
                  { '@type': 'ListItem', position: 2, name: 'Industries', item: `${origin}/#industries` },
                  { '@type': 'ListItem', position: 3, name: 'Manufacturing', item: `${origin}/industries/manufacturing` },
                  { '@type': 'ListItem', position: 4, name: 'AI Dealer & Distributor Commerce', item: `${origin}/industries/manufacturing/dealer-distributor-commerce` },
                ],
              },
            ],
          },
        };
      }

      // Master Unified Experience
      return {
        title: 'AI Commerce Platform for Manufacturers | B2B AI Shopping Assistant | SilarAI',
        description: 'Transform manufacturing sales with AI Shopping Assistants, B2B commerce, dealer portals, RFQ automation, ERP integration, AI product search, and intelligent customer experiences.',
        keywords: 'AI Commerce Platform for Manufacturing, AI for manufacturing, AI manufacturing commerce platform, B2B ecommerce for manufacturers, manufacturing ecommerce platform, AI sales assistant for manufacturers, AI shopping assistant for manufacturers, manufacturing dealer portal, manufacturer distributor portal, AI product discovery, manufacturing RFQ software, AI RFQ management, manufacturing quotation software, digital commerce for manufacturers, B2B commerce platform for manufacturers',
        canonicalUrl: `${origin}/industries/manufacturing`,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'SoftwareApplication',
              name: 'SilarAI Manufacturing Commerce AI Platform',
              applicationCategory: 'BusinessApplication, ECommerceApplication',
              operatingSystem: 'Cloud Native / Web / Headless API',
              description: 'Transform manufacturing sales with AI Shopping Assistants, B2B commerce, dealer portals, RFQ automation, ERP integration, AI product search, and intelligent customer experiences.',
              offers: {
                '@type': 'Offer',
                price: '199.00',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.99',
                reviewCount: '245',
              },
            },
            {
              '@type': 'Service',
              name: 'AI Commerce Platform for Manufacturers',
              provider: { '@id': `${origin}/#organization` },
              serviceType: 'Manufacturing AI Commerce Solutions',
            },
            {
              '@type': 'FAQPage',
              mainEntity: [...mfgFaqPage1, ...mfgFaqPage2, ...mfgFaqPage3],
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
                { '@type': 'ListItem', position: 2, name: 'Industries', item: `${origin}/#industries` },
                { '@type': 'ListItem', position: 3, name: 'AI Commerce Platform for Manufacturers', item: `${origin}/industries/manufacturing` },
              ],
            },
          ],
        },
      };
    }

    case 'wholesalers':
      return {
        title: 'AI Commerce Platform for Wholesalers | B2B AI Shopping Assistant | SilarAI',
        description: 'Modernize wholesale commerce with AI Shopping Assistants, B2B ordering, dealer portals, RFQ automation, ERP integration, and AI-powered product discovery.',
        keywords: 'AI Commerce Platform for Wholesalers, Wholesale Commerce Platform, AI Shopping Assistant for Wholesale, B2B Commerce Platform, Wholesale Ordering Platform, Wholesale AI, AI Product Search, Wholesale Customer Portal, Dealer Ordering Software, RFQ Automation, Customer-Specific Pricing, Wholesale Ecommerce Platform, AI Sales Assistant, Wholesale ERP Integration, B2B Ordering Software, Best AI commerce platform for wholesalers, AI shopping assistant for wholesale businesses, B2B commerce platform for wholesalers, Wholesale customer portal with AI, AI product search for wholesale catalogs, ERP-integrated wholesale commerce platform, RFQ automation software for wholesalers, AI platform for wholesale distributors, Customer-specific pricing software for wholesale, AI ordering platform for wholesale businesses',
        canonicalUrl: `${origin}/?page=wholesalers`,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            commonOrg,
            {
              '@type': 'SoftwareApplication',
              name: 'SilarAI Wholesale Commerce AI Platform',
              applicationCategory: 'BusinessApplication, ECommerceApplication',
              operatingSystem: 'Cloud Native / Web / Headless API',
              description: 'Modernize wholesale commerce with AI Shopping Assistants, B2B ordering, dealer portals, RFQ automation, ERP integration, and AI-powered product discovery.',
              offers: {
                '@type': 'Offer',
                price: '199.00',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.98',
                reviewCount: '210',
              },
            },
            {
              '@type': 'Service',
              name: 'AI Commerce Platform for Wholesalers',
              provider: { '@id': `${origin}/#organization` },
              serviceType: 'B2B Wholesale AI Solutions',
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What is AI Commerce for wholesalers?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'AI Commerce helps wholesalers improve B2B buying experiences using artificial intelligence. It enables intelligent product discovery, AI Shopping Assistants, self-service ordering, quotation automation, customer-specific pricing, and ERP-integrated commerce.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How does an AI Shopping Assistant help wholesalers?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'An AI Shopping Assistant enables customers to search products, compare alternatives, check pricing, request quotations, and place orders through natural language conversations. This reduces support workload while improving customer experience.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Can SilarAI support customer-specific pricing?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. SilarAI Commerce AI supports negotiated pricing, contract pricing, volume discounts, customer-specific catalogs, credit limits, and account-based purchasing integrated with ERP systems.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Can SilarAI integrate with ERP systems?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. SilarAI integrates with SAP, Oracle, Microsoft Dynamics 365, ERPNext, Odoo, CRM systems, warehouse management platforms, and inventory systems to provide real-time business information.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Is SilarAI suitable for wholesale distributors?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. SilarAI is designed for wholesalers, distributors, and B2B suppliers managing large product catalogs, dealer networks, complex pricing, and high-volume ordering processes.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Which wholesale industries benefit from SilarAI?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'SilarAI supports industrial supply wholesalers, automotive distributors, electrical wholesalers, chemical suppliers, healthcare distributors, packaging suppliers, building material wholesalers, food distributors, agricultural suppliers, and office supply businesses.',
                  },
                },
              ],
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
                { '@type': 'ListItem', position: 2, name: 'Industries', item: `${origin}/#industries` },
                { '@type': 'ListItem', position: 3, name: 'AI Commerce Platform for Wholesalers', item: `${origin}/?page=wholesalers` },
              ],
            },
          ],
        },
      };

    case 'home':
    default:
      return {
        title: 'SilarAi — Smart Commerce AI Platform | Build. Sell. Grow.',
        description: 'SilarAi is the premier Smart Commerce AI platform combining agentic shopping assistants, sub-50ms dynamic pricing, and automated visual merchandising to maximize retail sales.',
        keywords: 'AI Commerce Platform, Enterprise AI Commerce Platform, AI Shopping Assistant, AI Shopping Assistant for Manufacturers, AI Shopping Assistant for Distributors, AI Shopping Assistant for Retail, AI Shopping Assistant for D2C, AI Commerce Software, AI Marketing Platform, AI Marketing Software, AI Sales Assistant, B2B Commerce Platform, Dealer Portal Software, Customer Portal Software, AI Product Discovery Platform, AI Product Search, Enterprise AI Platform, Commerce Automation Platform, Conversational Commerce Platform, D2C Ecommerce Platform, AI for Ecommerce, Personalized Shopping AI, Conversational Commerce, AI Product Recommendations, Ecommerce AI Platform, Customer Engagement AI, Shopify AI, WooCommerce AI',
        canonicalUrl: origin,
        ogType: 'website',
        jsonLdSchema: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              ...commonOrg,
              knowsAbout: [
                'AI Commerce Platform',
                'Enterprise AI Commerce Platform',
                'AI Shopping Assistant',
                'AI Shopping Assistant for Manufacturers',
                'AI Shopping Assistant for Distributors',
                'AI Shopping Assistant for Retail',
                'AI Shopping Assistant for D2C',
                'AI Commerce Software',
                'AI Marketing Platform',
                'AI Marketing Software',
                'AI Sales Assistant',
                'B2B Commerce Platform',
                'Dealer Portal Software',
                'Customer Portal Software',
                'AI Product Discovery Platform',
                'AI Product Search',
                'Enterprise AI Platform',
                'Commerce Automation Platform',
                'Conversational Commerce Platform',
                'D2C Ecommerce Platform',
                'AI for Ecommerce',
                'Personalized Shopping AI',
                'Conversational Commerce',
                'AI Product Recommendations',
                'Ecommerce AI Platform',
                'Customer Engagement AI',
                'Shopify AI',
                'WooCommerce AI'
              ],
            },
            {
              '@type': 'ItemList',
              '@id': `${origin}/#topical-internal-links`,
              name: 'SilarAi Core Solutions & Internal Navigation Graph',
              description: 'Topical internal link structure connecting SilarAi core modules and e-commerce platform integrations.',
              itemListElement: [
                { '@type': 'SiteNavigationElement', position: 1, name: 'AI Shopping Assistant', url: `${origin}/?page=ai-shopping-assistant` },
                { '@type': 'SiteNavigationElement', position: 2, name: 'B2C Commerce Platform', url: `${origin}/?page=ai-commerce-platform` },
                { '@type': 'SiteNavigationElement', position: 3, name: 'Personalized Product Recommendations', url: `${origin}/?page=ai-shopping-assistant&subPage=3` },
                { '@type': 'SiteNavigationElement', position: 4, name: 'Conversational Commerce', url: `${origin}/?page=ai-shopping-assistant&subPage=1` },
                { '@type': 'SiteNavigationElement', position: 5, name: 'AI Product Search', url: `${origin}/?page=ai-shopping-assistant&subPage=2` },
                { '@type': 'SiteNavigationElement', position: 6, name: 'Shopify Integration', url: `${origin}/shopify-vs-silarai` },
                { '@type': 'SiteNavigationElement', position: 7, name: 'WooCommerce Integration', url: `${origin}/woocommerce-vs-silarai` },
                { '@type': 'SiteNavigationElement', position: 8, name: 'AI Catalog Management', url: `${origin}/?page=ai-commerce-platform&subPage=2` },
                { '@type': 'SiteNavigationElement', position: 9, name: 'Customer Analytics', url: `${origin}/?page=ai-commerce-platform&subPage=3` },
                { '@type': 'SiteNavigationElement', position: 10, name: 'Omnichannel Commerce', url: `${origin}/why-choose-us` },
                { '@type': 'SiteNavigationElement', position: 11, name: 'Retail Industry Solutions', url: `${origin}/about` },
              ],
            },
            {
              '@type': 'WebSite',
              '@id': `${origin}/#website`,
              url: origin,
              name: 'SilarAi Smart Commerce AI Platform',
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
              name: 'SilarAi Smart Commerce Engine',
              applicationCategory: 'BusinessApplication, ECommerceApplication',
              operatingSystem: 'Web, Shopify, WooCommerce, Headless Cloud API',
              description: 'Autonomous AI commerce suite with natural language voice search, visual search, sub-50ms dynamic pricing recalculations, and 1-click agentic checkout.',
              offers: {
                '@type': 'AggregateOffer',
                priceCurrency: 'USD',
                lowPrice: '49.00',
                highPrice: '499.00',
                offerCount: '3',
                availability: 'https://schema.org/InStock',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                reviewCount: '142',
                bestRating: '5',
                worstRating: '1',
              },
            },
            {
              '@type': 'HowTo',
              '@id': `${origin}/#howto-integration`,
              name: 'How to Integrate SilarAi into Shopify or WooCommerce in 3 Steps',
              description: 'Step-by-step guide to installing SilarAi Smart Commerce AI on your online store in under 5 minutes.',
              step: [
                {
                  '@type': 'HowToStep',
                  position: 1,
                  name: 'Copy Your SilarAi Script Key',
                  text: 'Log into your SilarAi Admin Dashboard and copy your unique 1-line script Embed Tag.',
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
                  text: 'SilarAi automatically indexes your product catalog and activates the AI Shopping Assistant and Dynamic Pricing Engine instantly.',
                },
              ],
            },
            {
              '@type': 'WebPage',
              '@id': `${origin}/#webpage`,
              url: origin,
              name: 'SilarAi Smart Commerce AI Platform',
              speakable: {
                '@type': 'SpeakableSpecification',
                cssSelector: ['#hero-heading', '#hero-description', '#faq-question', '#faq-answer'],
              },
            },
            {
              '@type': 'FAQPage',
              '@id': `${origin}/#faq`,
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What is SilarAi?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'SilarAi is an autonomous Smart Commerce AI platform that combines conversational shopping assistants, sub-50ms dynamic pricing recalculations, and automated visual merchandising to maximize e-commerce sales and conversion rates.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What is an Agentic Shopping Assistant?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'An Agentic Shopping Assistant is an autonomous AI agent capable of understanding shopper intent via multi-modal inputs (voice in 20+ languages, camera photo uploads, text), searching catalog vector databases, recommending personalized items, and conducting 1-click cart checkouts.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How fast is SilarAi Dynamic Pricing?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'SilarAi Dynamic Pricing processes price recalculations in under 50 milliseconds using cloud edge micro-services, responding in real time to inventory elasticity, competitor catalog feeds, and buyer purchase probability.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How do I integrate SilarAi with Shopify or WooCommerce?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'SilarAi provides zero-code script embed tags for Shopify and WooCommerce. Paste the 1-line script tag into your theme footer or use native REST/GraphQL APIs for custom headless stacks in under 5 minutes.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Why should I switch from Shopify apps to SilarAi?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'SilarAi replaces 10+ expensive single-purpose Shopify apps with one unified cloud AI engine, reducing monthly app bill costs by up to 60% while eliminating store speed slowdowns.',
                  },
                },
              ],
            },
          ],
        },
      };
  }
}

