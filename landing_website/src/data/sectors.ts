import React from "react";
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
  Sliders,
  MessageCircle,
  Clock,
  ShieldCheck,
  ShoppingBag,
  Layers,
  HelpCircle,
  Search,
  TrendingUp,
} from "lucide-react";

export interface SectorData {
  slug: string;
  name: string;
  tag: string;
  badge: string;
  icon: React.ElementType;
  headline: string;
  subheadline: string;
  primaryStats: { label: string; value: string; helper: string }[];
  launchInHoursTitle: string;
  launchHoursSubtitle: string;
  launchTimeline: {
    hour: string;
    title: string;
    description: string;
    highlights: string[];
  }[];
  comparisonRows: {
    dimension: string;
    traditional: string;
    silarAi: string;
    advantage: string;
  }[];
  existingStoreAssistant: {
    badge: string;
    title: string;
    description: string;
    embedCode: string;
    keyBenefits: { title: string; desc: string; icon: React.ElementType }[];
    simulatedChat: {
      userQuery: string;
      aiResponse: string;
      recommendations?: { name: string; price: string; tag: string; imageEmoji: string }[];
    }[];
  };
  b2b2cCapabilities: {
    title: string;
    description: string;
    tag: string;
  }[];
  seoKeywords: {
    group: string;
    keywords: string[];
    monthlySearches: string;
    intent: 'Transactional' | 'Commercial' | 'Informational';
  }[];
  backlinks: {
    title: string;
    anchorText: string;
    url: string;
    targetContext: string;
    type: 'Internal Product' | 'Comparison Guide' | 'Industry Hub';
  }[];
  faqList: {
    question: string;
    answer: string;
  }[];
}

