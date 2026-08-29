/**
 * ⚠️ DORMANT — not wired to any rendered component.
 *
 * This module was written against the Express proxy routes (/api/wordpress/*)
 * that were removed when the site became a fully static Azure deployment.
 * The proxy existed to avoid CORS when calling the WordPress REST API.
 *
 * Before re-enabling, choose one of:
 *   a) enable CORS on the WordPress host and call wp-json directly, or
 *   b) reintroduce a proxy (Azure Function, or the existing .NET backend).
 *
 * See context.md § WordPress integration.
 */
export interface WpPostItem {
  id: number;
  slug: string;
  type: 'blog' | 'insight' | 'case-study';
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  featuredImage: string;
  category: string;
  readTime: string;
  tags: string[];
  metrics?: {
    label: string;
    value: string;
  }[];
  link?: string;
}

const DEFAULT_WP_URL = (import.meta as any).env?.VITE_WORDPRESS_URL || '';

export function getStoredWordPressUrl(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('silarai_wp_url') || DEFAULT_WP_URL || '';
  }
  return DEFAULT_WP_URL || '';
}

export function setStoredWordPressUrl(url: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('silarai_wp_url', url);
  }
}

// Built-in high quality fallback insights, blogs, and case studies
export const FALLBACK_WP_POSTS: WpPostItem[] = [
  {
    id: 101,
    slug: 'manufacturing-giant-rfq-case-study',
    type: 'case-study',
    title: 'How a $2.4B Industrial Pump Manufacturer Reduced RFQ Latency by 92% with SilarAI',
    excerpt: 'By deploying SilarAI’s AI Shopping Assistant and SAP ERP connector, this global pump manufacturer automated complex engineering part lookups and RFQ turnaround times from 3 days to under 2 minutes.',
    content: `
      <h2>Executive Summary</h2>
      <p>A Fortune 500 industrial machinery manufacturer with over 45,000 active SKUs faced severe bottlenecks in its sales quotation pipeline. Engineering sales teams were spending an average of 4.2 hours per inquiry manually cross-referencing fluid viscosity tables, motor voltages, and CAD specification sheets.</p>
      
      <h2>The Challenge</h2>
      <ul>
        <li><strong>Catalog Complexity:</strong> High-variance pump configurations required checking 12+ technical parameters before offering a formal price quote.</li>
        <li><strong>Slow RFQ Latency:</strong> Corporate buyers had to wait 3 to 5 business days for simple distributor quote responses.</li>
        <li><strong>ERP Silos:</strong> Live inventory and customer-specific contract prices were trapped inside legacy SAP ECC system databases.</li>
      </ul>

      <h2>The SilarAI Solution</h2>
      <p>The client implemented SilarAI's <strong>AI Shopping Assistant for Manufacturers</strong> along with our native SAP ERP API connector. The AI agent parses natural language engineering inputs (e.g. <em>"100 GPM stainless steel slurry pump for chemical processing at 180°F"</em>) and matches the exact SKU within 450 milliseconds.</p>

      <h2>Key Results & ROI</h2>
      <p>Within 90 days of deployment across 4 global regional territories:</p>
      <ul>
        <li><strong>92% Reduction in RFQ Cycle Time:</strong> Quote generation time dropped from 72 hours to under 2 minutes.</li>
        <li><strong>3.8x Conversion Rate Increase:</strong> Distributor quote-to-order conversions surged significantly.</li>
        <li><strong>$4.1M Incremental Revenue:</strong> Generated in the first quarter alone from auto-quoted aftermarket parts.</li>
      </ul>
    `,
    date: 'August 2, 2026',
    author: {
      name: 'Dr. Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      role: 'Chief Commercial Officer'
    },
    featuredImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    category: 'Case Studies',
    readTime: '6 min read',
    tags: ['Manufacturing', 'SAP Integration', 'RFQ Automation', 'AI Shopping Assistant'],
    metrics: [
      { label: 'RFQ Latency Reduction', value: '92%' },
      { label: 'Conversion Lift', value: '+380%' },
      { label: 'Q1 Sales Impact', value: '$4.1M' }
    ]
  },
  {
    id: 102,
    slug: 'state-of-b2b-ai-commerce-2026',
    type: 'insight',
    title: 'The 2026 State of B2B AI Commerce & Generative Product Discovery',
    excerpt: 'An in-depth research breakdown analyzing how AI-powered semantic search, vector databases, and autonomous buying agents are reshaping wholesale distribution and industrial sales.',
    content: `
      <h2>The Shift to Agentic Commerce</h2>
      <p>Traditional B2B e-commerce platforms were built around rigid keyword search and static category trees. However, modern commercial procurement buyers expect the speed and conversational ease of AI assistants like ChatGPT and Gemini.</p>

      <h2>Key Findings from 500+ B2B Commerce Leaders</h2>
      <ol>
        <li><strong>Natural Language Rules:</strong> 78% of industrial buyers prefer typing a technical problem description over clicking through 6 levels of facet filters.</li>
        <li><strong>ERP Integration is Critical:</strong> 91% of buyers state that real-time stock availability (ATP) and custom contract pricing dictate whether they complete an online order.</li>
        <li><strong>Voice & Image Search Rising:</strong> Maintenance technicians in field locations increasingly use photo uploads of broken serial tags to order OEM spare parts.</li>
      </ol>

      <h2>How SilarAI Leads the Industry</h2>
      <p>SilarAI provides the industry's fastest sub-50ms dynamic pricing engine alongside a multi-modal conversational shopping assistant that natively supports CAD drawing parsing, Safety Data Sheets (SDS), and matrix bulk reordering.</p>
    `,
    date: 'July 28, 2026',
    author: {
      name: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      role: 'VP of AI Strategy & Research'
    },
    featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    category: 'Industry Insights',
    readTime: '8 min read',
    tags: ['B2B Commerce', 'AI Trends', 'Product Discovery', 'Wholesale Distribution']
  },
  {
    id: 103,
    slug: 'd2c-brand-scaled-conversions-38x',
    type: 'case-study',
    title: 'D2C Apparel Retailer Boosts Conversion Rate by 3.8x with AI Shopping Assistant',
    excerpt: 'How a high-growth lifestyle brand integrated SilarAI with Shopify Plus to deliver personalized styling recommendations, instant sizing guidance, and voice search.',
    content: `
      <h2>Background</h2>
      <p>A fast-growing D2C apparel brand with over 800,000 monthly visitors suffered from a 68% cart abandonment rate due to sizing confusion and overwhelming product choices.</p>

      <h2>The SilarAI Implementation</h2>
      <p>The brand embedded SilarAI's <strong>AI Shopping Assistant widget</strong> into their online store. Shoppers can now ask questions like: <em>"Show me a breathable summer outfit for an outdoor wedding in Miami"</em> or upload photos of fashion looks to receive instant matching product recommendations.</p>

      <h2>Results & Impact</h2>
      <ul>
        <li><strong>3.8x Conversion Surge:</strong> Shoppers interacting with the AI Assistant converted at 11.4% compared to the 3.0% store baseline.</li>
        <li><strong>42% Reduction in Return Rates:</strong> Precise sizing recommendations significantly reduced size-related clothing returns.</li>
        <li><strong>+26% Higher AOV:</strong> Automated cross-selling of matching footwear and accessories drove up average cart values.</li>
      </ul>
    `,
    date: 'July 19, 2026',
    author: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
      role: 'Head of Ecommerce Innovation'
    },
    featuredImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    category: 'Case Studies',
    readTime: '5 min read',
    tags: ['D2C Retail', 'Shopify Plus', 'AI Shopping Assistant', 'Conversion Optimization'],
    metrics: [
      { label: 'Conversion Lift', value: '3.8x' },
      { label: 'Return Rate Reduction', value: '-42%' },
      { label: 'AOV Increase', value: '+26%' }
    ]
  },
  {
    id: 104,
    slug: 'optimizing-headless-commerce-ai-search-2026',
    type: 'blog',
    title: 'Optimizing Headless Commerce for Generative AI Search Engines',
    excerpt: 'Learn how to structure your e-commerce platform schema, llms.txt, and product endpoints to rank #1 in ChatGPT, Gemini, and Claude shopping recommendations.',
    content: `
      <h2>What is Generative AI Search Optimization?</h2>
      <p>As consumers transition from traditional Google search result lists to conversational AI engines like ChatGPT, Gemini, and Perplexity, e-commerce stores must optimize their digital catalogs for AI crawlers.</p>

      <h2>The 4 Pillars of E-Commerce AI Search Optimization</h2>
      <ul>
        <li><strong>Standardized llms.txt Files:</strong> Provide clean, structured markdown files detailing site architecture and catalog pricing.</li>
        <li><strong>Rich Schema Graphs:</strong> Implement complete Schema.org Organization, Product, and Offer JSON-LD graphs.</li>
        <li><strong>Sub-50ms API Response Times:</strong> Ensure AI search crawlers can fetch live inventory and product spec sheets without timeouts.</li>
        <li><strong>Clear Definition Blocks:</strong> Include concise, authoritative answer blocks for high-intent buyer questions.</li>
      </ul>

      <h2>Get Started with SilarAI Search Framework</h2>
      <p>SilarAI automatically generates llms.txt, llms-full.txt, ai-manifest.json, and structured Schema graphs out of the box for every merchant store.</p>
    `,
    date: 'July 12, 2026',
    author: {
      name: 'David Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      role: 'Lead AI Engineer & Technical SEO'
    },
    featuredImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    category: 'Blog',
    readTime: '7 min read',
    tags: ['AI Search', 'Headless Commerce', 'Technical SEO']
  },
  {
    id: 105,
    slug: 'distributor-parts-portal-case-study',
    type: 'case-study',
    title: 'National Parts Distributor Digitizes 1,200 Dealer Stores with SilarAI Dealer Portal',
    excerpt: 'How an automotive and heavy equipment spare parts distributor streamlined matrix ordering, territory pricing, and warranty claims across 1,200 regional dealers.',
    content: `
      <h2>Executive Overview</h2>
      <p>A leading distributor supplying aftermarket components to over 1,200 authorized dealer locations suffered from excessive phone order congestion during peak morning hours.</p>

      <h2>The Solution</h2>
      <p>Deployed the <strong>SilarAI Dealer Portal Software</strong>, giving dealer staff 24/7 self-service ordering, interactive exploded assembly diagrams, territory-specific pricing matrixes, and live shipment tracking.</p>

      <h2>Key Outcomes</h2>
      <ul>
        <li><strong>75% Reduction in Phone Support Inquiries:</strong> Dealers placed 88% of orders digitally via the portal.</li>
        <li><strong>Zero Order Entry Errors:</strong> Automated matrix validation prevented wrong part numbers from entering the warehouse WMS.</li>
        <li><strong>$12.8M Online Volume:</strong> Processed through the portal in the first 60 days post-launch.</li>
      </ul>
    `,
    date: 'June 30, 2026',
    author: {
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      role: 'Chief Commercial Officer'
    },
    featuredImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    category: 'Case Studies',
    readTime: '6 min read',
    tags: ['Distributor', 'Dealer Portal', 'B2B Commerce', 'Automotive'],
    metrics: [
      { label: 'Digital Order Adoption', value: '88%' },
      { label: 'Support Ticket Reduction', value: '-75%' },
      { label: '60-Day Digital Volume', value: '$12.8M' }
    ]
  }
];

