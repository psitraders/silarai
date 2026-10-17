import { Eye, ShoppingBag } from 'lucide-react';
import { useResolvedProducts } from '../../../../core/data/hooks';
import { useShell } from '../../../../core/shell-context';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { Price } from '../../../../ui/Price';
import { ProductImage } from '../../../../ui/ProductImage';
import { isOutOfStock, needsOptions } from '../../../../ui/product';
import type { ProductSpotlightSettings } from '../manifest';

export function Spotlight({ settings, context, side }: LayoutProps<ProductSpotlightSettings> & { side: 'left' | 'right' }) {
  const shell = useShell();
  const { items, isLoading } = useResolvedProducts(settings.product);
  const product = items[0];
  const Heading = context.isFirst ? 'h1' : 'h2';

  if (isLoading) return <div className="sf-container sf-section-pad"><div className="sf-skeleton sf-img aspect-[16/9]" /></div>;
  if (!product) return <EditorHint context={context} text="Choose a product to spotlight." />;
  const soldOut = isOutOfStock(product);

  return (
    <div className="sf-container sf-section-pad">
      <div className="grid items-center gap-8 @3xl:grid-cols-2 @3xl:gap-14">
        <button type="button" onClick={() => shell.openProduct(product)} className={`sf-card-hover block ${side === 'right' ? '@3xl:order-2' : ''}`} aria-label={`View ${product.title}`}>
          <ProductImage src={product.primaryImage} alt={product.title} width={900} eager={context.isFirst} className="sf-img aspect-square" />
        </button>
        <div className="flex flex-col items-start gap-4">
          {settings.eyebrow && <span className="sf-badge">{settings.eyebrow}</span>}
          <Heading className="sf-h2">{settings.heading.trim() || product.title}</Heading>
          <Price product={product} size="lg" />
          {(settings.text.trim() || product.description) && (
            <p className="line-clamp-5 whitespace-pre-line sf-muted">{settings.text.trim() || product.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-3">
            <button type="button" className="sf-btn sf-btn-primary" disabled={soldOut} onClick={() => (needsOptions(product) ? shell.openProduct(product) : shell.addToCart(product))}>
              <ShoppingBag className="h-4 w-4" aria-hidden /> {soldOut ? 'Out of stock' : needsOptions(product) ? 'Choose options' : settings.buttonLabel || 'Add to cart'}
            </button>
            <button type="button" className="sf-btn sf-btn-secondary" onClick={() => shell.openProduct(product)}>
              <Eye className="h-4 w-4" aria-hidden /> View details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
