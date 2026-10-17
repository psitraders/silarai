/**
 * Storefront builder — the ONLY entry point the rest of the app may import
 * (SB-R6, design.md §13). Everything else in this folder is internal.
 */
export { StorefrontRoute } from './shell/StorefrontRoute';
export type { StorefrontRouteKind } from './shell/StoreShell';

/** The storefront editor (dashboard route). Lazy: its own chunk, incl. @dnd-kit. */
export const loadEditor = () => import('./editor/StorefrontEditor');

/** Dev-only pack gallery (loaded lazily; never requested in production). */
export const loadDevGallery = () => import('./dev/Gallery');
