import { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '../../../../../utils/formatCurrency';
import { useShell } from '../../../../core/shell-context';
import { useStorefront } from '../../../../core/storefront-context';
import { useStyleOptions } from '../../../../core/theme/useStyleOptions';
import type { StoreProduct } from '../../../../core/types';
import { discountPercent, displayPrice, foodMarks, isOutOfStock, needsOptions } from '../../../../ui/product';

export const RATIO = { square: 'aspect-square', portrait: 'aspect-[4/5]', landscape: 'aspect-[4/3]' } as const;

/**
 * Everything a card style needs: style options, badges, wishlist and quick add.
 * Products with variants open the product instead of adding ("Choose options").
 */
export function useCard(product: StoreProduct, index: number) {
  const shell = useShell();
  const { store } = useStorefront();
  const style = useStyleOptions();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const soldOut = isOutOfStock(product);
  const discount = discountPercent(product);
  const { amount, compareAt } = displayPrice(product);
  const options = needsOptions(product);
  const saleText =
    style.saleBadge === 'amount' && compareAt != null ? `Save ${formatCurrency(compareAt - amount, store.currency ?? 'INR')}`
    : style.saleBadge === 'text' ? 'Sale'
    : `-${discount}%`;

  const badges: { text: string; neutral?: boolean }[] = [];
  if (soldOut) badges.push({ text: 'Sold out', neutral: true });
  else {
    if (index >= 0 && index < 3) badges.push({ text: `#${index + 1}` });
    if (discount > 0) badges.push({ text: saleText });
    if (product.isFeatured && index < 0 && discount === 0) badges.push({ text: 'Featured' });
  }

  const add = () => {
    if (soldOut) return;
    if (options) { shell.openProduct(product); return; }
    shell.addToCart(product);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 2500);
  };

  const marks = style.foodMarkers ? foodMarks(product) : null;

  return {
    shell,
    style,
    /** The product when its food marks should show (style option + tags), else null. */
    foodMark: marks && (marks.diet || marks.eggless) ? product : null,
    soldOut,
    discount,
    options,
    badges,
    added,
    add,
    open: () => shell.openProduct(product),
    liked: shell.wishlistIds.has(product.id),
    secondImage: style.productSecondImage && product.allImages && product.allImages.length > 1 ? product.allImages[1] : null,
    ratio: RATIO[style.productImageRatio] ?? RATIO.portrait,
    titleClamp: style.productTitleLines === 1 ? 'line-clamp-1' : 'line-clamp-2',
    badgeSide: style.badgePosition === 'right' ? 'right-2 items-end' : 'left-2 items-start',
    heartSide: style.badgePosition === 'right' ? 'left-2' : 'right-2',
  };
}

export type CardState = ReturnType<typeof useCard>;