export const SECTORS: Record<string, SectorData> = {
  boutiques: {
    slug: 'boutiques',
    name: 'Boutiques & Curated Apparel',
    tag: 'Curated',
    badge: 'Fashion & Designer Boutiques',
    icon: Store,
    headline: 'Launch a Boutique & B2B2C Store in 3 Hours — Not 4 Months',
    subheadline:
      'Transform your curated fashion, apparel, or lifestyle boutique into a high-converting dual-channel commerce power. Sell direct to fashion shoppers with an AI Personal Stylist, while offering wholesale multi-tier buyer pricing for multi-brand boutiques in one unified platform.',
    primaryStats: [
      { label: 'Time to First Sale', value: '< 3 Hours', helper: 'vs 12-16 weeks traditional dev' },
      { label: 'Conversion Lift', value: '+44.8%', helper: 'powered by AI Personal Stylist' },
      { label: 'Return Reduction', value: '-38%', helper: 'exact sizing & fit assistance' },
      { label: 'Setup Cost Savings', value: '92%', helper: 'zero custom code or agency retainer' },
    ],
    launchInHoursTitle: 'How Boutiques Launch in 4 Simple Hours',
    launchHoursSubtitle:
      'Why spend $40,000 and 4 months with custom software agencies when SilarAI gives you an enterprise-grade boutique store before lunch?',
    launchTimeline: [
      {
        hour: 'Hour 01',
        title: 'Catalog & Variant Sizing Sync',
        description: 'Upload your curated lookbooks, sizing specs, variant matrices (Color, Size, Material), and inventory via CSV, Instagram, or 1-click Shopify import.',
        highlights: ['Automatic spec sheet parsing', 'Visual lookbook tagging', 'Real-time stock alerts'],
      },
      {
        hour: 'Hour 02',
        title: 'Boutique Branding & Custom Domain',
        description: 'Apply your custom typography, luxury color palette, domain (e.g. www.yourboutique.com) with instant free SSL, and mobile responsive layout.',
        highlights: ['Instant SSL certification', 'Curated editorial grids', 'Lightning fast mobile PWA'],
      },
      {
        hour: 'Hour 03',
        title: 'Dual B2B Wholesale & B2C Retail Pricing',
        description: 'Set retail MSRP for direct consumer shoppers, while unlocking private wholesale accounts with Net-30 terms and tiered quantity pricing for partner stockists.',
        highlights: ['Private stockist portal', 'Tiered volume discounts', 'Purchase order approvals'],
      },
      {
        hour: 'Hour 04',
        title: 'AI Personal Stylist & WhatsApp Launch',
        description: 'Train the conversational shopping assistant on your style guides and return policies. Activate WhatsApp 1-click ordering and go live to the world.',
        highlights: ['Conversational outfit matching', '1-click WhatsApp buy links', '24/7 automated fit guidance'],
      },
    ],
    comparisonRows: [
      {
        dimension: 'Time to Market',
        traditional: '12 to 18 weeks (complex design sprints, custom frontend dev, and testing)',
        silarAi: '2 to 4 hours (pre-built boutique architecture & turnkey catalog sync)',
        advantage: 'Launch 30x faster',
      },
      {
        dimension: 'Total Initial Cost',
        traditional: '$25,000 – $60,000+ (agency fees, custom backend, Shopify Plus licenses)',
        silarAi: 'Starts at $25/month (zero development cost, zero upfront agency fees)',
        advantage: 'Save $25k+ upfront',
      },
      {
        dimension: 'B2B & B2C Architecture',
        traditional: 'Separate stores or fragmented Shopify Plus expansion stores with high overhead',
        silarAi: 'Unified dual-engine: retail shoppers see MSRP; wholesale buyers see contract tiers',
        advantage: 'Single unified dashboard',
      },
      {
        dimension: 'AI Shopping Assistant',
        traditional: 'Generic keyword chatbots or expensive custom AI apps requiring engineering',
        silarAi: 'Native Agentic AI Shopping Assistant with sizing reasoning and lookbook styling',
        advantage: 'Zero hallucination styling',
      },
      {
        dimension: 'Social & WhatsApp Commerce',
        traditional: 'Disconnected plugins requiring manual message checking and manual links',
        silarAi: 'Native Instagram DM and WhatsApp conversational cart recovery and checkout',
        advantage: 'Automatic WhatsApp checkout',
      },
      {
        dimension: 'Ongoing Maintenance',
        traditional: 'Costly developer retainers ($3k-$5k/mo) for plugin updates and broken APIs',
        silarAi: 'Fully hosted, auto-updating cloud SaaS with 99.99% uptime guarantee',
        advantage: 'Zero technical debt',
      },
    ],
    existingStoreAssistant: {
      badge: 'Drop-In AI for Existing Stores',
      title: 'Already have a Shopify, WooCommerce, or Custom Boutique?',
      description:
        'You do NOT need to rebuild your storefront to leverage SilarAI. Drop our 1-line lightweight JavaScript snippet into your existing website, and instantly empower your shoppers with an AI Personal Stylist that drives immediate conversions.',
      embedCode: `<script 
  src="https://cdn.silarai.com/assistant.js" 
  data-store-id="boutique_store_live" 
  data-theme="luxury-curated" 
  async>
</script>`,
      keyBenefits: [
        {
          title: 'Instant Fit & Sizing Intelligence',
          desc: 'Answers questions like "Will size Medium fit a 36-inch bust and 29-inch waist?" instantly using your product spec sheets, slashing returns by 38%.',
          icon: Sliders,
        },
        {
          title: 'Complete-the-Look Outfit Styling',
          desc: 'When a shopper examines a dress, the assistant suggests matching artisanal earrings, handcrafted leather bags, and shoes with 1-click bundle additions.',
          icon: Sparkles,
        },
        {
          title: 'Fast 1-Click WhatsApp Shopping',
          desc: 'Shoppers can place orders directly over WhatsApp or complete checkout in the chat drawer without navigating through multiple sluggish pages.',
          icon: MessageCircle,
        },
        {
          title: '24/7 Global Boutique Concierge',
          desc: 'Handles fabric care, pre-orders, international shipping inquiries, and restocking timelines automatically in 20+ languages.',
          icon: Clock,
        },
      ],
      simulatedChat: [
        {
          userQuery: 'I love the Emerald Silk Midi Dress. Will size M fit a 38" bust, and what shoes match it?',
          aiResponse:
            'Yes! The Emerald Silk Midi has an elasticated bodice with a relaxed drape that comfortably accommodates a 38" bust in Size M. For footwear, our clients love pairing it with the Handcrafted Gold Strappy Mules and the Pearl Drop Earrings.',
          recommendations: [
            { name: 'Emerald Silk Midi Dress', price: '$220', tag: 'In Stock (M)', imageEmoji: '👗' },
            { name: 'Gold Strappy Mules', price: '$145', tag: 'Matches Outfit', imageEmoji: '👠' },
            { name: 'Pearl Drop Earrings', price: '$68', tag: 'Curated Accessory', imageEmoji: '✨' },
          ],
        },
      ],
    },
    b2b2cCapabilities: [
      {
        title: 'Retail Storefront + Wholesale Buyer Portals',
        description: 'Allow everyday fashion lovers to buy pieces at retail prices while granting multi-brand stockists private logins with Net-30 invoice terms.',
        tag: 'Dual Revenue Streams',
      },
      {
        title: 'Curated Lookbooks with Shoppable Hotspots',
        description: 'Publish interactive seasonal lookbooks where shoppers click individual items worn by models to add whole coordinated outfits to cart.',
        tag: 'Editorial Commerce',
      },
      {
        title: 'Pre-Order & Limited Drop Exclusives',
        description: 'Run exclusive capsule collections and numbered limited editions with countdown timers and VIP early access invitations.',
        tag: 'Scarcity & Drops',
      },
      {
        title: 'Omnichannel WhatsApp Order Desk',
        description: 'Turn your WhatsApp Business into an interactive boutique showroom where customers browse lookbooks and buy in two taps.',
        tag: 'Social Selling',
      },
    ],
    seoKeywords: [
      {
        group: 'Primary Target Keywords',
        keywords: [
          'Boutique AI E-Commerce Platform',
          'B2B2C Boutique Store Builder',
          'AI Personal Stylist for Online Boutique',
          'Fast Fashion Storefront Launch in Hours',
          'Curated Apparel E-Commerce Software',
        ],
        monthlySearches: '18,400 / mo',
        intent: 'Transactional',
      },
      {
        group: 'Existing Store & Drop-In Search Terms',
        keywords: [
          'AI Shopping Assistant for Shopify Boutique',
          'WooCommerce Boutique Conversational Assistant',
          'Apparel Size Recommendation Chatbot',
          'WhatsApp Commerce for Fashion Boutiques',
        ],
        monthlySearches: '12,900 / mo',
        intent: 'Commercial',
      },
      {
        group: 'B2B2C & Wholesale Intent Terms',
        keywords: [
          'B2B2C Fashion Marketplace Platform',
          'Wholesale Boutique Ordering Portal with Net Terms',
          'Multi-tier Apparel Pricing Software',
          'Independent Brand Stockist Ordering System',
        ],
        monthlySearches: '9,200 / mo',
        intent: 'Transactional',
      },
    ],
    backlinks: [
      {
        title: 'SilarAI AI Shopping Assistant Engine',
        anchorText: 'AI Shopping Assistant for Existing Boutiques',
        url: '/ai-shopping-assistant',
        targetContext: 'Integrate conversational stylist widget into existing Shopify or custom boutique stores with 1 line of JS.',
        type: 'Internal Product',
      },
      {
        title: 'SilarAI Unified Commerce Platform',
        anchorText: 'All-in-One Boutique E-Commerce Platform',
        url: '/ai-commerce-platform',
        targetContext: 'Launch complete D2C storefront, catalog management, and B2B wholesale ordering portal.',
        type: 'Internal Product',
      },
      {
        title: 'Shopify vs SilarAI Platform Analysis',
        anchorText: 'Compare SilarAI vs Traditional Shopify for Boutiques',
        url: '/shopify-vs-silarai',
        targetContext: 'Detailed breakdown of app subscription stacking vs SilarAI turnkey unified platform.',
        type: 'Comparison Guide',
      },
      {
        title: 'D2C Brands AI Commerce Transformation Hub',
        anchorText: 'D2C Fashion & Apparel Digital Strategy',
        url: '/industries/d2c-brands',
        targetContext: 'Comprehensive guide to scaling D2C average order value with automated merchandising.',
        type: 'Industry Hub',
      },
      {
        title: 'Wholesalers & Distributors B2B Portal',
        anchorText: 'B2B Wholesale Ordering & Dealer Portals',
        url: '/industries/wholesalers',
        targetContext: 'Implement customer-specific pricing matrices and Net payment terms for trade accounts.',
        type: 'Industry Hub',
      },
    ],
    faqList: [
      {
        question: 'Can I use SilarAI if I already have a live Shopify or WooCommerce boutique?',
        answer:
          'Yes! You do not need to migrate your store. You can embed our AI Shopping Assistant onto your existing site with a 1-line script. It syncs with your product catalog in real time, assists customers with sizing, pairs outfits, and directs them to your existing checkout.',
      },
      {
        question: 'How does SilarAI enable a B2B2C store in just a few hours?',
        answer:
          'SilarAI includes both retail consumer checkout and wholesale stockist portals out-of-the-box. Instead of paying developers to build custom login portals, credit net terms, and tiered pricing rules, you simply configure your pricing rules in our dashboard and invite wholesale buyers immediately.',
      },
      {
        question: 'How does the AI assistant handle tricky boutique sizing and fit queries?',
        answer:
          'SilarAI ingests your exact brand measurements (bust, waist, hip, fabric stretch percentage) and answers shopper sizing questions mathematically. If a customer is between sizes, it provides tailored advice based on fabric composition (e.g., 100% linen vs. elastane blend).',
      },
      {
        question: 'What is the cost comparison between SilarAI and traditional custom development?',
        answer:
          'Traditional custom development for a boutique with dual B2B/B2C features costs between $25,000 and $60,000 plus months of agency meetings. SilarAI plans start at just $25/month with zero upfront development fees and immediate turnkey deployment.',
      },
    ],
  },
  b2b2c: {
    slug: 'b2b2c',
    name: 'B2B2C Multi-Tier Commerce',
    tag: 'Multi-Tier',
    badge: 'Dual Wholesale & Retail',
    icon: Zap,
    headline: 'Launch a Dual B2B2C Platform in Hours — Not Quarters',
    subheadline:
      'Unify wholesale distributors, regional stockists, and end consumers into one intelligent catalog. Provide trade accounts with contract pricing and Net terms while delivering a premier retail shopping experience.',
    primaryStats: [
      { label: 'Time to Deployment', value: '4 Hours', helper: 'vs 6+ months enterprise custom dev' },
      { label: 'Platform Savings', value: '88%', helper: 'eliminates double licensing & sync tools' },
      { label: 'Order Processing Speed', value: '3.8x', helper: 'automated digital PO & quote checkouts' },
      { label: 'Trade Self-Service', value: '62%', helper: 'wholesale reorders via client portal' },
    ],
    launchInHoursTitle: 'B2B2C Store Launch in 4 Hours',
    launchHoursSubtitle: 'Cut through traditional IT bottlenecks with pre-configured dual-tier commerce architecture.',
    launchTimeline: [
      {
        hour: 'Hour 01',
        title: 'Master Catalog & Tier Definition',
        description: 'Upload catalog with base retail prices and tier multipliers (Tier 1: 40% off, Tier 2: 30% off, Tier 3: Net-30).',
        highlights: ['CSV / ERP sync', 'Custom unit of measure (cases/pallets)', 'SKU permissioning'],
      },
      {
        hour: 'Hour 02',
        title: 'Dual-View Storefront & Branding',
        description: 'Enable public guest shopping for consumers alongside a secure VIP / Dealer login for approved business accounts.',
        highlights: ['SSO & customer groups', 'Branded portal subdomains', 'Tax exemption support'],
      },
      {
        hour: 'Hour 03',
        title: 'Payment Terms & Credit Automation',
        description: 'Configure multi-gateway payments (Stripe/Razorpay for B2C, Net-15/30/60 & PO uploads for B2B accounts).',
        highlights: ['Instant credit approvals', 'Automated PDF invoicing', 'Bank transfer reconciliation'],
      },
      {
        hour: 'Hour 04',
        title: 'AI Commerce Agent Deployment',
        description: 'Deploy AI Shopping Assistant that recognizes buyer role: quotes trade pricing to wholesale partners and retail MSRP to consumers.',
        highlights: ['Role-aware responses', 'Automated RFQ generation', 'Instant reorder links'],
      },
    ],
    comparisonRows: [
      {
        dimension: 'Development Timeline',
        traditional: '6 to 9 months (building two distinct sites, custom middleware, and syncing ERP)',
        silarAi: 'Under 4 hours (native multi-tier engine pre-engineered for B2B2C)',
        advantage: 'Save 6+ months',
      },
      {
        dimension: 'Platform Complexity',
        traditional: '2 separate platforms (e.g. Magento B2B + Shopify D2C) with brittle connector scripts',
        silarAi: '1 unified cloud platform with role-based buyer views and shared real-time inventory',
        advantage: 'Zero sync errors',
      },
      {
        dimension: 'Total Cost of Ownership',
        traditional: '$50,000 – $120,000 initial build + $2,500/mo server & maintenance fees',
        silarAi: 'Flat, transparent subscription starting from $50/month with zero infrastructure headaches',
        advantage: '90%+ TCO reduction',
      },
      {
        dimension: 'AI Shopping & Trade Assistance',
        traditional: 'Separate legacy support desks for consumers and manual phone sales reps for trade',
        silarAi: 'Unified 24/7 AI Assistant that handles consumer queries & wholesale bulk quote calculations',
        advantage: 'Unified 24/7 AI coverage',
      },
    ],
    existingStoreAssistant: {
      badge: 'B2B2C AI for Existing Websites',
      title: 'Add B2B2C Intelligence to Your Current Store',
      description:
        'Have an existing website? Embed SilarAI AI Shopping Assistant to quote bulk volume discounts, generate instant RFQ proposals, and assist retail shoppers simultaneously.',
      embedCode: `<script 
  src="https://cdn.silarai.com/assistant.js" 
  data-store-id="b2b2c_hub" 
  data-role-detection="true" 
  async>
</script>`,
      keyBenefits: [
        {
          title: 'Role-Based Smart Pricing',
          desc: 'Identifies logged-in wholesale buyers and displays custom contract pricing and case pack minimums automatically in conversational search.',
          icon: ShieldCheck,
        },
        {
          title: 'Instant RFQ Proposal Generation',
          desc: 'Wholesale buyers can type "I need 500 units shipped to Dallas by Friday" and get an instant downloadable digital quote with discount tiers.',
          icon: Zap,
        },
        {
          title: 'Consumer Retail Fast-Track',
          desc: 'Individual consumers get fast 1-click checkout, product comparisons, and instant answers on availability and shipping.',
          icon: ShoppingBag,
        },
        {
          title: 'Real-Time Inventory Safeguards',
          desc: 'Prevents bulk trade orders from cannibalizing high-margin retail inventory with smart stock reserve rules.',
          icon: Layers,
        },
      ],
      simulatedChat: [
        {
          userQuery: 'We are looking to place a wholesale order of 300 units of the Ultra-Grip Series. What is the contract price and lead time?',
          aiResponse:
            'Welcome! For verified wholesale partner accounts, Tier-2 pricing applies at $18.50/unit (38% below MSRP $30.00). Total: $5,550.00. 300 units are available in our Midwest distribution center for immediate dispatch via Freight LTL in 2 business days.',
          recommendations: [
            { name: 'Ultra-Grip Series (Case of 50)', price: '$925.00/case', tag: 'Wholesale Contract Tier', imageEmoji: '📦' },
          ],
        },
      ],
    },
    b2b2cCapabilities: [
      {
        title: 'Tiered Price Lists & Net Terms',
        description: 'Manage individual pricing schedules and payment terms (Net 15/30/60) per company account.',
        tag: 'Wholesale Automation',
      },
      {
        title: 'Unified Inventory & Multi-Warehouse Allocation',
        description: 'Sync inventory across D2C retail channels and B2B wholesale distribution hubs in real time.',
        tag: 'Stock Management',
      },
      {
        title: '1-Click Reorders & CSV Matrix Uploads',
        description: 'Provide commercial buyers with fast spreadsheet upload tools and recurring subscription ordering.',
        tag: 'Fast Purchasing',
      },
      {
        title: 'Omnichannel B2B2C WhatsApp Desk',
        description: 'Let wholesale buyers approve quotes and retail customers track deliveries via WhatsApp.',
        tag: 'Conversational Desk',
      },
    ],
    seoKeywords: [
      {
        group: 'B2B2C Search Terms',
        keywords: [
          'B2B2C E-Commerce Platform',
          'Dual B2B D2C Storefront Builder',
          'Launch B2B2C Store in Hours',
          'Wholesale and Retail Unified Commerce',
          'Multi-Tier Pricing Platform for Manufacturers',
        ],
        monthlySearches: '14,200 / mo',
        intent: 'Transactional',
      },
      {
        group: 'AI Assistant for Trade & Retail',
        keywords: [
          'B2B AI Shopping Assistant',
          'Wholesale RFQ Chatbot Automation',
          'Role-Aware E-Commerce Assistant',
          'Shopify B2B AI Assistant Widget',
        ],
        monthlySearches: '9,800 / mo',
        intent: 'Commercial',
      },
    ],
    backlinks: [
      {
        title: 'SilarAI B2B Commerce Platform',
        anchorText: 'B2B Wholesale & Dealer Portal Software',
        url: '/ai-commerce-platform',
        targetContext: 'Enterprise wholesale portal with account hierarchy and Net terms.',
        type: 'Internal Product',
      },
      {
        title: 'SilarAI AI Shopping Assistant',
        anchorText: 'AI Shopping Assistant for Wholesale & Retail',
        url: '/ai-shopping-assistant',
        targetContext: 'Conversational assistant for product discovery and quick order quotes.',
        type: 'Internal Product',
      },
      {
        title: 'Wholesalers Industry Page',
        anchorText: 'AI Solutions for Wholesalers & Cash & Carry',
        url: '/industries/wholesalers',
        targetContext: 'How high-volume wholesale distributors scale with AI-driven commerce.',
        type: 'Industry Hub',
      },
    ],
    faqList: [
      {
        question: 'Can retail customers and wholesale buyers use the same website?',
        answer:
          'Yes! SilarAI allows retail customers to browse normally and checkout with credit cards, while trade partners log in to unlock their assigned contract pricing, tax exemption, and Net payment terms.',
      },
      {
        question: 'How fast can a business transition from legacy development to SilarAI B2B2C?',
        answer:
          'Most businesses import their catalog and customer accounts in 2 to 4 hours. You can either use SilarAI as your complete storefront or embed our AI assistant on your existing website.',
      },
    ],
  },
  jeweller: {
    slug: 'jeweller',
    name: 'Jewellers & Luxury Goods',
    tag: 'High-Value',
    badge: 'Fine Jewellery & Precious Goods',
    icon: Gem,
    headline: 'High-Value Conversational AI Commerce for Fine Jewellers',
    subheadline:
      'Guide discerning clients through high-value diamonds, gold, precious stones, and bespoke custom designs with an AI Luxury Concierge that builds immediate trust and closes sales.',
    primaryStats: [
      { label: 'AOV Increase', value: '+32.4%', helper: 'curated matching metals & stones' },
      { label: 'Consultation Booking', value: '3.6x', helper: 'frictionless VIP appointment booking' },
      { label: 'Lead Capture', value: '54%', helper: 'WhatsApp bespoke inquiry capture' },
      { label: 'Time to Launch', value: '< 4 Hours', helper: 'turnkey luxury showcase' },
    ],
    launchInHoursTitle: 'Launch a Luxury Jewellery Storefront in 4 Hours',
    launchHoursSubtitle: 'Deliver a boutique salon experience online without months of custom agency coding.',
    launchTimeline: [
      { hour: 'Hour 01', title: 'Carat, Clarity & Metal Spec Import', description: 'Index certifications (GIA, IGI), metal purity (14k, 18k, 925), and diamond cuts with sub-second search filters.', highlights: ['Certificate uploads', 'Cut/Clarity filters', 'Live metal rate pricing'] },
      { hour: 'Hour 02', title: 'High-End Luxury Visual Storefront', description: 'Refined typography, high-resolution zoom grids, and custom domain setup with banking-grade SSL.', highlights: ['Luxury aesthetic', 'Custom domain ready', 'High-res zoom viewer'] },
      { hour: 'Hour 03', title: 'Bespoke Inquiries & VIP Virtual Consults', description: 'Configure custom ring sizing, custom engraving requests, and 1-click video appointment scheduling.', highlights: ['Custom quote calculator', 'Video consult bookings', 'Secure deposit links'] },
      { hour: 'Hour 04', title: 'AI Luxury Gemologist Concierge Go-Live', description: 'Train the AI assistant to answer complex diamond 4Cs questions, ring sizing guides, and insured shipping details.', highlights: ['4Cs diamond advice', 'Ring sizer guidance', 'Insured shipping FAQs'] },
    ],
    comparisonRows: [
      { dimension: 'Launch Speed', traditional: '4 to 6 months', silarAi: 'Under 4 hours', advantage: '35x faster launch' },
      { dimension: 'Custom Bespoke Quoting', traditional: 'Manual emails & phone calls taking 48+ hours', silarAi: 'Instant AI quote calculation and WhatsApp handoff', advantage: 'Instant response' },
      { dimension: 'Trust & Guidance', traditional: 'Static product pages with dense certificate PDFs', silarAi: 'Conversational gemologist explaining cut, clarity, and provenance', advantage: 'High conversion lift' },
    ],
    existingStoreAssistant: {
      badge: 'Jewellery AI for Existing Stores',
      title: 'Add an AI Gemologist to Your Existing Jewellery Store',
      description: 'Embed SilarAI on your existing Shopify or WooCommerce jewellery store to answer certification, sizing, and styling questions 24/7.',
      embedCode: `<script src="https://cdn.silarai.com/assistant.js" data-store-id="luxury_jeweller_live" async></script>`,
      keyBenefits: [
        { title: 'The 4Cs Diamond Assistant', desc: 'Explains Cut, Color, Clarity, and Carat weight in approachable, reassuring language.', icon: Gem },
        { title: 'Ring Sizing & Fit Precision', desc: 'Guides buyers through international sizing conversions and ring finger measuring techniques.', icon: Sliders },
        { title: 'Bespoke Design Inquiries', desc: 'Captures custom engagement ring requirements and routes qualified briefs to your master jeweller.', icon: MessageCircle },
      ],
      simulatedChat: [
        {
          userQuery: 'What is the difference between VS1 and SI1 clarity for an oval cut diamond engagement ring?',
          aiResponse: 'Great question! VS1 diamonds have microscopic inclusions that are invisible to the naked eye. In oval cuts, a VS1 offers exceptional brilliance. SI1 diamonds may have slight inclusions that are occasionally visible under bright light, but offer an attractive price point.',
        },
      ],
    },
    b2b2cCapabilities: [
      { title: 'B2B Trade Wholesale & Consignment', description: 'Manage retail storefront alongside wholesale trade accounts for regional retail jewellers.', tag: 'B2B Diamond Trade' },
      { title: 'Live Precious Metal Pricing Sync', description: 'Dynamically recalculate pricing based on daily gold and platinum spot prices.', tag: 'Dynamic Gold Rates' },
    ],
    seoKeywords: [
      { group: 'Jewellery E-Commerce Keywords', keywords: ['Jewellery AI E-Commerce Platform', 'AI Gemologist Shopping Assistant', 'Online Diamond Store Builder in Hours'], monthlySearches: '11,400 / mo', intent: 'Transactional' },
    ],
    backlinks: [
      { title: 'SilarAI AI Shopping Assistant', anchorText: 'AI Shopping Assistant for Luxury & Jewellers', url: '/ai-shopping-assistant', targetContext: 'Conversational luxury concierge for high-AOV consideration.', type: 'Internal Product' },
      { title: 'Boutiques & Luxury Commerce', anchorText: 'Curated Boutique & Designer Commerce', url: '/sector/boutiques', targetContext: 'Explore curated boutique retail solutions.', type: 'Industry Hub' },
    ],
    faqList: [
      { question: 'Can the AI assistant explain diamond certifications like GIA and IGI?', answer: 'Yes, the AI is trained on gemological standards and can pull certificate numbers, cut grading, and polish specs directly from your catalog.' },
    ],
  },
  'home-sellers': {
    slug: 'home-sellers',
    name: 'Home Sellers & Lifestyle Decor',
    tag: 'Direct',
    badge: 'Home Decor, Furnishing & Lifestyle',
    icon: Home,
    headline: 'Launch a High-Conversion Home Decor & Furniture Store in Hours',
    subheadline:
      'Help shoppers visualize room dimensions, coordinate color palettes, and bundle matching furniture collections with an AI Interior Decorator assistant.',
    primaryStats: [
      { label: 'Bundle Rate', value: '+38%', helper: 'coordinated room packages' },
      { label: 'Dimension Queries', value: '82% Deflected', helper: 'instant room fit answers' },
      { label: 'Launch Speed', value: '3 Hours', helper: 'turnkey lifestyle storefront' },
      { label: 'LTV Expansion', value: '+45%', helper: 'automated seasonal reorders' },
    ],
    launchInHoursTitle: 'Launch Your Home & Living Storefront in Hours',
    launchHoursSubtitle: 'Sell complete room concepts and artisanal home goods without expensive custom developers.',
    launchTimeline: [
      { hour: 'Hour 01', title: 'Furniture Catalog & Dimensions Upload', description: 'Upload width, depth, height, fabric swatches, and care instructions in bulk.', highlights: ['Dimension specs', 'Fabric swatches', 'Assembly guide attachments'] },
      { hour: 'Hour 02', title: 'Curated Room Lookbooks & Domain', description: 'Create shoppable living room, bedroom, and kitchen galleries with instant domain link.', highlights: ['Room visualizer', 'Free SSL', 'Mobile optimized'] },
      { hour: 'Hour 03', title: 'Freight & White-Glove Shipping Setup', description: 'Configure flat-rate delivery, local pickup, and freight quotes automatically.', highlights: ['Freight shipping rules', 'Zip-code delivery check', 'White-glove add-on'] },
      { hour: 'Hour 04', title: 'AI Interior Decorator Assistant Go-Live', description: 'Train assistant on space planning and color pairing to recommend complete room sets.', highlights: ['Color coordination', 'Measurement validation', 'WhatsApp styling advice'] },
    ],
    comparisonRows: [
      { dimension: 'Time to Market', traditional: '3 to 5 months', silarAi: 'Under 3 hours', advantage: 'Launch in 1 afternoon' },
      { dimension: 'Room Bundling', traditional: 'Manual configuration requiring custom app plugins', silarAi: 'Native conversational room styling & bundle discounts', advantage: 'Higher AOV' },
    ],
    existingStoreAssistant: {
      badge: 'Home Decor AI Assistant',
      title: 'Embed AI Interior Decorator on Your Existing Website',
      description: 'Works with your current Shopify, WooCommerce, or BigCommerce furniture store in 1 line of code.',
      embedCode: `<script src="https://cdn.silarai.com/assistant.js" data-store-id="home_decor_live" async></script>`,
      keyBenefits: [
        { title: 'Room Fit & Dimension Reasoning', desc: 'Answers questions like "Will this 84-inch sofa fit in a 10x12 living room?" with spatial advice.', icon: Home },
        { title: 'Color Palette Matching', desc: 'Recommends matching cushions, area rugs, and wall art for any selected furniture piece.', icon: Palette },
      ],
      simulatedChat: [
        {
          userQuery: 'What dining chairs pair best with the Walnut Extendable Dining Table?',
          aiResponse: 'The Walnut Extendable Table pairs beautifully with our Mid-Century Bouclé Dining Chairs in Cream, or the Matte Black Spindle Chairs for a modern contrast.',
        },
      ],
    },
    b2b2cCapabilities: [
      { title: 'Trade Program for Interior Designers', description: 'Give licensed interior designers 20% trade discounts and project invoice portals.', tag: 'Trade Program' },
    ],
    seoKeywords: [
      { group: 'Home Decor Keywords', keywords: ['Home Decor AI E-Commerce Platform', 'AI Furniture Storefront Builder', 'Interior Design Shopping Assistant'], monthlySearches: '8,900 / mo', intent: 'Transactional' },
    ],
    backlinks: [
      { title: 'SilarAI AI Shopping Assistant', anchorText: 'AI Shopping Assistant for Furniture & Home Decor', url: '/ai-shopping-assistant', targetContext: 'Conversational styling and sizing for home furnishings.', type: 'Internal Product' },
    ],
    faqList: [
      { question: 'Can the AI calculate whether large furniture fits through standard doorways?', answer: 'Yes, the AI analyzes package dimensions and compares them against standard 30-inch or 32-inch door frames.' },
    ],
  },
  'beauty-brands': {
    slug: 'beauty-brands',
    name: 'Beauty Brands & Cosmetics',
    tag: 'Formulas',
    badge: 'Skincare, Cosmetics & Haircare',
    icon: Heart,
    headline: 'AI Skincare & Cosmetics Commerce Platform — Launch in 3 Hours',
    subheadline:
      'Empower beauty shoppers with a 24/7 AI Esthetician that recommends personalized skincare routines, analyzes ingredients, and matches foundation shades.',
    primaryStats: [
      { label: 'Repeat Purchase Rate', value: '+62%', helper: 'automated routine replenishments' },
      { label: 'Routine Bundle AOV', value: '+36%', helper: 'complete 3-step skincare regimens' },
      { label: 'Return Reduction', value: '-42%', helper: 'skin-type matched formulas' },
      { label: 'Launch Speed', value: '3 Hours', helper: 'turnkey beauty storefront' },
    ],
    launchInHoursTitle: 'Launch Your Beauty Brand in 3 Simple Hours',
    launchHoursSubtitle: 'Skip expensive agency retainers and deliver an interactive beauty consultation experience.',
    launchTimeline: [
      { hour: 'Hour 01', title: 'Ingredient & Formula Catalog Setup', description: 'Upload INCI ingredient lists, skin type suitability (Dry, Oily, Sensitive), and clinical trial claims.', highlights: ['INCI ingredient indexing', 'Skin type tagging', 'Cruelty-free/Vegan badges'] },
      { hour: 'Hour 02', title: 'Chic Beauty Storefront & Domain Sync', description: 'Apply soft beauty aesthetic, high-res texture closeups, customer review stars, and custom domain.', highlights: ['Minimalist chic theme', 'Verified reviews widget', 'Instant SSL'] },
      { hour: 'Hour 03', title: 'Recurring Subscriptions & WhatsApp Reorders', description: 'Set up 30/60-day automatic delivery replenishment and automated WhatsApp reorder triggers.', highlights: ['Replenishment subscriptions', 'WhatsApp reorder prompts', 'Free sample gifting logic'] },
      { hour: 'Hour 04', title: 'AI Esthetician Consultation Bot Go-Live', description: 'Deploy the AI assistant to conduct personalized skin quizzes and recommend morning/night routines.', highlights: ['Skin routine generator', 'Ingredient safety checks', 'Instant cart bundling'] },
    ],
    comparisonRows: [
      { dimension: 'Time to Market', traditional: '3 to 4 months', silarAi: 'Under 3 hours', advantage: 'Launch today' },
      { dimension: 'Skin Quiz Integration', traditional: 'Costly third-party quiz apps ($200-$500/mo) with disjointed carts', silarAi: 'Native conversational AI esthetician built directly into the store', advantage: 'Zero app bloat' },
    ],
    existingStoreAssistant: {
      badge: 'Beauty AI for Existing Stores',
      title: 'Embed an AI Esthetician on Your Existing Beauty Store',
      description: 'Add conversational routine consultations to your Shopify or WooCommerce beauty store with 1 line of script.',
      embedCode: `<script src="https://cdn.silarai.com/assistant.js" data-store-id="beauty_store_live" async></script>`,
      keyBenefits: [
        { title: 'Personalized Skincare Routine Builder', desc: 'Recommends Cleanse-Tone-Treat-Hydrate regimens based on the shopper’s exact skin concerns.', icon: Sparkles },
        { title: 'Ingredient Compatibility Checks', desc: 'Answers questions like "Can I use this Retinol serum with Vitamin C?" safely.', icon: ShieldCheck },
      ],
      simulatedChat: [
        {
          userQuery: 'I have sensitive skin prone to redness. Which moisturizer works best with active Niacinamide?',
          aiResponse: 'For sensitive skin using Niacinamide, our Barrier Relief Ceramide Cream is ideal. It contains calming Centella Asiatica and zero fragrance or drying alcohols, reinforcing your moisture barrier.',
        },
      ],
    },
    b2b2cCapabilities: [
      { title: 'Salon & Spa Wholesale Accounts', description: 'Allow estheticians, spas, and dermatology clinics to order backbar sizes at wholesale rates.', tag: 'Spa Wholesale' },
    ],
    seoKeywords: [
      { group: 'Beauty Commerce Keywords', keywords: ['Beauty AI E-Commerce Platform', 'AI Esthetician Shopping Assistant', 'Launch Skincare Store in Hours'], monthlySearches: '16,500 / mo', intent: 'Transactional' },
    ],
    backlinks: [
      { title: 'SilarAI AI Shopping Assistant', anchorText: 'AI Shopping Assistant for Skincare & Beauty', url: '/ai-shopping-assistant', targetContext: 'Conversational consultation and routine building.', type: 'Internal Product' },
    ],
    faqList: [
      { question: 'Does the AI know which skincare ingredients should not be mixed?', answer: 'Yes! The AI understands contraindications like pairing high-concentration AHAs/BHAs with pure Retinol.' },
    ],
  },
  'food-packaging': {
    slug: 'food-packaging',
    name: 'Food, Gourmet & Packaging',
    tag: 'Perishable',
    badge: 'Specialty Foods, Bakery & Packaging',
    icon: Package,
    headline: 'Launch a Specialty Food & Packaging Store in Hours',
    subheadline:
      'Manage perishable dates, dietary allergens, bulk packaging tiers, and temperature-controlled shipping effortlessly with AI commerce automation.',
    primaryStats: [
      { label: 'Launch Speed', value: '3 Hours', helper: 'pre-configured food specs' },
      { label: 'Bulk Order Volume', value: '+48%', helper: 'case-pack volume tiering' },
      { label: 'Allergen Inquiries', value: '100% Automated', helper: 'instant dietary safety checks' },
      { label: 'WhatsApp Reorders', value: '4.2x', helper: 'repeat consumable orders' },
    ],
    launchInHoursTitle: 'Launch Your Food & Packaging Store in 3 Hours',
    launchHoursSubtitle: 'Handle nutrition facts, case packs, and local delivery zones out of the box.',
    launchTimeline: [
      { hour: 'Hour 01', title: 'Nutritional & Packaging Spec Upload', description: 'Upload allergen tags (Gluten-Free, Nut-Free, Halal, Vegan), shelf-life specs, and box dimensions.', highlights: ['Dietary filters', 'Case/Pallet tiers', 'Nutrition facts breakdown'] },
      { hour: 'Hour 02', title: 'Gourmet Storefront & Custom Delivery Windows', description: 'Set up regional delivery schedules, cold-pack shipping fees, and custom domain with free SSL.', highlights: ['Delivery slot picker', 'Cold-chain logic', 'Custom domain ready'] },
      { hour: 'Hour 03', title: 'Dual Consumer & Restaurant Wholesale Tiers', description: 'Offer single-pack retail to consumers and case-pack wholesale discounts to cafes and restaurants.', highlights: ['Restaurant buyer tier', 'Case discount matrices', 'Invoicing on delivery'] },
      { hour: 'Hour 04', title: 'AI Culinary & Allergen Assistant Go-Live', description: 'Deploy the assistant to answer recipe pairings, ingredient origin queries, and bulk catering quotes.', highlights: ['Allergen validation', 'Recipe pairings', 'WhatsApp order desk'] },
    ],
    comparisonRows: [
      { dimension: 'Time to Market', traditional: '3 to 5 months', silarAi: '3 hours', advantage: 'Instant setup' },
      { dimension: 'Perishable & Case Management', traditional: 'Requires multiple custom plugins', silarAi: 'Native dietary & case-tier architecture', advantage: 'Unified control' },
    ],
    existingStoreAssistant: {
      badge: 'Food AI for Existing Stores',
      title: 'Embed AI Culinary Assistant on Existing Store',
      description: 'Works with your Shopify or WooCommerce food store to answer dietary, shipping, and pairing questions.',
      embedCode: `<script src="https://cdn.silarai.com/assistant.js" data-store-id="food_packaging_live" async></script>`,
      keyBenefits: [
        { title: 'Zero-Hesitation Allergen Answers', desc: 'Instantly verifies dairy, nut, gluten, and soy cross-contamination statements.', icon: ShieldCheck },
        { title: 'Bulk Catering & Case Calculations', desc: 'Calculates how many cases are needed for a 150-guest event automatically.', icon: Package },
      ],
      simulatedChat: [
        {
          userQuery: 'Is your Artisan Sourdough vegan, and can you ship 10 loaves to Chicago by Thursday?',
          aiResponse: 'Yes! Our Artisan Sourdough is 100% naturally leavened vegan (flour, water, sea salt). For delivery by Thursday to Chicago, select our 2-Day Cold Express option before 2 PM CST.',
        },
      ],
    },
    b2b2cCapabilities: [
      { title: 'Cafe & Commercial Wholesale Accounts', description: 'Enable bakeries, coffee shops, and catering firms to order bulk supplies with weekly recurring delivery.', tag: 'Foodservice B2B' },
    ],
    seoKeywords: [
      { group: 'Food Commerce Keywords', keywords: ['Food AI E-Commerce Platform', 'Gourmet Food Storefront Builder', 'Packaging Bulk Order Platform'], monthlySearches: '7,400 / mo', intent: 'Transactional' },
    ],
    backlinks: [
      { title: 'SilarAI AI Shopping Assistant', anchorText: 'AI Shopping Assistant for Gourmet Food', url: '/ai-shopping-assistant', targetContext: 'Allergen verification and culinary pairing.', type: 'Internal Product' },
    ],
    faqList: [
      { question: 'Can customers schedule specific delivery days for fresh items?', answer: 'Yes, SilarAI includes native delivery date and time slot pickers.' },
    ],
  },
  handicrafts: {
    slug: 'handicrafts',
    name: "Handicraft's & Artisanal Goods",
    tag: 'Artisanal',
    badge: 'Handmade, Heritage & Crafts',
    icon: Palette,
    headline: 'Launch an Artisanal Craft & Heritage Store in Hours',
    subheadline:
      'Showcase the human story, materials, and master craftsmanship behind every handmade piece with an AI Heritage Storyteller assistant.',
    primaryStats: [
      { label: 'Story Engagement', value: '4.8 min', helper: 'average session length' },
      { label: 'Global Sales', value: '+52%', helper: 'multi-currency & multi-language AI' },
      { label: 'Launch Speed', value: '2.5 Hours', helper: 'turnkey craft storefront' },
      { label: 'Custom Commission Uplift', value: '+40%', helper: 'bespoke craft orders' },
    ],
    launchInHoursTitle: 'Launch Your Artisanal Store in 2.5 Hours',
    launchHoursSubtitle: 'Bring regional crafts to global markets with built-in multi-currency and storytelling.',
    launchTimeline: [
      { hour: 'Hour 01', title: 'Artisan Profiles & Material Specs', description: 'Upload origin stories, wood/ceramic/textile craft types, and care instructions.', highlights: ['Artisan bio spotlight', 'Natural materials specs', 'Care instruction sheets'] },
      { hour: 'Hour 02', title: 'Story-Driven Visual Gallery & Domain', description: 'Set up warm earthy aesthetics, high-res texture photography, and connect your brand domain.', highlights: ['Heritage visual layout', 'Instant SSL', 'Multi-currency ready'] },
      { hour: 'Hour 03', title: 'Bespoke Custom Orders & WhatsApp Sync', description: 'Enable custom sizing requests, personalization notes, and direct WhatsApp buyer chat.', highlights: ['Custom personalization notes', 'WhatsApp artisan chat', 'Lead capture'] },
      { hour: 'Hour 04', title: 'AI Heritage Storyteller Go-Live', description: 'Train assistant on craftsmanship history, weaving traditions, and global shipping policies.', highlights: ['Craft storytelling', '20+ language support', 'Worldwide shipping advice'] },
    ],
    comparisonRows: [
      { dimension: 'Time to Market', traditional: '3 to 4 months', silarAi: '2.5 hours', advantage: 'Launch immediately' },
      { dimension: 'Storytelling Depth', traditional: 'Flat static product text that misses the emotional craft value', silarAi: 'Interactive AI storyteller explaining origin, technique, and artisan impact', advantage: 'Higher emotional connection' },
    ],
    existingStoreAssistant: {
      badge: 'Artisanal AI Assistant',
      title: 'Embed an AI Storyteller on Your Existing Craft Store',
      description: 'Add storytelling and custom commission inquiries to your existing Etsy-connected or Shopify site.',
      embedCode: `<script src="https://cdn.silarai.com/assistant.js" data-store-id="artisan_craft_live" async></script>`,
      keyBenefits: [
        { title: 'Provenance & Craft Storytelling', desc: 'Explains the ancient woodworking or hand-loom techniques used to create each piece.', icon: Palette },
        { title: 'Custom Engraving & Personalization', desc: 'Captures personalized gift messages and custom dimensional requests effortlessly.', icon: MessageCircle },
      ],
      simulatedChat: [
        {
          userQuery: 'Is this hand-thrown ceramic bowl food-safe and dishwasher-safe?',
          aiResponse: 'Yes! It is crafted using local stoneware clay and fired at 1,220°C with non-toxic, lead-free natural glazes. It is 100% food-safe and microwave/dishwasher friendly.',
        },
      ],
    },
    b2b2cCapabilities: [
      { title: 'Fair Trade & Museum Gift Shop Wholesale', description: 'Sell one-of-a-kind handmade collections to museum shops, luxury boutique hotels, and ethical retailers.', tag: 'Fair Trade Wholesale' },
    ],
    seoKeywords: [
      { group: 'Handicraft Keywords', keywords: ['Handicrafts AI E-Commerce Platform', 'Artisanal Craft Storefront Builder', 'Handmade Goods Online Store in Hours'], monthlySearches: '6,200 / mo', intent: 'Transactional' },
    ],
    backlinks: [
      { title: 'SilarAI AI Shopping Assistant', anchorText: 'AI Shopping Assistant for Artisans', url: '/ai-shopping-assistant', targetContext: 'Heritage storytelling and multi-lingual global sales.', type: 'Internal Product' },
    ],
    faqList: [
      { question: 'Does SilarAI support one-of-a-kind unique inventory items?', answer: 'Yes! SilarAI supports unique 1-of-1 inventory with automatic marking as sold when purchased.' },
    ],
  },
  'cosmetic-wellness': {
    slug: 'cosmetic-wellness',
    name: 'Cosmetic & Wellness',
    tag: 'Personal Care',
    badge: 'Supplements, Wellness & Holistic Care',
    icon: Sparkles,
    headline: 'Launch a High-Trust Wellness & Cosmetic Store in Hours',
    subheadline:
      'Demystify supplement facts, organic certifications, and wellness regimens with an AI Health & Wellness Guide that guides customers to compliant products.',
    primaryStats: [
      { label: 'Subscription Adoption', value: '44%', helper: 'monthly recurring orders' },
      { label: 'Regimen Adherence', value: '+35%', helper: 'automated WhatsApp reminders' },
      { label: 'Launch Speed', value: '3 Hours', helper: 'compliant wellness templates' },
      { label: 'Customer Trust Rating', value: '4.9/5', helper: 'evidence-backed product guidance' },
    ],
    launchInHoursTitle: 'Launch Your Wellness Brand in 3 Hours',
    launchHoursSubtitle: 'Deliver evidence-backed consultations and automated replenishment without custom coding.',
    launchTimeline: [
      { hour: 'Hour 01', title: 'Supplement Facts & Certification Setup', description: 'Upload dosage guidelines, organic/GMP certifications, lab testing certificates, and contraindication notes.', highlights: ['GMP cert tags', 'Dosage matrix', 'Allergen disclosures'] },
      { hour: 'Hour 02', title: 'Serene Wellness Storefront & Domain Sync', description: 'Configure soothing visual theme, transparency labels, batch lookup tools, and custom domain.', highlights: ['Batch COA viewer', 'Clean layout', 'Instant SSL'] },
      { hour: 'Hour 03', title: 'Recurring Monthly Subscriptions & Bundling', description: 'Offer 15% off auto-delivery subscriptions and build customized wellness bundle stacks.', highlights: ['Auto-replenishment', 'Custom wellness bundles', 'Loyalty points'] },
      { hour: 'Hour 04', title: 'AI Wellness Guide Assistant Go-Live', description: 'Deploy the assistant to conduct lifestyle assessments and recommend synergistic supplement stacks.', highlights: ['Regimen builder', 'Safety disclosures', 'WhatsApp refill prompts'] },
    ],
    comparisonRows: [
      { dimension: 'Time to Market', traditional: '3 to 5 months', silarAi: '3 hours', advantage: 'Launch today' },
      { dimension: 'Compliance Guidance', traditional: 'Manual FAQ pages with static text', silarAi: 'Real-time AI assistant providing accurate, disclaimed health wellness guidance', advantage: 'Reduced liability' },
    ],
    existingStoreAssistant: {
      badge: 'Wellness AI Assistant',
      title: 'Embed AI Wellness Guide on Existing Store',
      description: 'Works with your current Shopify, WooCommerce, or Magento wellness store in 1 line of script.',
      embedCode: `<script src="https://cdn.silarai.com/assistant.js" data-store-id="wellness_live" async></script>`,
      keyBenefits: [
        { title: 'Synergistic Stacking Advice', desc: 'Recommends morning and evening routines (e.g., Magnesium Glycinate before sleep).', icon: Sparkles },
        { title: 'Dosage & Consumption Guidance', desc: 'Explains best practices (with meals, empty stomach) clearly.', icon: HelpCircle },
      ],
      simulatedChat: [
        {
          userQuery: 'What should I take for sustained daytime energy without jitters or sleep disruption?',
          aiResponse: 'Our Organic Ashwagandha & Cordyceps Adaptogen Blend is designed for balanced daytime stamina. It supports healthy cortisol levels without caffeine. Pair with Vitamin B-Complex with breakfast.',
        },
      ],
    },
    b2b2cCapabilities: [
      { title: 'Practitioner & Clinic Wholesale Portal', description: 'Allow naturopaths, chiropractors, and gyms to order practitioner-grade stock at trade pricing.', tag: 'Practitioner B2B' },
    ],
    seoKeywords: [
      { group: 'Wellness Commerce Keywords', keywords: ['Wellness AI E-Commerce Platform', 'Supplement Storefront Builder', 'AI Wellness Shopping Assistant'], monthlySearches: '13,100 / mo', intent: 'Transactional' },
    ],
    backlinks: [
      { title: 'SilarAI AI Shopping Assistant', anchorText: 'AI Shopping Assistant for Wellness Brands', url: '/ai-shopping-assistant', targetContext: 'Conversational regimen recommendations.', type: 'Internal Product' },
    ],
    faqList: [
      { question: 'Does SilarAI display regulatory disclaimers automatically?', answer: 'Yes! The AI includes standard FDA/dietary supplement disclaimers on health-related queries.' },
    ],
  },
  'small-medium-fmcg': {
    slug: 'small-medium-fmcg',
    name: 'Small & Medium FMCG',
    tag: 'Manufacturers',
    badge: 'Packaged Goods & Regional Brands',
    icon: Factory,
    headline: 'Launch a Direct-to-Consumer & Retailer FMCG Portal in Hours',
    subheadline:
      'Bypass distributor margins. Sell direct to supermarkets, regional grocery stores, and households with automated tiered pricing, MOQ tracking, and delivery logistics.',
    primaryStats: [
      { label: 'Gross Margin Expansion', value: '+28%', helper: 'direct retail distributor bypass' },
      { label: 'Order Processing Speed', value: '4x', helper: 'automated digital PO entry' },
      { label: 'Launch Speed', value: '4 Hours', helper: 'turnkey FMCG platform' },
      { label: 'Retail Reorder Rate', value: '58%', helper: 'WhatsApp grocery store reordering' },
    ],
    launchInHoursTitle: 'Launch Your FMCG Commerce Portal in 4 Hours',
    launchHoursSubtitle: 'Unify wholesale store delivery and consumer direct sales without multi-month SAP overhauls.',
    launchTimeline: [
      { hour: 'Hour 01', title: 'Master SKU & Pallet Matrix Import', description: 'Upload retail single units, master cases (6/12/24 packs), and pallet quantities with tiered volume discounts.', highlights: ['Master carton specs', 'Pallet tiering', 'Batch/Lot code tracking'] },
      { hour: 'Hour 02', title: 'Regional FMCG Storefront & Domain Setup', description: 'Configure consumer pantry store and dealer wholesale order portal on your brand domain.', highlights: ['Dual catalog display', 'Regional depot selector', 'Instant SSL'] },
      { hour: 'Hour 03', title: 'Credit Terms, PO Checkout & Tax Invoices', description: 'Set Net-30 terms for verified grocery retailers and instant card checkout for retail consumers.', highlights: ['Net-30 trade credit', 'Digital PO uploads', 'Automated GST/VAT invoices'] },
      { hour: 'Hour 04', title: 'AI FMCG Reorder Bot Deployment', description: 'Deploy WhatsApp AI bot to remind retail store owners to restock before weekend surges.', highlights: ['Automated reorder prompts', 'Route optimization quotes', 'Fast 1-click reorder links'] },
    ],
    comparisonRows: [
      { dimension: 'Time to Market', traditional: '6 to 9 months with traditional ERP consultants', silarAi: 'Under 4 hours with SilarAI turnkey FMCG engine', advantage: 'Save 6+ months' },
      { dimension: 'Direct Retail Access', traditional: 'Dependent on legacy distributors taking 30-40% cut', silarAi: 'Direct self-service ordering for grocery stores & consumers', advantage: 'Recover 30%+ gross margin' },
    ],
    existingStoreAssistant: {
      badge: 'FMCG AI Assistant',
      title: 'Embed FMCG Trade Assistant on Existing Website',
      description: 'Add wholesale case-pack calculation and store replenishment ordering to your current site.',
      embedCode: `<script src="https://cdn.silarai.com/assistant.js" data-store-id="fmcg_live" async></script>`,
      keyBenefits: [
        { title: 'Case Pack & Pallet Volume Math', desc: 'Instantly calculates volume discounts: "How many cases for Tier-3 pricing?"', icon: Boxes },
        { title: 'Retailer Restock via WhatsApp', desc: 'Store owners snap photos of empty shelves and reorder in 10 seconds.', icon: MessageCircle },
      ],
      simulatedChat: [
        {
          userQuery: 'We operate 4 organic grocery outlets. What is the pallet pricing for the Cold-Pressed Juices?',
          aiResponse: 'Welcome! For verified regional grocer accounts, Pallet Tier-1 pricing is $1.85/bottle ($44.40 per 24-pack case, minimum 2 pallets). Total for 2 pallets (120 cases): $5,328.00 with free refrigerated delivery.',
        },
      ],
    },
    b2b2cCapabilities: [
      { title: 'Retailer Storefront + Direct Household Pantry', description: 'Empower everyday families to buy multi-packs direct while grocers order pallet inventory.', tag: 'Direct FMCG' },
    ],
    seoKeywords: [
      { group: 'FMCG Keywords', keywords: ['FMCG AI E-Commerce Platform', 'Direct to Store Delivery Software', 'Small FMCG Wholesale Portal in Hours'], monthlySearches: '10,800 / mo', intent: 'Transactional' },
    ],
    backlinks: [
      { title: 'SilarAI FMCG Industry Solutions', anchorText: 'FMCG & CPG AI Commerce Platform', url: '/fmcg-commerce', targetContext: 'Dedicated FMCG direct-to-retailer ordering.', type: 'Industry Hub' },
    ],
    faqList: [
      { question: 'Does SilarAI integrate with existing ERPs like Tally, SAP, or QuickBooks?', answer: 'Yes! SilarAI provides bidirectional REST APIs and CSV batch sync for ERPs.' },
    ],
  },
  distributors: {
    slug: 'distributors',
    name: 'Distributors & Trade Hubs',
    tag: 'Supply Hub',
    badge: 'Multi-Brand Wholesale Distribution',
    icon: Truck,
    headline: 'Launch an Intelligent B2B Distributor Portal in Hours',
    subheadline:
      'Digitize thousands of manufacturer SKUs. Give dealer networks self-service pricing, live warehouse stock levels, automated RFQs, and Net-30 checkout.',
    primaryStats: [
      { label: 'Order Entry Errors', value: '-85%', helper: 'self-service dealer ordering' },
      { label: 'Quote Turnaround', value: '< 2 min', helper: 'vs 48 hours manual sales desk' },
      { label: 'Launch Speed', value: '4 Hours', helper: 'bulk CSV & matrix import' },
      { label: 'Sales Rep Productivity', value: '3.2x', helper: 'reps focus on new accounts' },
    ],
    launchInHoursTitle: 'Launch Your B2B Distribution Hub in 4 Hours',
    launchHoursSubtitle: 'Replace slow phone and fax order entry with an automated cloud dealer portal.',
    launchTimeline: [
      { hour: 'Hour 01', title: '50,000+ SKU Catalog & Tier Mapping', description: 'Bulk upload massive inventories with technical spec sheets, dealer tiers, and cross-reference numbers.', highlights: ['Cross-reference search', 'Tier-based price rules', 'Real-time ATP inventory'] },
      { hour: 'Hour 02', title: 'Private Dealer Portal & Domain Link', description: 'Deploy password-protected wholesale portal with sub-account permissions and tax exemption verification.', highlights: ['Dealer account approvals', 'Multi-user company logins', 'Custom domain ready'] },
      { hour: 'Hour 03', title: 'Credit Terms & PO Invoice Automation', description: 'Assign credit limits (e.g. $50,000 Net-60) per dealer and enable PDF purchase order uploads.', highlights: ['Net 30/60/90 credit lines', 'Automatic PO reconciliation', 'Freight LTL calculator'] },
      { hour: 'Hour 04', title: 'AI Technical Part Finder & RFQ Bot', description: 'Train AI on OEM spec sheets to answer replacement part queries and generate instant formal quotes.', highlights: ['Sub-second part matching', 'Automated PDF RFQ quotes', 'Quick CSV order upload'] },
    ],
    comparisonRows: [
      { dimension: 'Time to Market', traditional: '6 to 12 months with legacy B2B software vendors', silarAi: 'Under 4 hours with SilarAI turn-key distribution platform', advantage: 'Launch this week' },
      { dimension: 'Cost', traditional: '$75,000 – $200,000 initial implementation costs', silarAi: 'Predictable monthly subscription with zero upfront fees', advantage: 'Save $100k+' },
    ],
    existingStoreAssistant: {
      badge: 'Distributor AI Assistant',
      title: 'Embed Technical Part Finder on Existing Website',
      description: 'Works with your existing distributor website to cross-reference parts and generate quotes 24/7.',
      embedCode: `<script src="https://cdn.silarai.com/assistant.js" data-store-id="distributor_hub_live" async></script>`,
      keyBenefits: [
        { title: 'Technical Part Number Cross-Reference', desc: 'Finds replacement valves, motors, or fittings across hundreds of manufacturers.', icon: Search },
        { title: 'Instant B2B RFQ Generator', desc: 'Generates downloadable formal digital quotes with payment terms in under 30 seconds.', icon: Zap },
      ],
      simulatedChat: [
        {
          userQuery: 'Do you have an OEM replacement for Parker Hannifin 2-inch hydraulic check valve rated at 3000 PSI?',
          aiResponse: 'Yes! We have 42 units of Apex Heavy-Duty Check Valve (SKU: APX-CV200-3K) in stock at the Atlanta hub. It is 100% form, fit, and function identical to Parker specs. Dealer Price: $164.00 (List $240.00).',
        },
      ],
    },
    b2b2cCapabilities: [
      { title: 'Dealer Network Portal + Contractor Direct Ordering', description: 'Enable contracted dealers to manage trade accounts while commercial buyers submit orders directly.', tag: 'Distribution Hub' },
    ],
    seoKeywords: [
      { group: 'Distributor Keywords', keywords: ['B2B Distributor E-Commerce Platform', 'Dealer Portal Software in Hours', 'Wholesale Technical Product Search'], monthlySearches: '12,500 / mo', intent: 'Transactional' },
    ],
    backlinks: [
      { title: 'SilarAI Distributors Industry Hub', anchorText: 'Distributor AI Commerce Solutions', url: '/industries/distributors', targetContext: 'Explore dealer portals and RFQ automation for distributors.', type: 'Industry Hub' },
    ],
    faqList: [
      { question: 'Can dealers upload CSV spreadsheets to place 100-line orders?', answer: 'Yes! Dealers simply upload a spreadsheet with SKU and Quantity for instant 1-click cart checkout.' },
    ],
  },
  wholesalers: {
    slug: 'wholesalers',
    name: 'Wholesalers & Cash & Carry',
    tag: 'Bulk Orders',
    badge: 'High-Volume Bulk Wholesale',
    icon: Boxes,
    headline: 'Launch a High-Volume B2B Wholesale Portal in 3 Hours',
    subheadline:
      'Scale bulk reorders, truckload pricing, and volume tiers with zero sales rep friction. Provide wholesale buyers with instant digital invoicing, Net terms, and WhatsApp reordering.',
    primaryStats: [
      { label: 'Reorder Turnaround', value: '60 Seconds', helper: '1-click repeat wholesale orders' },
      { label: 'Unpaid Invoices', value: '-65%', helper: 'automated digital payment reminders' },
      { label: 'Launch Speed', value: '3 Hours', helper: 'turnkey wholesale architecture' },
      { label: 'Average Wholesale Order', value: '$3,840', helper: 'automated tiered volume incentives' },
    ],
    launchInHoursTitle: 'Launch Your Wholesale Portal in 3 Hours',
    launchHoursSubtitle: 'Modernize bulk trading and cash-and-carry operations without enterprise IT complexity.',
    launchTimeline: [
      { hour: 'Hour 01', title: 'Bulk Tier Matrix & Minimum Order Quantity (MOQ)', description: 'Set minimum quantities, tiered carton discounts, and shipping freight classes.', highlights: ['Tiered volume rules', 'MOQ enforcement', 'Multi-currency invoicing'] },
      { hour: 'Hour 02', title: 'Private Wholesale Storefront & Tax ID Sync', description: 'Launch branded portal requiring resale certificate upload for buyer verification.', highlights: ['Resale tax exemption', 'Instant trade validation', 'Custom domain ready'] },
      { hour: 'Hour 03', title: 'Net Payment Terms & Invoicing Gateway', description: 'Enable Net-15/30/60 terms, direct wire instructions, and credit card payments with fee passing.', highlights: ['ACH / Wire instructions', 'Automated PDF statements', 'Credit limits'] },
      { hour: 'Hour 04', title: 'AI Wholesale Desk & WhatsApp Ordering', description: 'Deploy AI assistant to take recurring bulk orders over WhatsApp or web chat 24/7.', highlights: ['WhatsApp reorder links', 'Truckload quotes', '24/7 trade coverage'] },
    ],
    comparisonRows: [
      { dimension: 'Time to Market', traditional: '6+ months custom B2B build', silarAi: 'Under 3 hours with SilarAI', advantage: 'Immediate deployment' },
      { dimension: 'Reorder Speed', traditional: 'Manual phone calls and handwritten invoices', silarAi: '1-click historical reorders and WhatsApp buy buttons', advantage: '3x higher order frequency' },
    ],
    existingStoreAssistant: {
      badge: 'Wholesale AI Assistant',
      title: 'Embed Wholesale Assistant on Existing Store',
      description: 'Add wholesale bulk pricing and digital RFQ quoting to your existing website in 1 line of code.',
      embedCode: `<script src="https://cdn.silarai.com/assistant.js" data-store-id="wholesale_live" async></script>`,
      keyBenefits: [
        { title: 'Tiered Bulk Price Calculation', desc: 'Shows price breaks instantly: "Order 50+ cases for $14/case (save 22%)."', icon: TrendingUp },
        { title: 'Instant Credit Status Lookup', desc: 'Authorized buyers can check remaining Net-30 credit and open balances in chat.', icon: ShieldCheck },
      ],
      simulatedChat: [
        {
          userQuery: 'Can I reorder the same 20 cartons of Eco-Kraft Bags from last month, and charge to our Net-30 account?',
          aiResponse: 'Welcome back, Atlas Packaging! I found your previous order #AP-8842 for 20 cartons of Eco-Kraft Bags (Size L). Your available Net-30 credit line is $14,200. Would you like me to generate order #AP-9104 for $1,280.00 to dispatch tomorrow?',
        },
      ],
    },
    b2b2cCapabilities: [
      { title: 'Bulk Wholesale + Consumer Direct Sample Packs', description: 'Allow trade buyers to order container loads while offering sample packs to prospective buyers.', tag: 'Sample to Bulk' },
    ],
    seoKeywords: [
      { group: 'Wholesale Keywords', keywords: ['Wholesale AI E-Commerce Platform', 'Bulk B2B Ordering Portal in Hours', 'Wholesale Net Terms Software'], monthlySearches: '14,000 / mo', intent: 'Transactional' },
    ],
    backlinks: [
      { title: 'SilarAI Wholesalers Industry Hub', anchorText: 'Wholesale Commerce & Cash & Carry Software', url: '/industries/wholesalers', targetContext: 'Deep dive into high-volume wholesale operations.', type: 'Industry Hub' },
    ],
    faqList: [
      { question: 'Can we set different minimum order quantities (MOQs) for different products?', answer: 'Yes! You can configure item-level MOQs, category MOQs, and order total minimums per customer tier.' },
    ],
  },
};
