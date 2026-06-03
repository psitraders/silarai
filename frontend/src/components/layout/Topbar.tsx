import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, Search, Globe, ShoppingBag, Users, MessageSquare, X, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { setAppLanguage } from '../../i18n';
import { track } from '../../lib/analytics';
import { notificationsApi, type ActivityItem } from '../../api/notifications.api';
import { searchApi, type SearchResultItem } from '../../api/search.api';
import { SUPPORTED_LANGUAGES } from '../../data/countries';
import { formatDateFull } from '../../utils/formatDate';
import { useStoreCountry } from '../../hooks/useStoreCountry';

const LANGUAGES = SUPPORTED_LANGUAGES.map(l => ({
  code: l.code,
  label: l.nativeLabel,
  short: l.code.toUpperCase().slice(0, 2),
  ready: true,
}));

/** Maps activity type → the dashboard route to navigate to */
function resolveRoute(type: ActivityItem['type'], entityId: string | null): string {
  if (!entityId) {
    if (type === 'order')    return '/orders';
    if (type === 'lead')     return '/leads';
    return '/customers';
  }
  if (type === 'order')    return `/orders/${entityId}`;
  if (type === 'lead')     return `/leads/${entityId}`;
  return `/customers/${entityId}`;
}

// ── Search section component ──────────────────────────────────────────────────

