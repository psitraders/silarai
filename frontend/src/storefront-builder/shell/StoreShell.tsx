/**
 * The store shell (SB-R11): header + footer slots, page content, and everything
 * commerce-related that must exist on every page — product view, cart, sign-in,
 * account, return policy, chatbot, mobile bar — plus head/SEO management.
 * Packs reach these through `useShell()`.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCustomerApi, useStorefrontAuth } from '../../context/StorefrontAuthContext';
import { gtagEvent } from '../core/analytics';
import { CurrentProductContext } from '../core/commerce/currentProduct';
import type { ProductDetail } from '../core/commerce/types';
import { recordRecentlyViewed } from '../core/commerce/recentlyViewed';
import { storefrontApi } from '../core/data/api';
import { PageRenderer } from '../core/renderer/PageRenderer';
import { resolvePack } from '../core/renderer/lazyLayout';
import { ShellContext, type CartLineOptions, type ShellActions } from '../core/shell-context';
import { useStorefront } from '../core/storefront-context';
import type { CartProps, PageLayout, QuickviewProps, RenderContext, StoreProduct } from '../core/types';
import { CompareTray } from './compare/CompareTray';
import { COMPARE_MAX, useCompare } from './compare/useCompare';
import { AddedToast, BackToTop, MobileBottomBar, ReturnPolicyModal, StoreNotFound } from './overlays';
import { applyHead, storeHead, useFavicon, useGa4, useProductJsonLd, useStoreHead } from './seo';
import { ShellFrame } from './ShellFrame';
import { POPUP_CONTEXT, pickProductTemplate, popupContent } from './productTemplate';
import type { StarterLayouts } from './StorefrontRoute';

const CustomerAuthModal = React.lazy(() =>
  import('../../components/storefront/CustomerAuthModal').then(m => ({ default: m.CustomerAuthModal })),
);
const StoreChatbot = React.lazy(() => import('./chatbot/StoreChatbot').then(m => ({ default: m.StoreChatbot })));
const CompareDialog = React.lazy(() => import('./compare/CompareDialog'));
const MyAccountPanel = React.lazy(() =>
  import('../../components/storefront/MyAccountPanel').then(m => ({ default: m.MyAccountPanel })),
);

export type StorefrontRouteKind = 'home' | 'custom' | 'product' | 'category' | 'all-products';

export function StoreShell({ kind, starter, hasPublishedHome }: { kind: StorefrontRouteKind; starter: StarterLayouts; hasPublishedHome: boolean }) {
  const { slug, store, site, version, links, brandColor, productTemplates, preview } = useStorefront();
  const draftKey = preview ? 'draft' : 'live';
  // Saved designs exist once the store has published — or, in a preview, as drafts.
  const hasDesigns = version > 0 || !!preview;
  const { pageSlug, productId } = useParams<{ pageSlug?: string; productId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { addItem, totalItems } = useCart();
  const { customer, isAuthenticated } = useStorefrontAuth();
  const customerApi = useCustomerApi(slug);

  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const compare = useCompare(slug);
  const [compareOpen, setCompareOpen] = useState(false);
  const compareOn = !!site.behaviour.compare;
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showAddedToast = useCallback((title: string) => {
    setToast(`${title} added to your cart`);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);
  const productReturnPath = useRef<string | null>(null);

  // Product view mode (SB-R12): popup over the store, a standalone page, or a popup with "View full details".
  const productView = site.behaviour.productView ?? 'popup';
  const isProductPage = kind === 'product' && productView !== 'popup';

  // ── Page content ───────────────────────────────────────────────────────────
  const pageRequest: { key: string; load: () => Promise<{ layout: PageLayout; seoTitle?: string | null; seoDescription?: string | null; ogImageUrl?: string | null; title?: string } | null> } | null =
    kind === 'custom' && pageSlug ? { key: `page:${pageSlug}`, load: () => storefrontApi.page(slug, pageSlug, version) }
    : (kind === 'home' || (kind === 'product' && !isProductPage)) && hasPublishedHome ? { key: 'page:home', load: () => storefrontApi.page(slug, 'home', version) }
    : (kind === 'category' || kind === 'all-products') && hasDesigns ? { key: 'tpl:collection', load: () => storefrontApi.template(slug, 'collection', version) }
    : null;

  const pageQuery = useQuery({
    queryKey: ['sb-page', slug, pageRequest?.key ?? 'starter', version, draftKey],
    queryFn: () => pageRequest!.load(),
    enabled: !!pageRequest,
    staleTime: 60 * 1000,
  });

  const [product, setProduct] = useState<StoreProduct | null>(null);

  // Standalone product page: the product from the URL (the card's copy shows while the full one loads).
  const routeProduct = (location.state as { product?: StoreProduct } | null)?.product;
  const pageProductQuery = useQuery({
    queryKey: ['sb-product-page', slug, productId],
    queryFn: () => storefrontApi.product(slug, productId!),
    enabled: isProductPage && !!productId,
    staleTime: 5 * 60 * 1000,
    // The card's copy has no variants yet; the product controller loads them.
    placeholderData: routeProduct && (routeProduct.id === productId || routeProduct.slug === productId) ? (routeProduct as ProductDetail) : undefined,
  });
  const pageProduct = isProductPage ? pageProductQuery.data ?? null : null;

  // Product template: the product page, and the blocks every product popup shows. A product can use an
  // extra design (SB-R21); with such designs, the page waits for the product so it knows which one.
  const designFor = product ?? pageProduct;
  const templateId = pickProductTemplate(productTemplates, designFor);
  const needsProduct = !!productTemplates?.length;
  const productTemplateQuery = useQuery({
    queryKey: ['sb-page', slug, `tpl:product:${templateId ?? 'default'}`, version, draftKey],
    queryFn: () => storefrontApi.template(slug, 'product', version, templateId),
    enabled: hasDesigns && (isProductPage || !!product) && (!needsProduct || !!designFor),
    staleTime: 60 * 1000,
  });
  const productLayout = productTemplateQuery.data?.layout ?? starter.product;
  const productTemplateReady = !hasDesigns || !productTemplateQuery.isLoading;

  const starterLayout = kind === 'category' || kind === 'all-products' ? starter.collection : starter.home;
  const page = pageQuery.data;
  const layout: PageLayout | null = kind === 'custom' ? page?.layout ?? null : page?.layout ?? starterLayout;
  const pageKind: RenderContext['page'] = isProductPage ? 'product' : kind === 'custom' ? 'custom' : kind === 'category' || kind === 'all-products' ? 'collection' : 'home';

  // ── Head / SEO ─────────────────────────────────────────────────────────────
  useStoreHead(store, slug);
  useFavicon(store, slug);
  useGa4(store.ga4MeasurementId);
  const viewed = product ?? pageProduct;
  useEffect(() => {
    if (viewed) return; // product view sets its own head
    const base = storeHead(store);
    applyHead(page && kind === 'custom'
      ? { title: page.seoTitle || `${page.title} — ${store.name}`, description: page.seoDescription || base.description, image: page.ogImageUrl || base.image }
      : base);
  }, [store, page, kind, viewed, location.pathname]);

  const { data: rating = null } = useQuery({
    queryKey: ['public-review-summary', slug, viewed?.id],
    queryFn: () => storefrontApi.reviewSummary(slug, viewed!.id),
    enabled: !!viewed,
    staleTime: 2 * 60 * 1000,
  });
  useProductJsonLd(viewed, store, rating);
  useEffect(() => {
    if (!viewed) return;
    const title = `${viewed.title} — ${store.name}`;
    const description = viewed.description || `Buy ${viewed.title} at ${store.name}.`;
    applyHead({ title, description, image: viewed.primaryImage || store.logoUrl, type: 'product' });
  }, [viewed, store]);
  // "Recently viewed" (this browser only).
  const viewedId = viewed?.id;
  useEffect(() => { if (viewedId) recordRecentlyViewed(slug, viewedId); }, [slug, viewedId]);

  // ── Product view ─────────────────────────────────────────────────────────────
  const openProduct = useCallback(async (p: StoreProduct | string) => {
    if (productView === 'page') {
      navigate(links.product(typeof p === 'string' ? { id: p } : p), { state: typeof p === 'string' ? null : { product: p } });
      return;
    }
    const full = typeof p === 'string' ? await storefrontApi.product(slug, p).catch(() => null) : p;
    if (!full) return;
    productReturnPath.current ??= window.location.pathname + window.location.search;
    // Shareable URL without a navigation (same as the old storefront).
    window.history.replaceState(window.history.state, '', links.product(full));
    setProduct(full);
  }, [slug, links, productView, navigate, setProduct]);

  const closeProduct = useCallback(() => {
    setProduct(null);
    const back = productReturnPath.current ?? links.home();
    productReturnPath.current = null;
    window.history.replaceState(window.history.state, '', kind === 'product' && back.includes('/products/') ? links.home() : back);
  }, [kind, links, setProduct]);

  // "Popup + full page" mode: leave the popup for the product page (restore the URL first so Back works).
  const viewFullPage = useCallback(() => {
    if (!product) return;
    const p = product;
    if (productReturnPath.current) window.history.replaceState(window.history.state, '', productReturnPath.current);
    productReturnPath.current = null;
    setProduct(null);
    navigate(links.product(p), { state: { product: p } });
  }, [product, links, navigate, setProduct]);

  // Deep link in popup mode: /products/:id opens the product over the home page.
  useEffect(() => {
    if (kind !== 'product' || !productId || isProductPage) return;
    let alive = true;
    storefrontApi.product(slug, productId)
      .then(p => { if (alive) { productReturnPath.current = links.home(); setProduct(p); } })
      .catch(() => undefined);
    return () => { alive = false; };
  }, [kind, productId, isProductPage, slug, links, setProduct]);

  // ── Cart & wishlist ────────────────────────────────────────────────────────
  const addToCart = useCallback((p: StoreProduct, quantity = 1, line?: CartLineOptions) => {
    const unitPrice = line?.unitPrice ?? p.discountedPrice ?? p.basePrice;
    addItem({
      productId: p.id,
      productTitle: p.title,
      unitPrice,
      primaryImage: p.primaryImage ?? undefined,
      categoryName: p.categoryName ?? undefined,
      stockQuantity: p.stockQuantity ?? undefined,
      variantInfo: line?.variantInfo,
    }, quantity);
    gtagEvent('add_to_cart', {
      currency: store.currency ?? 'INR',
      value: unitPrice * quantity,
      items: [{ item_id: p.id, item_name: p.title, price: unitPrice, quantity }],
    });
    if (site.behaviour.cart?.autoOpen !== false) setCartOpen(true);
    else showAddedToast(p.title);
  }, [addItem, store.currency, site.behaviour.cart?.autoOpen, showAddedToast]);

  const { data: wishlistIds = new Set<string>() } = useQuery({
    queryKey: ['sf-wishlist-ids', slug],
    queryFn: () => customerApi.getWishlist().then(items => new Set(items.map((i: { productId: string }) => i.productId))),
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });

  const toggleWishlist = useCallback(async (productIdToToggle: string) => {
    if (!isAuthenticated) { setAuthOpen(true); return false; }
    const res = await customerApi.toggleWishlist(productIdToToggle);
    qc.invalidateQueries({ queryKey: ['sf-wishlist-ids', slug] });
    qc.invalidateQueries({ queryKey: ['sf-wishlist', slug] });
    return res.isNowWishlisted;
  }, [isAuthenticated, customerApi, qc, slug]);

  const actions = useMemo<ShellActions>(() => ({
    openProduct: p => { void openProduct(p); },
    addToCart,
    openCart: () => setCartOpen(true),
    cartCount: totalItems,
    openAuth: () => setAuthOpen(true),
    openAccount: () => setAccountOpen(true),
    openReturnPolicy: () => setPolicyOpen(true),
    isSignedIn: isAuthenticated,
    customerName: customer?.name ?? null,
    wishlistIds,
    toggleWishlist,
    compare: { ids: compare.items.map(i => i.id), max: COMPARE_MAX, toggle: compare.toggle, open: () => setCompareOpen(true) },
  }), [openProduct, addToCart, totalItems, isAuthenticated, customer?.name, wishlistIds, toggleWishlist, compare.items, compare.toggle]);

  // ── Focus on route change ─────────────────────────────────────────────────
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    window.scrollTo({ top: 0 });
    document.getElementById('sf-main')?.focus({ preventScroll: true });
  }, [location.pathname]);

  const quickview = resolvePack<unknown, QuickviewProps>('quickview', 'quickview', site.behaviour.quickviewLayout);
  const cart = resolvePack<unknown, CartProps>('cart', 'cart', site.behaviour.cartStyle);
  const popup = useMemo(() => popupContent(productLayout, starter.product), [productLayout, starter.product]);
  const scopeId = `store-${slug}`;

  return (
    <ShellContext.Provider value={actions}>
      <ShellFrame
        site={site}
        scopeId={scopeId}
        mode="live"
        page={pageKind}
        bottomPadding={site.behaviour.mobileBottomBar}
        overlays={
          <>
        {product && quickview && productTemplateReady && (
          <Suspense fallback={null}>
            <quickview.Component
              product={product}
              blocks={popup.blocks}
              settings={popup.settings}
              context={POPUP_CONTEXT}
              onClose={closeProduct}
              onViewFull={productView === 'both' ? viewFullPage : undefined}
            />
          </Suspense>
        )}
        {cart && (
          <Suspense fallback={null}>
            <cart.Component open={cartOpen} onClose={() => setCartOpen(false)} />
          </Suspense>
        )}
        {authOpen && (
          <Suspense fallback={null}>
            <CustomerAuthModal slug={slug} themeColor={brandColor} b2bEnabled={store.b2bEnabled !== false} onClose={() => setAuthOpen(false)} />
          </Suspense>
        )}
        {accountOpen && (
          <Suspense fallback={null}>
            <MyAccountPanel
              slug={slug}
              themeColor={brandColor}
              currency={store.currency}
              b2bEnabled={store.b2bEnabled !== false}
              onClose={() => setAccountOpen(false)}
              onAddToCart={(id, title, price, imageUrl) => {
                addItem({ productId: id, productTitle: title, unitPrice: price, primaryImage: imageUrl });
                setAccountOpen(false);
                setCartOpen(true);
              }}
            />
          </Suspense>
        )}
        {policyOpen && <ReturnPolicyModal store={store} onClose={() => setPolicyOpen(false)} />}
        {compareOn && (
          <CompareTray
            items={compare.items}
            onRemove={compare.remove}
            onClear={compare.clear}
            onCompare={() => setCompareOpen(true)}
            aboveMobileBar={site.behaviour.mobileBottomBar}
          />
        )}
        {compareOn && compareOpen && compare.items.length > 0 && (
          <Suspense fallback={null}>
            <CompareDialog ids={compare.items.map(i => i.id)} onClose={() => setCompareOpen(false)} />
          </Suspense>
        )}

        {toast && <AddedToast text={toast} onOpenCart={() => { setToast(null); setCartOpen(true); }} />}
        {site.behaviour.backToTop && <BackToTop />}
        {site.behaviour.mobileBottomBar && <MobileBottomBar store={store} cartCount={totalItems} onOpenCart={() => setCartOpen(true)} />}
        <Suspense fallback={null}>
          <StoreChatbot
            store={store}
            themeColor={brandColor}
            slug={slug}
            onOpenCart={() => setCartOpen(true)}
            onViewProduct={id => { void openProduct(id); }}
            categoryId={null}
            categoryName={null}
            loggedInName={customer?.name ?? null}
            loggedInEmail={customer?.email ?? null}
          />
        </Suspense>
          </>
        }
      >
        {isProductPage ? (
          pageProduct && productTemplateReady ? (
            <CurrentProductContext.Provider value={pageProduct}>
              <PageRenderer layout={productLayout} page="product" />
            </CurrentProductContext.Provider>
          ) : pageProductQuery.isError ? (
            <main id="sf-main" tabIndex={-1}><StoreNotFound title="Product not found" text="This product may have been removed or is no longer available." /></main>
          ) : (
            <main id="sf-main" tabIndex={-1} className="sf-container grid gap-8 py-10 md:grid-cols-2" aria-busy="true">
              <div className="sf-skeleton aspect-[4/5] rounded-xl" aria-hidden />
              <div className="space-y-4" aria-hidden><div className="sf-skeleton h-8 w-3/4 rounded" /><div className="sf-skeleton h-6 w-1/3 rounded" /><div className="sf-skeleton h-24 rounded" /><div className="sf-skeleton h-12 rounded" /></div>
            </main>
          )
        ) : layout ? (
          <PageRenderer layout={layout} page={pageKind} />
        ) : pageQuery.isLoading ? (
          <main id="sf-main" tabIndex={-1} className="sf-container py-16"><div className="sf-skeleton h-64 rounded-xl" aria-hidden /></main>
        ) : (
          <main id="sf-main" tabIndex={-1}><StoreNotFound title="Page not found" text="This page doesn't exist or isn't published yet." /></main>
        )}
      </ShellFrame>
    </ShellContext.Provider>
  );
}
