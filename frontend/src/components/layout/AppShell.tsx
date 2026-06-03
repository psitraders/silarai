import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { businessApi } from '../../api/business.api';
import { setAppLanguage } from '../../i18n';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: business } = useQuery({
    queryKey: ['business'],
    queryFn: () => businessApi.getBusiness(),
    staleTime: 10 * 60 * 1000,
  });

  // Apply the language the store owner chose during registration
  useEffect(() => {
    if (business?.language) {
      setAppLanguage(business.language);
    }
  }, [business?.language]);

  // Set browser tab title to tenant's business name
  useEffect(() => {
    document.title = business?.name ? `${business.name} — ReplyCart` : 'ReplyCart';
    return () => { document.title = 'ReplyCart'; };
  }, [business?.name]);

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
