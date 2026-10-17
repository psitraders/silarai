/**
 * Commerce actions owned by the store shell (SB-R11). Packs reach the cart, the
 * product view, login and the account panel ONLY through `useShell()` — they never
 * re-implement them (design.md §13 rule 16).
 */
import { createContext, useContext } from 'react';
import type { StoreProduct } from './types';

export interface CartLineOptions {
  unitPrice: number;
  variantInfo?: string;
}

/** Product compare (store behaviour `compare`): up to 4 products, compared in a tray. */
export interface CompareActions {
  ids: string[];
  max: number;
  /** Adds or removes a product (ignored when the tray is full). */
  toggle: (product: StoreProduct) => void;
  /** Opens the comparison table. */
  open: () => void;
}

export interface ShellActions {
  /** Opens the product as popup or page, per the store's product-view setting. */
  openProduct: (product: StoreProduct | string) => void;
  /** `line` carries the chosen variant and its unit price (product blocks); cards add the plain product. */
  addToCart: (product: StoreProduct, quantity?: number, line?: CartLineOptions) => void;
  openCart: () => void;
  cartCount: number;
  openAuth: () => void;
  openAccount: () => void;
  openReturnPolicy: () => void;
  isSignedIn: boolean;
  customerName?: string | null;
  wishlistIds: Set<string>;
  /** Toggles a wishlist item; prompts login when signed out. Resolves to the new state. */
  toggleWishlist: (productId: string) => Promise<boolean>;
  compare: CompareActions;
}

const noop = () => undefined;

/** Inert actions for the dev gallery / editor previews. */
export const PREVIEW_SHELL: ShellActions = {
  openProduct: noop,
  addToCart: noop,
  openCart: noop,
  cartCount: 0,
  openAuth: noop,
  openAccount: noop,
  openReturnPolicy: noop,
  isSignedIn: false,
  wishlistIds: new Set(),
  toggleWishlist: async () => false,
  compare: { ids: [], max: 4, toggle: noop, open: noop },
};

export const ShellContext = createContext<ShellActions>(PREVIEW_SHELL);

export const useShell = () => useContext(ShellContext);

/**
 * Element inside `.sf-root` where packs portal drawers and sheets. Rendering
 * there keeps the theme tokens while escaping transformed / blurred headers
 * (which would otherwise trap `position: fixed`). Null in the dev gallery.
 */
export const OverlayRootContext = createContext<HTMLElement | null>(null);
export const useOverlayRoot = () => useContext(OverlayRootContext);
