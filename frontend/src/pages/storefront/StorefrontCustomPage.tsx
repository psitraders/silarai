import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { optimizeImage } from '../../utils/imageUrl';
import { generateWhatsAppLink } from '../../utils/whatsappLink';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

interface StoreData {
  name: string;
  description?: string;
  logoUrl?: string;
  themeColor: string;
  secondaryColor?: string;
  whatsAppNumber?: string;
  instagramHandle?: string;
  facebookPageUrl?: string;
  announcementText?: string;
  allowsCustomBranding?: boolean;
  currency?: string;
}

interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  updatedAt?: string;
}

interface NavPage {
  id: string;
  title: string;
  slug: string;
  showInNav: boolean;
  showInFooter: boolean;
}

export function StorefrontCustomPage({ overrideSlug }: { overrideSlug?: string } = {}) {
  const { slug: paramSlug, pageSlug } = useParams<{ slug: string; pageSlug: string }>();
  const slug = overrideSlug ?? paramSlug;

  // Determine link bases (custom domain vs Silarai.app subdomain)
  const storeBase = overrideSlug ? '/' : `/${slug}`;
  const pageBase  = overrideSlug ? '/p' : `/${slug}/p`;

  const { data: store } = useQuery<StoreData>({
    queryKey: ['public-store', slug],
    queryFn: () => fetch(`${BASE_URL}/public/${slug}`).then(r => r.json()),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const { data: page, isLoading, isError } = useQuery<CustomPage>({
    queryKey: ['public-page', slug, pageSlug],
    queryFn: () => fetch(`${BASE_URL}/public/${slug}/pages/${pageSlug}`).then(r => {
      if (!r.ok) throw new Error('Page not found');
      return r.json();
    }),
    enabled: !!slug && !!pageSlug,
    retry: false,
  });

  const { data: allPages = [] } = useQuery<NavPage[]>({
    queryKey: ['public-pages-nav', slug],
    queryFn: () => fetch(`${BASE_URL}/public/${slug}/pages`).then(r => r.json()),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const navPages    = allPages.filter(p => p.showInNav);
  const footerPages = allPages.filter(p => p.showInFooter);
  const tc = store?.themeColor ?? '#0d9488';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${tc} transparent transparent transparent` }} />
      </div>
    );
  }

  if (isError || !page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-500">
        <FileText className="w-12 h-12 text-slate-300" />
        <p className="text-lg font-semibold">Page not found</p>
        <a href={storeBase} className="text-sm hover:underline" style={{ color: tc }}>← Back to store</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Announcement bar ── */}
      {store?.announcementText && (
        <div className="bg-slate-900 text-white text-xs py-2 overflow-hidden relative">
          <div className="whitespace-nowrap inline-block" style={{ animation: 'marqueeScroll 22s linear infinite' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="mx-12">✦ {store.announcementText}</span>
            ))}
          </div>
          <style>{`@keyframes marqueeScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
        </div>
      )}

      {/* ── Sticky header ── */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <a href={storeBase} className="flex items-center gap-2 flex-shrink-0">
            {store?.logoUrl ? (
              <img src={optimizeImage(store.logoUrl, 120)} alt={store?.name} className="h-9 object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                  style={{ backgroundColor: tc }}
                >
                  {store?.name?.slice(0, 2).toUpperCase() ?? '..'}
                </div>
                <span className="font-bold text-slate-900 text-base hidden sm:block">{store?.name}</span>
              </div>
            )}
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
            <a href={storeBase} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Home
            </a>
            <a href={`${storeBase}#products`} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              All Products
            </a>
            {navPages.map(p => (
              <a
                key={p.id}
                href={`${pageBase}/${p.slug}`}
                className="text-sm font-medium transition-colors"
                style={{ color: p.slug === pageSlug ? tc : undefined }}
              >
                {p.title}
              </a>
            ))}
          </nav>

          {/* Back to store (mobile) */}
          <a
            href={storeBase}
            className="md:hidden ml-auto text-sm font-medium flex items-center gap-1"
            style={{ color: tc }}
          >
            ← Store
          </a>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{page.title}</h1>
        {page.updatedAt && (
          <p className="text-xs text-slate-400 mb-8">
            Last updated: {new Date(page.updatedAt).toLocaleDateString()}
          </p>
        )}
        <div
          className="text-slate-700 leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1.5 [&_a]:underline [&_hr]:border-slate-200 [&_hr]:my-6 [&_strong]:font-bold [&_em]:italic"
          style={{ '--link-color': tc } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-white mt-auto">
        {/* Trust strip */}
        <div className="border-b border-slate-800 py-6 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6">
            {[
              { icon: '🚚', text: 'Fast Delivery' },
              { icon: '🔒', text: 'Secure Payments' },
              { icon: '💬', text: 'WhatsApp Support' },
              { icon: '↩️', text: 'Easy Returns' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-slate-300">
                <span>{icon}</span> {text}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm mb-3"
              style={{ backgroundColor: tc }}
            >
              {store?.name?.slice(0, 2).toUpperCase() ?? '..'}
            </div>
            <h3 className="font-bold text-lg mb-1">{store?.name}</h3>
            {store?.description && (
              <p className="text-slate-400 text-sm leading-relaxed">{store.description}</p>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold mb-3 text-slate-300">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href={storeBase} className="hover:text-white transition-colors">← Back to Store</a></li>
              <li><a href={`${storeBase}#products`} className="hover:text-white transition-colors">All Products</a></li>
              {footerPages.map(p => (
                <li key={p.id}>
                  <a
                    href={`${pageBase}/${p.slug}`}
                    className="hover:text-white transition-colors"
                    style={p.slug === pageSlug ? { color: '#fff' } : {}}
                  >
                    {p.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3 text-slate-300">Contact Us</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              {store?.whatsAppNumber && (
                <li>
                  <a
                    href={generateWhatsAppLink(store.whatsAppNumber, `Hi ${store.name}!`)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {store.whatsAppNumber}
                  </a>
                </li>
              )}
              {store?.instagramHandle && (
                <li>
                  <a
                    href={`https://instagram.com/${store.instagramHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    {store.instagramHandle}
                  </a>
                </li>
              )}
              {store?.facebookPageUrl && (
                <li>
                  <a
                    href={store.facebookPageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                    Facebook
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {store?.name}.
          {!store?.allowsCustomBranding && (
            <> Powered by <span className="text-slate-400 font-medium">Silarai</span></>
          )}
        </div>
      </footer>
    </div>
  );
}

