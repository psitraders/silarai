import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Inbox, Users, ShoppingBag, Package, Store,
  BarChart2, Settings, LogOut, MessageSquareQuote, X, Plug, Zap, Shield, Send, Sparkles,
  Tag, Star, ShoppingCart, Globe,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import apiClient from '../../api/client';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/leads', icon: Inbox, label: 'Inbox / Leads' },
  { path: '/orders', icon: ShoppingBag, label: 'Orders' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/catalog/products', icon: Package, label: 'Products' },
  { path: '/catalog/categories', icon: Store, label: 'Categories' },
  { path: '/catalog/coupons', icon: Tag, label: 'Coupons' },
  { path: '/catalog/reviews', icon: Star, label: 'Reviews' },
  { path: '/storefront', icon: Store, label: 'Storefront' },
  { path: '/marketing', icon: Send, label: 'Marketing' },
  { path: '/marketing/abandoned-carts', icon: ShoppingCart, label: 'Abandoned Carts' },
  { path: '/ai/replies', icon: MessageSquareQuote, label: 'AI Replies' },
  { path: '/ai/social-post', icon: Sparkles, label: 'Social Posts' },
  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/integrations', icon: Plug, label: 'Integrations' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { logout, user } = useAuthStore();

  const { data: sub } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => apiClient.get('/subscription').then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

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
              <span className="font-bold text-slate-900 text-sm">ReplyCart</span>
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

          {user?.roles.includes('SuperAdmin') && (
            <div className="mt-2 pt-2 border-t border-slate-100">
              <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Admin</p>
              {[
                { to: '/admin/tenants',      icon: Shield, label: 'Tenants' },
                { to: '/admin/landing-page', icon: Globe,  label: 'Landing Page' },
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

          {/* Store link */}
          <div className="theme-store-panel rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">Your Store Link</p>
            <p className="text-xs theme-store-text font-medium truncate">
              replycart.in/{user?.tenantId?.slice(0, 8)}
            </p>
          </div>

          {/* Theme switcher */}
          <ThemeSwitcher />

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors w-full px-2 py-1"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
