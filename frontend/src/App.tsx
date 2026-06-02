import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { useAuthStore } from './store/auth.store';
import { useThemeStore, applyTheme, THEMES } from './store/theme.store';

// Layout
import { AppShell } from './components/layout/AppShell';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Merchant pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProductsPage } from './pages/catalog/ProductsPage';
import { ProductFormPage } from './pages/catalog/ProductFormPage';
import { LeadsPage } from './pages/leads/LeadsPage';
import { LeadDetailPage } from './pages/leads/LeadDetailPage';
import { LeadFormPage } from './pages/leads/LeadFormPage';
import { OrdersPage } from './pages/orders/OrdersPage';
import { OrderDetailPage } from './pages/orders/OrderDetailPage';
import { OrderFormPage } from './pages/orders/OrderFormPage';
import { CustomersPage } from './pages/customers/CustomersPage';
import { CustomerDetailPage } from './pages/customers/CustomerDetailPage';
import { AiRepliesPage } from './pages/ai/AiRepliesPage';
import { AiTemplatesPage } from './pages/ai/AiTemplatesPage';
import { CategoriesPage } from './pages/catalog/CategoriesPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { BusinessProfilePage } from './pages/settings/BusinessProfilePage';
import { StorefrontSettingsPage } from './pages/settings/StorefrontSettingsPage';
import { IntegrationsPage } from './pages/settings/IntegrationsPage';

// Public pages
import { PublicStorefrontPage } from './pages/storefront/PublicStorefrontPage';
import { CartProvider } from './context/CartContext';

// Scopes the cart to the current store slug so carts don't bleed across stores
function SlugCartProvider({ children }: { children: React.ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  return <CartProvider storageKey={`cart_${slug ?? 'store'}`}>{children}</CartProvider>;
}
import { PricingPage } from './pages/subscription/PricingPage';
import { SubscriptionPage } from './pages/subscription/SubscriptionPage';

// Marketing pages
import { MarketingHubPage } from './pages/marketing/MarketingHubPage';
import { CampaignListPage } from './pages/marketing/CampaignListPage';
import { CampaignFormPage } from './pages/marketing/CampaignFormPage';
import { CampaignDetailPage } from './pages/marketing/CampaignDetailPage';
import { AiSocialPostPage } from './pages/ai/AiSocialPostPage';
import { CouponsPage } from './pages/catalog/CouponsPage';
import { ReviewsPage } from './pages/catalog/ReviewsPage';
import { AbandonedCartsPage } from './pages/marketing/AbandonedCartsPage';

// Admin pages
import { AdminTenantsPage } from './pages/admin/AdminTenantsPage';
import { AdminTenantDetailPage } from './pages/admin/AdminTenantDetailPage';
import { AdminLandingPage } from './pages/admin/AdminLandingPage';

// Landing page
import { LandingPage } from './pages/landing/LandingPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function SmartRoot() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;
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

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Root: landing page for guests, dashboard for authenticated */}
          <Route path="/" element={<SmartRoot />} />

          {/* Auth routes */}
          <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
          <Route path="/register" element={<GuestGuard><RegisterPage /></GuestGuard>} />

          {/* Public routes (no auth) */}
          <Route path="/pricing" element={<PricingPage />} />

          {/* Protected merchant routes */}
          <Route element={<AuthGuard><AppShell /></AuthGuard>}>
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Catalog */}
            <Route path="/catalog/products" element={<ProductsPage />} />
            <Route path="/catalog/products/new" element={<ProductFormPage />} />
            <Route path="/catalog/products/:id" element={<ProductFormPage />} />
            <Route path="/catalog/categories" element={<CategoriesPage />} />
            <Route path="/catalog/coupons" element={<CouponsPage />} />
            <Route path="/catalog/reviews" element={<ReviewsPage />} />

            {/* CRM */}
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/leads/new" element={<LeadFormPage />} />
            <Route path="/leads/:id" element={<LeadDetailPage />} />

            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/new" element={<OrderFormPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />

            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />

            {/* AI */}
            <Route path="/ai/replies" element={<AiRepliesPage />} />
            <Route path="/ai/templates" element={<AiTemplatesPage />} />

            {/* Analytics */}
            <Route path="/analytics" element={<AnalyticsPage />} />

            {/* Settings */}
            <Route path="/settings" element={<BusinessProfilePage />} />
            <Route path="/storefront" element={<StorefrontSettingsPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />

            {/* Marketing */}
            <Route path="/marketing" element={<MarketingHubPage />} />
            <Route path="/marketing/campaigns" element={<CampaignListPage />} />
            <Route path="/marketing/campaigns/new" element={<CampaignFormPage />} />
            <Route path="/marketing/campaigns/:id" element={<CampaignDetailPage />} />

            {/* AI Social Post */}
            <Route path="/ai/social-post" element={<AiSocialPostPage />} />

            {/* Abandoned Carts */}
            <Route path="/marketing/abandoned-carts" element={<AbandonedCartsPage />} />

            {/* Admin */}
            <Route path="/admin" element={<Placeholder title="Admin Dashboard" />} />
            <Route path="/admin/tenants" element={<AdminTenantsPage />} />
            <Route path="/admin/tenants/:id" element={<AdminTenantDetailPage />} />
            <Route path="/admin/landing-page" element={<AdminLandingPage />} />
          </Route>

          {/* Public storefront routes */}
          <Route path="/:slug" element={<SlugCartProvider><PublicStorefrontPage /></SlugCartProvider>} />
          <Route path="/:slug/products/:productId" element={<SlugCartProvider><PublicStorefrontPage /></SlugCartProvider>} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
