import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Inbox, Users, ShoppingBag, Package, Store,
  BarChart2, Settings, LogOut, MessageSquareQuote, X, Plug, Zap, Shield, Send, Sparkles,
  Tag, Star, ShoppingCart, Globe, UserCircle, Bot, MessagesSquare, Download, FlaskConical, FileText, MessageCircle,
  Coins,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import apiClient from '../../api/client';
import { businessApi } from '../../api/business.api';
import { customDomainApi } from '../../api/customDomain.api';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { logout, user } = useAuthStore();
  const { t } = useTranslation();

  const fullNavItems = [
    { path: '/dashboard',                icon: LayoutDashboard,   label: t('nav.dashboard') },
    { path: '/leads',                    icon: Inbox,             label: t('nav.leads') },
    { path: '/orders',                   icon: ShoppingBag,       label: t('nav.orders') },
    { path: '/customers',               icon: Users,             label: t('nav.customers') },
    { path: '/catalog/products',        icon: Package,           label: t('nav.products') },
    { path: '/catalog/categories',      icon: Store,             label: t('nav.categories') },
    { path: '/catalog/coupons',         icon: Tag,               label: t('nav.coupons') },
    { path: '/catalog/reviews',         icon: Star,              label: t('nav.reviews') },
    { path: '/catalog/import',          icon: Download,          label: 'Import Products' },
    { path: '/storefront',              icon: Store,             label: t('nav.storefront') },
    { path: '/pages',                  icon: FileText,          label: 'Custom Pages' },
    { path: '/marketing',               icon: Send,              label: t('nav.marketing') },

    { path: '/marketing/abandoned-carts', icon: ShoppingCart,    label: t('nav.abandonedCarts') },
    { path: '/marketing/wa-templates',    icon: MessageCircle,   label: 'WA Templates' },
    { path: '/ai/autopilot',            icon: Bot,                label: 'AI Autopilot' },
    { path: '/ai/conversations',        icon: MessagesSquare,     label: 'AI Conversations' },
    { path: '/ai/simulator',            icon: FlaskConical,       label: 'Chatbot Simulator' },
    { path: '/chatbot-clients',         icon: Bot,                label: 'Chatbot Clients' },
    { path: '/chatbot-usage',           icon: Coins,              label: 'Token Usage' },
    { path: '/b2b/quotes',             icon: FileText,           label: 'B2B Quote Inbox' },
    { path: '/ai/auto-campaigns',       icon: Zap,               label: 'Auto-Campaigns' },
    { path: '/ai/replies',              icon: MessageSquareQuote, label: t('nav.aiReplies') },
    { path: '/ai/social-post',          icon: Sparkles,          label: t('nav.socialPosts') },
    { path: '/analytics',               icon: BarChart2,         label: t('nav.analytics') },
    { path: '/integrations',            icon: Plug,              label: t('nav.integrations') },
    { path: '/settings',                icon: Settings,          label: t('nav.settings') },
    { path: '/settings/account',        icon: UserCircle,        label: t('nav.accountSecurity') },
  ];

  const { data: sub } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => apiClient.get('/subscription').then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const isSuperAdmin = user?.roles.includes('SuperAdmin') ?? false;
  // Basic plan = chatbot-only: the whole dashboard is hidden except chatbot screens
  const chatbotOnly = !isSuperAdmin && (sub?.planSlug ?? 'basic') === 'basic';

  const chatbotNavItems = [
    { path: '/chatbot-clients',  icon: Bot,        label: 'Chatbot Clients' },
    { path: '/chatbot-usage',    icon: Coins,      label: 'Token Usage' },
    { path: '/settings/account', icon: UserCircle, label: t('nav.accountSecurity') },
  ];

  const navItems = chatbotOnly ? chatbotNavItems : fullNavItems;

  const { data: storefront } = useQuery({
    queryKey: ['storefront-settings'],
    queryFn: businessApi.getStorefrontSettings,
    staleTime: 5 * 60 * 1000,
    enabled: !chatbotOnly,   // chatbot-only tenants have no storefront UI
  });

  const { data: customDomain } = useQuery({
    queryKey: ['custom-domain'],
    queryFn: customDomainApi.get,
    staleTime: 5 * 60 * 1000,
    enabled: !chatbotOnly,
  });

  // Show custom domain when active, otherwise fall back to Silarai.app/slug
  const storeUrl = customDomain?.status === 'active' && customDomain.domain
    ? `https://${customDomain.domain}`
    : storefront?.slug ? `${window.location.origin}/${storefront.slug}` : null;

  const planName: string = sub?.planName ?? 'Basic';
  const isFreeTier = planName === 'Basic' || !sub?.hasSubscription;
  const isTrial = sub?.status === 'Trial';

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={onClose} />
      )}

      <aside className={clsx(
        'fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300',
        'lg:translate-x-0 lg:static lg:z-auto',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center theme-icon-bg">
              <MessageSquareQuote className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">Silarai</span>
              <p className="text-[10px] text-slate-400">Turn chats into orders</p>
            </div>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-slate-600" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-colors',
                  isActive
                    ? 'theme-nav-active font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}

          {isSuperAdmin && (
            <div className="mt-2 pt-2 border-t border-slate-100">
              <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Admin</p>
              {[
                { to: '/admin/tenants',          icon: Shield,  label: 'Tenants' },
                { to: '/admin/chatbot-clients', icon: Bot,     label: 'Chatbot Clients' },
                { to: '/admin/chatbot-usage',   icon: Coins,   label: 'Token Usage' },
                { to: '/admin/landing-page',    icon: Globe,   label: 'Landing Page' },
                { to: '/admin/platform-leads',  icon: Inbox,   label: 'Platform Leads' },
              ].map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} onClick={onClose}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-colors',
                      isActive ? 'theme-nav-active font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        {/* Bottom panel */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {/* Plan / Upgrade banner */}
          <NavLink
            to="/subscription"
            onClick={onClose}
            className="block rounded-xl overflow-hidden"
          >
            {isFreeTier || isTrial ? (
              <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-3 rounded-xl text-white hover:opacity-90 transition-opacity">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">
                    {isTrial ? `${planName} Trial` : 'Free Plan'}
                  </span>
                  {sub?.daysRemaining != null && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                      {sub.daysRemaining}d left
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-xs font-medium">Upgrade to unlock more →</span>
                </div>
              </div>
            ) : (
              <div className="theme-store-panel rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Current Plan</p>
                    <p className="text-sm font-bold text-slate-900">{planName}</p>
                  </div>
                  <Zap className="w-4 h-4 text-teal-500" />
                </div>
              </div>
            )}
          </NavLink>

          {/* Store link — hidden for chatbot-only (Basic) tenants */}
          {chatbotOnly ? null : storeUrl ? (
            <a
              href={storeUrl}
              target="_blank"
              rel="noreferrer"
              onClick={onClose}
              className="block theme-store-panel rounded-xl p-3 hover:opacity-80 transition-opacity"
              title="Open your storefront"
            >
              <p className="text-xs text-slate-500 mb-1">{t('nav.yourStoreLink')}</p>
              <p className="text-xs theme-store-text font-medium truncate">{storeUrl.replace(/^https?:\/\//, '')}</p>
            </a>
          ) : (
            <NavLink
              to="/storefront"
              onClick={onClose}
              className="block theme-store-panel rounded-xl p-3 hover:opacity-80 transition-opacity"
              title="Set up your store URL"
            >
              <p className="text-xs text-slate-500 mb-1">{t('nav.yourStoreLink')}</p>
              <p className="text-xs text-amber-500 font-medium">Tap to set your store URL →</p>
            </NavLink>
          )}

          {/* Theme switcher */}
          <ThemeSwitcher />

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors w-full px-2 py-1"
          >
            <LogOut className="w-4 h-4" />
            {t('auth.logout')}
          </button>
        </div>
      </aside>
    </>
  );
}

