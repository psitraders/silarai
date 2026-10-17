import type { ReactNode } from 'react';
import {
  ProductControllerContext, ProductSurfaceContext, useProductController, type ProductSurface,
} from '../../core/commerce/useProductController';
import type { StoreProduct } from '../../core/types';

/** Gives product blocks their controller (variants, price, cart) and surface (popup / page). */
export function ProductScope({ product, surface, preview = false, children }: {
  product: StoreProduct;
  surface: ProductSurface;
  preview?: boolean;
  children: ReactNode;
}) {
  const ctl = useProductController(product, preview);
  return (
    <ProductSurfaceContext.Provider value={surface}>
      <ProductControllerContext.Provider value={ctl}>{children}</ProductControllerContext.Provider>
    </ProductSurfaceContext.Provider>
  );
}
