import axios from 'axios';
import apiClient from './client';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export interface HeroContent {
  badge: string;
  headline: string;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export interface StatItem       { value: string; label: string; }
export interface FeatureItem    { icon: string;  title: string; description: string; }
export interface StepItem       { step: string;  title: string; description: string; }
export interface TestimonialItem { name: string; business: string; quote: string; avatar: string; }
export interface CtaBannerContent { headline: string; subtext: string; ctaText: string; }

export interface LandingPageContent {
  hero:         HeroContent;
  stats:        StatItem[];
  features:     FeatureItem[];
  howItWorks:   StepItem[];
  testimonials: TestimonialItem[];
  ctaBanner:    CtaBannerContent;
}

export const DEFAULT_CONTENT: LandingPageContent = {
  hero: {
    badge:        '🚀 Trusted by 500+ sellers across India',
    headline:     'Turn WhatsApp Chats Into Orders',
    subheadline:  'ReplyCart is the all-in-one platform for social sellers — manage leads, orders, products and marketing from a single dashboard.',
    ctaPrimary:   'Start for Free',
    ctaSecondary: 'View Pricing',
  },
  stats: [
    { value: '500+',    label: 'Active Sellers' },
    { value: '50,000+', label: 'Orders Managed' },
    { value: '₹2 Cr+',  label: 'Revenue Tracked' },
    { value: '4.9★',    label: 'Average Rating' },
  ],
  features: [
    { icon: 'MessageSquareQuote', title: 'AI-Powered Replies',    description: 'Generate perfect WhatsApp replies in seconds using AI trained on your catalog and tone.' },
    { icon: 'ShoppingBag',        title: 'Order Management',       description: 'Create, track and fulfill orders with status updates, timelines and printable invoices.' },
    { icon: 'Package',            title: 'Product Catalog',        description: 'Manage products, variants, categories, pricing and stock all in one clean dashboard.' },
    { icon: 'BarChart2',          title: 'Sales Analytics',        description: 'See your revenue trends, top products and customer insights at a glance.' },
    { icon: 'Send',               title: 'Marketing Campaigns',    description: 'Send targeted WhatsApp broadcasts and recover abandoned carts automatically.' },
    { icon: 'Store',              title: 'Instant Storefront',     description: 'Get a beautiful shareable store page with QR code — ready in under 5 minutes.' },
  ],
  howItWorks: [
    { step: '1', title: 'Set up your store',        description: 'Sign up, add your products with photos and pricing. Your shareable store link is ready instantly.' },
    { step: '2', title: 'Share & receive orders',   description: 'Share your store link on WhatsApp or Instagram. Customers browse, add to cart and send inquiries.' },
    { step: '3', title: 'Manage everything in one place', description: 'Convert inquiries to orders, track delivery, send campaigns and grow — all from one dashboard.' },
  ],
  testimonials: [
    { name: "Priya Sharma", business: "Priya's Sarees, Mumbai", quote: "ReplyCart helped me manage 10x more orders without hiring extra staff. It's honestly a game changer for my boutique.", avatar: 'P' },
    { name: "Rahul Mehta",  business: "FreshBites Co., Pune",   quote: "The AI reply feature saves me 2 hours every single day. My customers love the fast, personalised responses.",         avatar: 'R' },
    { name: "Anjali Patel", business: "Craft House, Surat",      quote: "Finally a tool built for Indian sellers. The WhatsApp integration and storefront are exactly what I needed.",          avatar: 'A' },
  ],
  ctaBanner: {
    headline: 'Ready to grow your business?',
    subtext:  'Join 500+ sellers already using ReplyCart. Free plan available — no credit card required.',
    ctaText:  'Get Started Free',
  },
};

export const landingApi = {
  getContent: (): Promise<LandingPageContent> =>
    axios.get(`${BASE_URL}/public/landing-content`)
      .then(r => {
        try {
          const parsed = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
          return { ...DEFAULT_CONTENT, ...parsed };
        } catch {
          return DEFAULT_CONTENT;
        }
      })
      .catch(() => DEFAULT_CONTENT),

  updateContent: (content: LandingPageContent) =>
    apiClient.put('/admin/landing-content', { contentJson: JSON.stringify(content) }),
};
