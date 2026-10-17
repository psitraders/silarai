import { Check, Heart, Plus, ShoppingBag } from 'lucide-react';
import { optimizeImage } from '../../../../../utils/imageUrl';
import type { StoreProduct } from '../../../../core/types';
import { FoodMark } from '../../../../ui/FoodMark';
import { ProductImage } from '../../../../ui/ProductImage';
import type { CardState } from './useCard';

/** Product photo (with the optional second image on hover) that opens the product. */
export function CardImage({ product, card, eager, className = '', width = 420, rounded = '' }: {
  product: StoreProduct; card: CardState; eager: boolean; className?: string; width?: number; rounded?: string;
}) {
  return (
    <button type="button" onClick={card.open} className={`relative block w-full overflow-hidden text-left ${rounded}`} aria-label={`View ${product.title}`}>
      <ProductImage src={product.primaryImage} alt={product.title} width={width} eager={eager} className={`${className || card.ratio} ${rounded}`} imgClassName={card.secondImage ? 'group-hover:opacity-0' : ''} />
      {card.secondImage && (
        <img src={optimizeImage(card.secondImage, width)} alt="" loading="lazy" decoding="async" className="sf-zoom absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100" />
      )}
    </button>
  );
}

export function Badges({ card, className = '' }: { card: CardState; className?: string }) {
  if (!card.badges.length && !card.foodMark) return null;
  return (
    <div className={`pointer-events-none absolute top-2 z-10 flex flex-col gap-1 ${card.badgeSide} ${className}`}>
      {card.badges.map(b => <span key={b.text} className={`sf-badge ${b.neutral ? 'sf-badge-neutral' : ''}`}>{b.text}</span>)}
      {card.foodMark && <FoodMark product={card.foodMark} />}
    </div>
  );
}

export function WishlistButton({ product, card, className = '' }: { product: StoreProduct; card: CardState; className?: string }) {
  if (!card.style.productWishlist) return null;
  return (
    <button
      type="button"
      onClick={() => { void card.shell.toggleWishlist(product.id); }}
      aria-pressed={card.liked}
      aria-label={card.liked ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`}
      className={`absolute top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full shadow-md ${card.heartSide} ${className}`}
      style={{ background: 'color-mix(in srgb, var(--sf-surface) 92%, transparent)', color: card.liked ? 'var(--sf-danger)' : 'var(--sf-muted)' }}
    >
      <Heart className={`h-4 w-4 ${card.liked ? 'fill-current' : ''}`} aria-hidden />
    </button>
  );
}

/** Full-width add button (or "Choose options" / "Out of stock"); hidden when quick add is off. */
export function AddButton({ product, card, variant = 'primary', force = false }: { product: StoreProduct; card: CardState; variant?: 'primary' | 'secondary'; force?: boolean }) {
  if (!card.style.productQuickAdd && !force) return null;
  if (card.soldOut) {
    return <p className="mt-1 rounded-[var(--sf-btn-radius)] py-2 text-center text-xs font-semibold sf-muted" style={{ border: '1px solid var(--sf-border)' }}>Out of stock</p>;
  }
  return (
    <button type="button" onClick={card.add} className={`sf-btn sf-btn-${variant} sf-btn-sm sf-btn-block mt-1`} aria-live="polite" aria-label={card.options ? `Choose options for ${product.title}` : undefined}>
      {card.added ? <><Check className="h-4 w-4" aria-hidden /> Added</>
        : card.options ? <>Choose options</>
        : <><Plus className="h-4 w-4" aria-hidden /> Add to cart</>}
    </button>
  );
}

/** Round "+" button over the image (compact / overlay cards). */
export function AddIcon({ product, card, className = '' }: { product: StoreProduct; card: CardState; className?: string }) {
  if (!card.style.productQuickAdd || card.soldOut) return null;
  return (
    <button
      type="button"
      onClick={card.add}
      className={`sf-icon-btn z-10 shadow-md ${className}`}
      style={{ background: 'var(--sf-button)', color: 'var(--sf-on-button)', width: 36, height: 36 }}
      aria-label={card.options ? `Choose options for ${product.title}` : `Add ${product.title} to cart`}
    >
      {card.added ? <Check className="h-4 w-4" aria-hidden /> : card.options ? <ShoppingBag className="h-4 w-4" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
    </button>
  );
}

export function Title({ product, card, className = '' }: { product: StoreProduct; card: CardState; className?: string }) {
  return (
    <h3 className={`font-bold leading-snug ${card.titleClamp} ${className}`}>
      <button type="button" onClick={card.open} className="text-left hover:underline">{product.title}</button>
    </h3>
  );
}
