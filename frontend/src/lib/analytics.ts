/**
 * Silarai Analytics — thin wrapper around GA4 gtag
 *
 * Usage:
 *   import { track } from '../lib/analytics';
 *   track.ctaClick('hero_start_free');
 */

declare function gtag(...args: unknown[]): void;

function send(eventName: string, params?: Record<string, unknown>) {
  try {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, params);
    }
  } catch (_) {
    // never crash the UI over analytics
  }
}

/** Track a page view — call this on every route change */
export function trackPageView(path: string, title?: string) {
  send('page_view', { page_path: path, page_title: title ?? document.title });
}

export const track = {
  // ── Landing page CTAs ────────────────────────────────────────────────────
  /** "Start free" / "Create your store" button clicks */
  ctaClick: (location: string) =>
    send('cta_click', { cta_location: location }),

  /** "Book a demo" WhatsApp link clicks */
  demoClick: (location: string) =>
    send('demo_click', { cta_location: location }),

  /** Live demo store card clicks */
  demoStoreView: (storeName: string) =>
    send('demo_store_view', { store_name: storeName }),

  /** Demo dashboard login link click */
  demoLoginClick: (storeName: string) =>
    send('demo_login_click', { store_name: storeName }),

  // ── Auth funnel ──────────────────────────────────────────────────────────
  /** User lands on /register */
  registerPageView: () =>
    send('register_page_view'),

  /** User submits the registration form */
  registerSubmit: () =>
    send('sign_up', { method: 'email' }),

  /** Registration succeeded */
  registerSuccess: () =>
    send('register_success'),

  /** User logs in */
  loginSuccess: () =>
    send('login', { method: 'email' }),

  // ── Pricing & upgrade ────────────────────────────────────────────────────
  /** Pricing page viewed */
  pricingView: () =>
    send('pricing_page_view'),

  /** Upgrade / plan selected */
  planSelect: (planName: string) =>
    send('plan_select', { plan_name: planName }),

  // ── Custom domain ────────────────────────────────────────────────────────
  /** Custom domain section CTA clicked */
  customDomainCta: () =>
    send('custom_domain_cta'),

  // ── Language ─────────────────────────────────────────────────────────────
  languageSwitch: (lang: string) =>
    send('language_switch', { language: lang }),
};