function SearchSection({
  label, icon, items, onNavigate, badgeClass,
}: {
  label: string;
  icon: string;
  items: SearchResultItem[];
  onNavigate: (item: SearchResultItem) => void;
  badgeClass?: (badge: string) => string;
}) {
  if (!items.length) return null;
  return (
    <div>
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
          {icon} {label}
        </p>
      </div>
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onNavigate(item)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{item.title}</p>
            {item.subtitle && (
              <p className="text-xs text-slate-400 truncate">{item.subtitle}</p>
            )}
          </div>
          {item.badge && (
            <span className={`ml-2 shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              badgeClass ? badgeClass(item.badge) : 'bg-slate-100 text-slate-500'
            }`}>
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Notification icon ─────────────────────────────────────────────────────────

function NotificationIcon({ type }: { type: ActivityItem['type'] }) {
  const base = 'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0';
  if (type === 'order')    return <div className={`${base} bg-teal-100`}><ShoppingBag className="w-4 h-4 text-teal-600" /></div>;
  if (type === 'lead')     return <div className={`${base} bg-green-100`}><MessageSquare className="w-4 h-4 text-green-600" /></div>;
  return                          <div className={`${base} bg-purple-100`}><Users className="w-4 h-4 text-purple-600" /></div>;
}

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuthStore();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const storeCountry = useStoreCountry();

  const [langOpen,  setLangOpen]  = useState(false);
  const [bellOpen,  setBellOpen]  = useState(false);

  // ── Global search ──────────────────────────────────────────────────────────
  const [searchQ,    setSearchQ]    = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchQ), 280);
    return () => clearTimeout(t);
  }, [searchQ]);

  const { data: searchResults } = useQuery({
    queryKey: ['global-search', debouncedQ],
    queryFn: () => searchApi.search(debouncedQ),
    enabled: debouncedQ.length >= 2,
    staleTime: 10_000,
  });

  const hasResults = searchResults && (
    searchResults.products.length > 0  ||
    searchResults.customers.length > 0 ||
    searchResults.orders.length > 0    ||
    searchResults.leads.length > 0
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const goTo = (path: string) => {
    navigate(path);
    setSearchOpen(false);
    setSearchQ('');
    setDebouncedQ('');
  };
  const [readIds,   setReadIds]   = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('rc_read_notif') ?? '[]')); }
    catch { return new Set(); }
  });

  // ── PWA install prompt ─────────────────────────────────────────────────────
  // beforeinstallprompt fires before React mounts — index.html stores it on
  // window.__pwaPrompt so we always have it even if the event already fired.
  const [installPrompt, setInstallPrompt] = useState<any>(() => (window as any).__pwaPrompt ?? null);
  const [isStandalone,  setIsStandalone]  = useState(
    () => window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
  );
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const howToRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync with global capture in case it fired before this component mounted
    if ((window as any).__pwaPrompt) setInstallPrompt((window as any).__pwaPrompt);

    const onReady = () => setInstallPrompt((window as any).__pwaPrompt);
    const onInstalled = () => { setIsStandalone(true); setInstallPrompt(null); setIsPwaInstalled(true); };
    window.addEventListener('pwaPromptReady', onReady);
    window.addEventListener('appinstalled', onInstalled);

    if ('getInstalledRelatedApps' in navigator) {
      (navigator as any).getInstalledRelatedApps()
        .then((apps: any[]) => { if (apps.length > 0) setIsPwaInstalled(true); })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('pwaPromptReady', onReady);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // Close how-to popover when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (howToRef.current && !howToRef.current.contains(e.target as Node)) setShowHowTo(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

  const handleInstall = async () => {
    const prompt = (window as any).__pwaPrompt ?? installPrompt;
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        (window as any).__pwaPrompt = null;
        setInstallPrompt(null);
        setIsStandalone(true);
        setIsPwaInstalled(true);
      }
    } else {
      // No native prompt (iOS or Chrome cooldown) — show manual instructions
      setShowHowTo(o => !o);
    }
  };

  const langRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  // i18n.language can be 'en-US' — normalise to the 2-char base code
  const activeLangCode = i18n.language?.split('-')[0] ?? 'en';
  const currentLang = LANGUAGES.find(l => l.code === activeLangCode) ?? LANGUAGES[0];

  const { data: feed = [], isLoading } = useQuery({
    queryKey: ['activity-feed'],
    queryFn: () => notificationsApi.getFeed(20),
    refetchInterval: 60_000, // poll every minute for new notifications
    staleTime: 30_000,
  });

  const unreadCount = feed.filter(
    item => item.entityId && !readIds.has(item.entityId)
  ).length;

  /** Mark a single notification as read and persist */
  const markOneRead = (entityId: string | null) => {
    if (!entityId) return;
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(entityId);
      localStorage.setItem('rc_read_notif', JSON.stringify([...next]));
      return next;
    });
  };

  /** Mark all as read and persist */
  const markAllRead = () => {
    const allIds = new Set(feed.map(i => i.entityId).filter(Boolean) as string[]);
    setReadIds(allIds);
    localStorage.setItem('rc_read_notif', JSON.stringify([...allIds]));
  };

  /** Click handler: mark read → navigate → close panel */
  const handleNotifClick = (item: ActivityItem) => {
    markOneRead(item.entityId);
    setBellOpen(false);
    navigate(resolveRoute(item.type, item.entityId));
  };

  /** Close dropdowns when clicking outside */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 z-30 relative">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Brand name — only visible on mobile where the sidebar is hidden */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
            <ShoppingBag className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm hidden xs:inline sm:inline">Silarai</span>
        </div>
        {/* Global search */}
        <div className="hidden lg:block relative" ref={searchRef}>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-72 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search anything..."
              value={searchQ}
              onChange={e => { setSearchQ(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
              className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full"
            />
            {searchQ && (
              <button onClick={() => { setSearchQ(''); setDebouncedQ(''); setSearchOpen(false); }}>
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          {/* Results dropdown */}
          {searchOpen && debouncedQ.length >= 2 && (
            <div className="absolute left-0 top-full mt-2 w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
              {!hasResults ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  No results for "{debouncedQ}"
                </div>
              ) : (
                <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-50">
                  <SearchSection label="Products" icon="📦" items={searchResults!.products}
                    onNavigate={item => goTo(`/catalog/products/${item.id}/edit`)}
                    badgeClass={b => b === 'Active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'} />
                  <SearchSection label="Customers" icon="👤" items={searchResults!.customers}
                    onNavigate={item => goTo(`/customers/${item.id}`)} />
                  <SearchSection label="Orders" icon="🛒" items={searchResults!.orders}
                    onNavigate={item => goTo(`/orders/${item.id}`)}
                    badgeClass={b => b === 'Delivered' ? 'bg-green-50 text-green-700' : b === 'Cancelled' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'} />
                  <SearchSection label="Leads" icon="💬" items={searchResults!.leads}
                    onNavigate={item => goTo(`/leads/${item.id}`)} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 sm:gap-2">

        {/* PWA install button — hidden only when running as installed PWA or detected as installed.
             Shows install dialog when prompt is available, manual instructions otherwise. */}
        {!isStandalone && !isPwaInstalled && (
          <div className="relative" ref={howToRef}>
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors text-xs font-semibold"
              title="Install Silarai as an app"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install App</span>
            </button>

            {/* How-to popover — shown when native prompt isn't available (cooldown / iOS) */}
            {showHowTo && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4 text-teal-600" />
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">Install Silarai</p>
                </div>
                {isIos ? (
                  <ol className="space-y-2 text-xs text-slate-600">
                    <li className="flex gap-2"><span className="font-bold text-teal-600 shrink-0">1.</span> Tap the <span className="font-semibold">Share</span> button at the bottom of Safari</li>
                    <li className="flex gap-2"><span className="font-bold text-teal-600 shrink-0">2.</span> Scroll down and tap <span className="font-semibold">"Add to Home Screen"</span></li>
                    <li className="flex gap-2"><span className="font-bold text-teal-600 shrink-0">3.</span> Tap <span className="font-semibold">Add</span> — done!</li>
                  </ol>
                ) : (
                  <ol className="space-y-2 text-xs text-slate-600">
                    <li className="flex gap-2"><span className="font-bold text-teal-600 shrink-0">1.</span> Tap the <span className="font-semibold">⋮ menu</span> in Chrome (top-right)</li>
                    <li className="flex gap-2"><span className="font-bold text-teal-600 shrink-0">2.</span> Tap <span className="font-semibold">"Add to Home screen"</span> or <span className="font-semibold">"Install app"</span></li>
                    <li className="flex gap-2"><span className="font-bold text-teal-600 shrink-0">3.</span> Tap <span className="font-semibold">Install</span> — done!</li>
                  </ol>
                )}
                <p className="text-[11px] text-slate-400 mt-3">
                  Once installed, open from your home screen for the best experience.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Language switcher */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => { setLangOpen(o => !o); setBellOpen(false); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
            title="Change language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">{currentLang.short}</span>
          </button>

          {langOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-y-auto max-h-72">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { if (lang.ready) { setAppLanguage(lang.code); track.languageSwitch(lang.code); setLangOpen(false); } }}
                  disabled={!lang.ready}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                    !lang.ready
                      ? 'text-slate-400 cursor-not-allowed'
                      : activeLangCode === lang.code
                        ? 'font-semibold text-teal-700 bg-teal-50 hover:bg-teal-50'
                        : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{lang.label}</span>
                  {lang.ready
                    ? <span className="text-xs text-slate-400 font-mono">{lang.short}</span>
                    : <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full font-medium">Soon</span>
                  }
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bell — notification panel */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => { setBellOpen(o => !o); setLangOpen(false); }}
            className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setBellOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="max-h-[400px] overflow-y-auto">
                {isLoading ? (
                  <div className="py-10 text-center text-sm text-slate-400">Loading…</div>
                ) : feed.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No notifications yet</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-50">
                    {feed.map((item, idx) => {
                      const isRead = !item.entityId || readIds.has(item.entityId);
                      return (
                        <li key={`${item.entityId ?? idx}`}>
                          <button
                            onClick={() => handleNotifClick(item)}
                            className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-100 cursor-pointer ${!isRead ? 'bg-teal-50/40' : ''}`}
                          >
                            <NotificationIcon type={item.type} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm leading-snug ${!isRead ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                                {item.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 truncate">{item.subtitle}</p>
                              <p className="text-[11px] text-slate-400 mt-1">{formatDateFull(item.occurredAt, storeCountry)}</p>
                            </div>
                            {!isRead && (
                              <span className="w-2 h-2 bg-teal-500 rounded-full mt-1.5 flex-shrink-0" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Footer */}
              {feed.length > 0 && (
                <div className="border-t border-slate-100 px-4 py-2.5 text-center">
                  <a
                    href="/orders"
                    className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                    onClick={() => setBellOpen(false)}
                  >
                    View all orders & leads →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2.5 pl-2">
          <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

