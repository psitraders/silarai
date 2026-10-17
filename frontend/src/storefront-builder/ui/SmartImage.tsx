import { ImageIcon } from 'lucide-react';
import { optimizeImage } from '../../utils/imageUrl';
import { readImage } from '../core/smart';

const WIDTHS = [480, 800, 1200, 1800];

/**
 * A merchant image (`$image`) with responsive sources and reserved space.
 * Without an image it draws a neutral placeholder so layouts keep their shape.
 */
export function SmartImage({ value, alt, className = '', imgClassName = '', sizes = '100vw', eager = false, maxWidth = 1800, rounded = true, fill = false }: {
  value: unknown;
  alt: string;
  /** Wrapper classes — set the aspect ratio / size here. */
  className?: string;
  imgClassName?: string;
  sizes?: string;
  eager?: boolean;
  maxWidth?: number;
  rounded?: boolean;
  /** Cover the nearest positioned parent (background images). */
  fill?: boolean;
}) {
  const src = readImage(value);
  const widths = WIDTHS.filter(w => w <= maxWidth);
  return (
    <div className={`${fill ? 'absolute inset-0' : 'relative'} overflow-hidden sf-placeholder ${rounded ? 'sf-img' : ''} ${className}`}>
      {src ? (
        <img
          src={optimizeImage(src, widths[widths.length - 1] ?? 800)}
          srcSet={widths.map(w => `${optimizeImage(src, w)} ${w}w`).join(', ')}
          sizes={sizes}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : undefined}
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover sf-zoom ${imgClassName}`}
        />
      ) : fill ? null : (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <ImageIcon className="h-8 w-8 sf-muted opacity-40" />
        </div>
      )}
    </div>
  );
}
