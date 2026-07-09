import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { businessApi } from '../../api/business.api';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/auth.store';
import { setAppLanguage } from '../../i18n';

// Routes a chatbot-only (Basic plan) tenant may still visit
const CHATBOT_ONLY_ROUTES = ['/chatbot-clients', '/chatbot-usage', '/subscription', '/settings/account'];

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuthStore();

  const { data: business } = useQuery({
    queryKey: ['business'],
    queryFn: () => businessApi.getBusiness(),
    staleTime: 10 * 60 * 1000,
  });

  const { data: sub } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => apiClient.get('/subscription').then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  // Basic plan = chatbot-only: redirect away from any hidden page
  const isSuperAdmin = user?.roles.includes('SuperAdmin') ?? false;
  const chatbotOnly = !isSuperAdmin && sub !== undefined && (sub?.planSlug ?? 'basic') === 'basic';
  const routeAllowed = CHATBOT_ONLY_ROUTES.some(p => location.pathname.startsWith(p));

  // Apply the language the store owner chose during registration
  useEffect(() => {
    if (business?.language) {
      setAppLanguage(business.language);
    }
  }, [business?.language]);

  // Set browser tab title to tenant's business name
  useEffect(() => {
    document.title = business?.name ? `${business.name} — Silarai` : 'Silarai';
    return () => { document.title = 'Silarai'; };
  }, [business?.name]);

  if (chatbotOnly && !routeAllowed) {
    return <Navigate to="/chatbot-clients" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

