/**
 * Entry point for every public storefront route (home, custom page, product,
 * category, all products). Loads the store + published site, falls back to the
 * Starter design (SB-R5), provides the storefront contexts and renders the shell.
 */
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { StorefrontAuthProvider } from '../../context/StorefrontAuthContext';
import { storefrontApi } from '../core/data/api';
import { buildStarter as buildStarterDocs } from '../core/templates';
import { StorefrontContext, buildLinks, type StorefrontContextValue } from '../core/storefront-context';
import { resolveTheme } from '../core/theme/buildTheme';
import type { PageLayout, SiteDoc, StoreInfo } from '../core/types';
import { BrandedLoader, StoreNotFound } from './overlays';
import { StoreShell, type StorefrontRouteKind } from './StoreShell';

export function StorefrontRoute({ kind, overrideSlug }: { kind: StorefrontRouteKind; overrideSlug?: string }) {
  const params = useParams<{ slug: string }>();
  const slug = overrideSlug ?? params.slug ?? '';
  return (
    <StorefrontAuthProvider slug={slug}>
      <StorefrontDataGate slug={slug} isCustomDomain={!!overrideSlug} kind={kind} />
    </StorefrontAuthProvider>
  );
}

export interface StarterLayouts { home: PageLayout; collection: PageLayout; product: PageLayout }

function buildStarter(store: StoreInfo): { site: SiteDoc; layouts: StarterLayouts } {
  const built = buildStarterDocs(store);
  return {
    site: built.site,
    layouts: { home: built.home, collection: built.collection ?? { schemaVersion: 1, sections: [] }, product: built.product ?? { schemaVersion: 1, sections: [] } },
  };
}

function StorefrontDataGate({ slug, isCustomDomain, kind }: { slug: string; isCustomDomain: boolean; kind: StorefrontRouteKind }) {
  const storeQuery = useQuery({
    queryKey: ['public-store', slug],
    queryFn: () => storefrontApi.store(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  const siteQuery = useQuery({
    queryKey: ['public-site', slug],
    queryFn: () => storefrontApi.site(slug),
    enabled: !!slug,
    staleTime: 60 * 1000,
  });

  const store = storeQuery.data;
  const published = siteQuery.data;

  const value = useMemo<{ ctx: StorefrontContextValue; starter: StarterLayouts } | null>(() => {
    if (!store) return null;
    const starter = buildStarter(store);
    const site = published?.doc ?? starter.site;
    return {
      starter: starter.layouts,
      ctx: {
        slug,
        isCustomDomain,
        store,
        site,
        brandColor: resolveTheme(site.theme).palette.primary,
        version: published?.version ?? 0,
        isPublished: !!published?.doc,
        navPages: published?.pages ?? [],
        links: buildLinks(slug, isCustomDomain),
      },
    };
  }, [store, published, slug, isCustomDomain]);

  if (storeQuery.isLoading || (siteQuery.isLoading && !published)) {
    return store?.loaderEnabled === false ? null : <BrandedLoader store={store} />;
  }
  if (!value) return <StoreNotFound />;

  return (
    <StorefrontContext.Provider value={value.ctx}>
      <StoreShell kind={kind} starter={value.starter} hasPublishedHome={!!published?.hasHome} />
    </StorefrontContext.Provider>
  );
}
