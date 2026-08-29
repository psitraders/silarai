export type D2cPageId = 1 | 2 | 3;

export interface IntegrationTool {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'Live Deployed' | 'Ready' | 'Real-time Sync' | 'Native' | string;
  logoSvg?: string;
  badge?: string;
}

export interface ProblemCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  beforeText: string;
  silarAiAdvantage: string;
}

export interface FeatureCategory {
  category: string;
  items: string[];
}

export interface ProductDetail {
  id: string;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  features: string[];
  featureCategories?: FeatureCategory[];
  buttonText: string;
  highlightStat: string;
}

export interface HowItWorksStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  icon: string;
  detailText: string;
}

export interface DashboardFeatureItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  metricsText: string;
}

export interface AiStudioPreset {
  id: string;
  title: string;
  prompt: string;
  industry: string;
  featuresGenerated: string[];
}

export interface IndustrySolution {
  id: string;
  title: string;
  headline: string;
  description: string;
  icon: string;
  stat: string;
  statLabel: string;
  keyCapability: string;
  challenges: string[];
  howSilarAiHelps: string[];
  idealFor: string[];
  benefits: string[];
  productsUsed: string[];
  customModules?: {
    title: string;
    desc: string;
    icon?: string;
  }[];
}

export interface ComparisonRow {
  feature: string;
  traditional: string;
  silarAi: string;
}

export interface KpiMetric {
  value: string;
  label: string;
  subtext: string;
  growth: string;
}

export interface UseCaseItem {
  id: string;
  slug: string; // e.g. 'sales-assistant'
  url: string; // e.g. '/use-cases/sales-assistant'
  title: string;
  header: string;
  seoKeywords: string[];
  overview: string;
  geoSummary?: string;
  challenges: string[];
  howSilarAiHelps: string[];
  businessOutcomes: string[];
  products: string[];
  ctaText: string;
  iconName: string;
  faqItems?: { question: string; answer: string }[];
  keyMetrics?: { label: string; value: string }[];
}

export interface CustomerTestimonial {
  id: string;
  companyName: string;
  companyCategory: string;
  quote: string;
  authorName: string;
  authorTitle: string;
  verifiedImpact: string;
  rating: number;
  avatarUrl?: string;
}

export interface FaqAccordionItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Integration' | 'B2B & Catalog' | 'Setup';
}

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number | string;
  priceAnnual?: number;
  skuLimit?: string;
  orderLimit?: string;
  conversationLimit?: string;
  featuresHeader?: string;
  features: string[];
  termsSummary?: string;
  notIncluded?: string[];
  isPopular?: boolean;
  ctaText: string;
}

export interface ProductPricingData {
  id: 'shopping-assistant' | 'commerce-platform';
  title: string;
  subtitle: string;
  description: string;
  supportedPlatforms?: string[];
  plans: PricingPlan[];
}
