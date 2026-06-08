import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, Suspense } from 'react';
import { useAuthStore } from './store/auth.store';
import { useThemeStore, applyTheme, THEMES } from './store/theme.store';
import { PageLoader } from './components/ui/Spinner';
import axios from 'axios';

// -- Always-eager: public storefront (no auth required, first-paint critical) --
import { PublicStorefrontPage } from './pages/storefront/PublicStorefrontPage';
import { OrderConfirmationPage } from './pages/storefront/OrderConfirmationPage';
import { StorefrontCustomPage } from './pages/storefront/StorefrontCustomPage';
import { CartProvider } from './context/CartContext';

// Analytics
import { trackPageView } from './lib/analytics';
import { ScrollToTop } from './components/ScrollToTop';

// -- Lazy: layout shell (only needed when authenticated) -----------------------
const AppShell = React.lazy(() =>
  import('./components/layout/AppShell').then(m => ({ default: m.AppShell }))
);

// -- Lazy: auth pages ----------------------------------------------------------
const LoginPage           = React.lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage        = React.lazy(() => import('./pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage  = React.lazy(() => import('./pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage   = React.lazy(() => import('./pages/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage     = React.lazy(() => import('./pages/auth/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));

// -- Lazy: landing / legal / public marketing ----------------------------------
const LandingPage   = React.lazy(() => import('./pages/landing/LandingPage'));
const PricingPage   = React.lazy(() => import('./pages/subscription/PricingPage').then(m => ({ default: m.PricingPage })));
const AboutPage     = React.lazy(() => import('./pages/landing/AboutPage').then(m => ({ default: m.AboutPage })));
const BlogPage      = React.lazy(() => import('./pages/landing/BlogPage').then(m => ({ default: m.BlogPage })));
const ContactPage   = React.lazy(() => import('./pages/landing/ContactPage').then(m => ({ default: m.ContactPage })));
const PrivacyPage   = React.lazy(() => import('./pages/legal/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage     = React.lazy(() => import('./pages/legal/TermsPage').then(m => ({ default: m.TermsPage })));
const RefundPage    = React.lazy(() => import('./pages/legal/RefundPage').then(m => ({ default: m.RefundPage })));

// -- Lazy: dashboard / merchant pages -----------------------------------------
const DashboardPage          = React.lazy(() => import('./pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ProductsPage           = React.lazy(() => import('./pages/catalog/ProductsPage').then(m => ({ default: m.ProductsPage })));
const ProductFormPage        = React.lazy(() => import('./pages/catalog/ProductFormPage').then(m => ({ default: m.ProductFormPage })));
const LeadsPage              = React.lazy(() => import('./pages/leads/LeadsPage').then(m => ({ default: m.LeadsPage })));
const LeadDetailPage         = React.lazy(() => import('./pages/leads/LeadDetailPage').then(m => ({ default: m.LeadDetailPage })));
const LeadFormPage           = React.lazy(() => import('./pages/leads/LeadFormPage').then(m => ({ default: m.LeadFormPage })));
const OrdersPage             = React.lazy(() => import('./pages/orders/OrdersPage').then(m => ({ default: m.OrdersPage })));
const OrderDetailPage        = React.lazy(() => import('./pages/orders/OrderDetailPage').then(m => ({ default: m.OrderDetailPage })));
const OrderFormPage          = React.lazy(() => import('./pages/orders/OrderFormPage').then(m => ({ default: m.OrderFormPage })));
const CustomersPage          = React.lazy(() => import('./pages/customers/CustomersPage').then(m => ({ default: m.CustomersPage })));
const CustomerDetailPage     = React.lazy(() => import('./pages/customers/CustomerDetailPage').then(m => ({ default: m.CustomerDetailPage })));
const AiRepliesPage          = React.lazy(() => import('./pages/ai/AiRepliesPage').then(m => ({ default: m.AiRepliesPage })));
const AiTemplatesPage        = React.lazy(() => import('./pages/ai/AiTemplatesPage').then(m => ({ default: m.AiTemplatesPage })));
const CategoriesPage         = React.lazy(() => import('./pages/catalog/CategoriesPage').then(m => ({ default: m.CategoriesPage })));
const AnalyticsPage          = React.lazy(() => import('./pages/analytics/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const BusinessProfilePage    = React.lazy(() => import('./pages/settings/BusinessProfilePage').then(m => ({ default: m.BusinessProfilePage })));
const StorefrontSettingsPage = React.lazy(() => import('./pages/settings/StorefrontSettingsPage').then(m => ({ default: m.StorefrontSettingsPage })));
const PagesPage              = React.lazy(() => import('./pages/PagesPage'));
const IntegrationsPage       = React.lazy(() => import('./pages/settings/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })));
const AccountSecurityPage    = React.lazy(() => import('./pages/settings/AccountSecurityPage').then(m => ({ default: m.AccountSecurityPage })));
const SubscriptionPage       = React.lazy(() => import('./pages/subscription/SubscriptionPage').then(m => ({ default: m.SubscriptionPage })));

// -- Lazy: AI tools ------------------------------------------------------------
const AiSocialPostPage         = React.lazy(() => import('./pages/ai/AiSocialPostPage').then(m => ({ default: m.AiSocialPostPage })));
const AiProductDescriptionPage = React.lazy(() => import('./pages/ai/AiProductDescriptionPage').then(m => ({ default: m.AiProductDescriptionPage })));
const AiReelScriptPage         = React.lazy(() => import('./pages/ai/AiReelScriptPage').then(m => ({ default: m.AiReelScriptPage })));
const AiAutopilotPage          = React.lazy(() => import('./pages/ai/AiAutopilotPage').then(m => ({ default: m.AiAutopilotPage })));
const AiConversationsPage      = React.lazy(() => import('./pages/ai/AiConversationsPage').then(m => ({ default: m.AiConversationsPage })));
const AiCampaignsPage          = React.lazy(() => import('./pages/ai/AiCampaignsPage').then(m => ({ default: m.AiCampaignsPage })));
const ChatbotSimulatorPage     = React.lazy(() => import('./pages/ai/ChatbotSimulatorPage').then(m => ({ default: m.ChatbotSimulatorPage })));

// -- Lazy: marketing -----------------------------------------------------------
const WaTemplatesPage       = React.lazy(() => import('./pages/marketing/WaTemplatesPage').then(m => ({ default: m.WaTemplatesPage })));
const MarketingHubPage      = React.lazy(() => import('./pages/marketing/MarketingHubPage').then(m => ({ default: m.MarketingHubPage })));
const CampaignListPage      = React.lazy(() => import('./pages/marketing/CampaignListPage').then(m => ({ default: m.CampaignListPage })));
const CampaignFormPage      = React.lazy(() => import('./pages/marketing/CampaignFormPage').then(m => ({ default: m.CampaignFormPage })));
const CampaignDetailPage    = React.lazy(() => import('./pages/marketing/CampaignDetailPage').then(m => ({ default: m.CampaignDetailPage })));
const AbandonedCartsPage    = React.lazy(() => import('./pages/marketing/AbandonedCartsPage').then(m => ({ default: m.AbandonedCartsPage })));
const FestivalCalendarPage  = React.lazy(() => import('./pages/marketing/FestivalCalendarPage').then(m => ({ default: m.FestivalCalendarPage })));

// -- Lazy: customers / catalog extras -----------------------------------------
const BirthdayRemindersPage = React.lazy(() => import('./pages/customers/BirthdayRemindersPage').then(m => ({ default: m.BirthdayRemindersPage })));
const CouponsPage           = React.lazy(() => import('./pages/catalog/CouponsPage').then(m => ({ default: m.CouponsPage })));
const ReviewsPage           = React.lazy(() => import('./pages/catalog/ReviewsPage').then(m => ({ default: m.ReviewsPage })));
const ImportProductsPage    = React.lazy(() => import('./pages/catalog/ImportProductsPage').then(m => ({ default: m.ImportProductsPage })));

// -- Lazy: tools ---------------------------------------------------------------
const QrGeneratorPage = React.lazy(() => import('./pages/tools/QrGeneratorPage').then(m => ({ default: m.QrGeneratorPage })));

// -- Lazy: admin / B2B ---------------------------------------------------------
const B2BDashboardPage          = React.lazy(() => import('./pages/b2b/B2BDashboardPage').then(m => ({ default: m.B2BDashboardPage })));
const AdminTenantsPage          = React.lazy(() => import('./pages/admin/AdminTenantsPage').then(m => ({ default: m.AdminTenantsPage })));
const AdminTenantDetailPage     = React.lazy(() => import('./pages/admin/AdminTenantDetailPage').then(m => ({ default: m.AdminTenantDetailPage })));
const AdminLandingPage          = React.lazy(() => import('./pages/admin/AdminLandingPage').then(m => ({ default: m.AdminLandingPage })));
const AdminPlatformSettingsPage    = React.lazy(() => import('./pages/admin/AdminPlatformSettingsPage').then(m => ({ default: m.AdminPlatformSettingsPage })));
const PlatformLeadsPage            = React.lazy(() => import('./pages/admin/PlatformLeadsPage').then(m => ({ default: m.PlatformLeadsPage })));
const AdminChatbotClientsPage      = React.lazy(() => import('./pages/admin/AdminChatbotClientsPage').then(m => ({ default: m.AdminChatbotClientsPage })));
const AdminChatbotClientDetailPage = React.lazy(() => import('./pages/admin/AdminChatbotClientDetailPage').then(m => ({ default: m.AdminChatbotClientDetailPage })));

// -- Custom domain detection ---------------------------------------------------
const BASE_URL = import.meta.env.VITE_API_URL || 'https://silarai-fbahb2bsg4cng3hq.southindia-01.azurewebsites.net/api/v1';
const isCustomDomain = (() => {
  const h = window.location.hostname;
  return h !== 'localhost' && h !== '127.0.0.1' && !h.includes('silarai') && !h.includes('replycart') && !h.includes('azurestaticapps');
})();

function CustomDomainStorefront() {
  const [slug, setSlug] = React.useState<string | null>(null);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    const domain = window.location.hostname;
    axios.get(`${BASE_URL}/public/resolve-domain?domain=${domain}`)
      .then(r => setSlug(r.data.slug))
      .catch(() => setNotFound(true));
  }, []);

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Store not found</h1>
        <p className="text-gray-500">This domain is not connected to any Silarai store.</p>
      </div>
    </div>
  );

  if (!slug) return <PageLoader />;

  return (
    <CartProvider storageKey={`cart_${slug}`}>
      <Routes>
        <Route path="/" element={<PublicStorefrontPage overrideSlug={slug} />} />
        <Route path="/products/:productId" element={<PublicStorefrontPage overrideSlug={slug} />} />
        <Route path="/category/:categorySlug" element={<PublicStorefrontPage overrideSlug={slug} />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage overrideSlug={slug} />} />
        <Route path="/p/:pageSlug" element={<StorefrontCustomPage overrideSlug={slug} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* Powered-by badge — shown on all custom domain pages */}
      <div className="w-full py-3 text-center text-xs text-slate-400 bg-white border-t border-slate-100">
        Powered by{' '}
        <a
          href="https://Silarai.app"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-teal-600 hover:underline"
        >
          Silarai.app
        </a>
      </div>
    </CartProvider>
  );
}

// Scopes the cart to the current store slug so carts don't bleed across stores
function SlugCartProvider({ children }: { children: React.ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  return <CartProvider storageKey={`cart_${slug ?? 'store'}`}>{children}</CartProvider>;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

/** Fires a GA4 page_view on every React Router navigation */
function RouteTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
  return null;
}

function SmartRoot() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : (
    <Suspense fallback={<PageLoader />}>
      <LandingPage />
    </Suspense>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-700">{title}</h2>
        <p className="text-slate-400 text-sm mt-1">Coming soon</p>
      </div>
    </div>
  );
}

export default function App() {
  const { themeId } = useThemeStore();

  // Apply saved theme on first load
  useEffect(() => {
    const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];
    applyTheme(theme);
  }, [themeId]);

  // If running on a seller's custom domain, render their store directly
  if (isCustomDomain) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CustomDomainStorefront />
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <RouteTracker />
        {/* Single top-level Suspense — PageLoader shown while any lazy chunk loads */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Root: landing page for guests, dashboard for authenticated */}
            <Route path="/" element={<SmartRoot />} />

            {/* Auth routes */}
            <Route path="/login"            element={<GuestGuard><LoginPage /></GuestGuard>} />
            <Route path="/register"         element={<GuestGuard><RegisterPage /></GuestGuard>} />
            <Route path="/forgot-password"  element={<GuestGuard><ForgotPasswordPage /></GuestGuard>} />
            <Route path="/reset-password"   element={<ResetPasswordPage />} />
            <Route path="/verify-email"     element={<VerifyEmailPage />} />

            {/* Public routes (no auth) */}
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about"   element={<AboutPage />} />
            <Route path="/blog"    element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms"   element={<TermsPage />} />
            <Route path="/refund"  element={<RefundPage />} />

            {/* Protected merchant routes */}
            <Route element={<AuthGuard><AppShell /></AuthGuard>}>
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Catalog */}
              <Route path="/catalog/products"       element={<ProductsPage />} />
              <Route path="/catalog/products/new"   element={<ProductFormPage />} />
              <Route path="/catalog/products/:id"   element={<ProductFormPage />} />
              <Route path="/catalog/categories"     element={<CategoriesPage />} />
              <Route path="/catalog/coupons"        element={<CouponsPage />} />
              <Route path="/catalog/reviews"        element={<ReviewsPage />} />
              <Route path="/catalog/import"         element={<ImportProductsPage />} />

              {/* CRM */}
              <Route path="/leads"      element={<LeadsPage />} />
              <Route path="/leads/new"  element={<LeadFormPage />} />
              <Route path="/leads/:id"  element={<LeadDetailPage />} />

              <Route path="/orders"      element={<OrdersPage />} />
              <Route path="/orders/new"  element={<OrderFormPage />} />
              <Route path="/orders/:id"  element={<OrderDetailPage />} />

              <Route path="/customers"     element={<CustomersPage />} />
              <Route path="/customers/:id" element={<CustomerDetailPage />} />

              {/* AI */}
              <Route path="/ai/replies"        element={<AiRepliesPage />} />
              <Route path="/ai/templates"      element={<AiTemplatesPage />} />
              <Route path="/ai/autopilot"      element={<AiAutopilotPage />} />
              <Route path="/ai/conversations"  element={<AiConversationsPage />} />
              <Route path="/ai/auto-campaigns" element={<AiCampaignsPage />} />
              <Route path="/ai/simulator"      element={<ChatbotSimulatorPage />} />

              {/* Analytics */}
              <Route path="/analytics" element={<AnalyticsPage />} />

              {/* Settings */}
              <Route path="/settings"         element={<BusinessProfilePage />} />
              <Route path="/settings/account" element={<AccountSecurityPage />} />
              <Route path="/storefront"       element={<StorefrontSettingsPage />} />
              <Route path="/pages"            element={<PagesPage />} />
              <Route path="/integrations"     element={<IntegrationsPage />} />
              <Route path="/subscription"     element={<SubscriptionPage />} />

              {/* Marketing */}
              <Route path="/marketing"                      element={<MarketingHubPage />} />
              <Route path="/marketing/campaigns"            element={<CampaignListPage />} />
              <Route path="/marketing/campaigns/new"        element={<CampaignFormPage />} />
              <Route path="/marketing/campaigns/:id"        element={<CampaignDetailPage />} />
              <Route path="/marketing/abandoned-carts"      element={<AbandonedCartsPage />} />
              <Route path="/marketing/festival-calendar"    element={<FestivalCalendarPage />} />
              <Route path="/marketing/wa-templates"         element={<WaTemplatesPage />} />

              {/* AI tools */}
              <Route path="/ai/social-post"         element={<AiSocialPostPage />} />
              <Route path="/ai/product-description" element={<AiProductDescriptionPage />} />
              <Route path="/ai/reel-script"         element={<AiReelScriptPage />} />

              {/* B2B */}
              <Route path="/b2b/quotes" element={<B2BDashboardPage />} />

              {/* Tools */}
              <Route path="/tools/qr-code" element={<QrGeneratorPage />} />

              {/* Birthday Reminders */}
              <Route path="/customers/birthdays" element={<BirthdayRemindersPage />} />

              {/* Admin */}
              <Route path="/admin"                    element={<Placeholder title="Admin Dashboard" />} />
              <Route path="/admin/tenants"            element={<AdminTenantsPage />} />
              <Route path="/admin/tenants/:id"        element={<AdminTenantDetailPage />} />
              <Route path="/admin/landing-page"       element={<AdminLandingPage />} />
              <Route path="/admin/platform-settings"  element={<AdminPlatformSettingsPage />} />
              <Route path="/admin/platform-leads"     element={<PlatformLeadsPage />} />
              <Route path="/admin/chatbot-clients"    element={<AdminChatbotClientsPage />} />
              <Route path="/admin/chatbot-clients/:id" element={<AdminChatbotClientDetailPage />} />
            </Route>

            {/* Public storefront routes */}
            <Route path="/:slug"                           element={<SlugCartProvider><PublicStorefrontPage /></SlugCartProvider>} />
            <Route path="/:slug/products/:productId"       element={<SlugCartProvider><PublicStorefrontPage /></SlugCartProvider>} />
            <Route path="/:slug/category/:categorySlug"    element={<SlugCartProvider><PublicStorefrontPage /></SlugCartProvider>} />
            <Route path="/:slug/order-confirmation/:orderId" element={<SlugCartProvider><OrderConfirmationPage /></SlugCartProvider>} />
            <Route path="/:slug/p/:pageSlug"               element={<StorefrontCustomPage />} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

