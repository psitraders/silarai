import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { LayoutDef, PackKind, PackManifest, Settings } from '../types';
import { registry } from '../registry';

const cache = new Map<string, unknown>();

/** One React.lazy component per pack-layout, created once and reused. */
export function lazyLayout<P>(kind: PackKind, packId: string, layoutId: string, def: LayoutDef<P>): LazyExoticComponent<ComponentType<P>> {
  const key = `${kind}:${packId}:${layoutId}`;
  let component = cache.get(key) as LazyExoticComponent<ComponentType<P>> | undefined;
  if (!component) {
    component = lazy(def.load);
    cache.set(key, component);
  }
  return component;
}

export interface ResolvedPack<S, P> {
  manifest: PackManifest<S, P>;
  layoutId: string;
  Component: LazyExoticComponent<ComponentType<P>>;
}

/** Finds a pack + layout (falling back to the pack's default layout). */
export function resolvePack<S, P>(kind: PackKind, packId: string, layoutId?: string): ResolvedPack<S, P> | null {
  const manifest = registry.getPack<S, P>(kind, packId);
  if (!manifest) return null;
  const id = layoutId && manifest.layouts[layoutId] ? layoutId : manifest.defaultLayout;
  const def = manifest.layouts[id] ?? Object.values(manifest.layouts)[0];
  if (!def) return null;
  return { manifest, layoutId: id, Component: lazyLayout(kind, packId, id, def) };
}

/**
 * Defaults + saved settings, run through the pack's upgrade() when saved with an older
 * version (SB-R3). Instances without `v` predate versioning and count as version 1.
 */
export function effectiveSettings<S, P>(manifest: PackManifest<S, P>, saved: Settings | undefined, savedVersion?: number): S {
  let settings: Settings = saved ?? {};
  const from = savedVersion ?? 1;
  if (manifest.upgrade && saved && from < manifest.version) {
    settings = manifest.upgrade(settings, from);
  }
  return { ...(manifest.defaults as Settings), ...settings } as S;
}