// Helper function to convert raw WordPress REST API post objects to WpPostItem
export function transformWpPost(rawPost: any): WpPostItem {
  const featuredMedia = rawPost._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
                        rawPost._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.large?.source_url ||
                        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80';

  const authorName = rawPost._embedded?.author?.[0]?.name || 'SilarAI Editor';
  const authorAvatar = rawPost._embedded?.author?.[0]?.avatar_urls?.['96'] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  const rawExcerpt = rawPost.excerpt?.rendered || rawPost.content?.rendered || '';
  const cleanExcerpt = rawExcerpt.replace(/<[^>]+>/g, '').slice(0, 180) + '...';

  const rawTitle = rawPost.title?.rendered || 'Untitled Article';
  const cleanTitle = rawTitle.replace(/&#8211;/g, '-').replace(/&#8217;/g, "'").replace(/&amp;/g, '&');

  // Determine type based on tags or categories or slug
  const slug = rawPost.slug || `post-${rawPost.id}`;
  let type: 'blog' | 'insight' | 'case-study' = 'blog';
  if (slug.includes('case-study') || cleanTitle.toLowerCase().includes('case study') || rawPost.categories_names?.includes('Case Studies')) {
    type = 'case-study';
  } else if (slug.includes('insight') || cleanTitle.toLowerCase().includes('insight') || rawPost.categories_names?.includes('Insights')) {
    type = 'insight';
  }

  const dateObj = new Date(rawPost.date);
  const formattedDate = isNaN(dateObj.getTime()) ? 'Recent' : dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return {
    id: rawPost.id,
    slug: rawPost.slug,
    type,
    title: cleanTitle,
    excerpt: cleanExcerpt,
    content: rawPost.content?.rendered || cleanExcerpt,
    date: formattedDate,
    author: {
      name: authorName,
      avatar: authorAvatar,
      role: 'WordPress CMS Contributor'
    },
    featuredImage: featuredMedia,
    category: type === 'case-study' ? 'Case Studies' : type === 'insight' ? 'Industry Insights' : 'Blog',
    readTime: '5 min read',
    tags: rawPost.tags_names || ['AI Commerce', 'WordPress Headless', 'SilarAI'],
    link: rawPost.link
  };
}

import { wpManager } from './WordPressIntegrationManager';

export async function fetchWordPressPosts(wpUrlOverride?: string): Promise<{
  success: boolean;
  posts: WpPostItem[];
  source: 'wordpress' | 'fallback';
  wpUrl?: string;
  message?: string;
}> {
  const wpUrl = (wpUrlOverride || getStoredWordPressUrl()).trim().replace(/\/$/, '');
  const result = await wpManager.getPosts({}, wpUrl);
  return {
    success: result.success,
    posts: result.posts,
    source: result.source,
    wpUrl: result.wpUrl,
    message: result.message
  };
}

