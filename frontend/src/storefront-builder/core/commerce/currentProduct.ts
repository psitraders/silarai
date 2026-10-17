import { createContext, useContext } from 'react';
import type { StoreProduct } from '../types';

/**
 * The product a product-template page is showing (`/products/:id` in page mode,
 * or a sample product in the editor). Null on every other page.
 */
export const CurrentProductContext = createContext<StoreProduct | null>(null);

export const useCurrentProduct = () => useContext(CurrentProductContext);
