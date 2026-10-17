import { ShoppingBag } from 'lucide-react';
import { optimizeImage } from '../../utils/imageUrl';

/** Optimised, space-reserving image with a neutral placeholder (design.md §7). */
export function ProductImage({
  src, alt, width = 480, eager = false, className = '', imgClassName = '',
}: {
  src?: string | null;
  alt: string;
  width?: number;
  eager?: boolean;
  /** Wrapper classes — set the aspect ratio here, e.g. "aspect-square". */
  className?: string;
  imgClassName?: string;
}) {
  return (
    <div className={`relative overflow-hidden sf-placeholder ${className}`}>
      {src ? (
        <img
          src={optimizeImage(src, width)}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={eager ? 'high' : undefined}
          className={`absolute inset-0 h-full w-full object-cover sf-zoom ${imgClassName}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <ShoppingBag className="h-10 w-10 sf-muted opacity-40" />
        </div>
      )}
    </div>
  );
}
