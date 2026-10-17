import { ArrowRight } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useProductSurface } from '../../../../core/commerce/useProductController';
import type { QuickviewProps } from '../../../../core/types';
import { Overlay, type OverlayVariant } from '../../../../ui/Overlay';
import { ProductScope } from '../../../../ui/product/ProductScope';

/** Product controller + dialog shell shared by every popup layout. */
export function PopupShell({ props, variant = 'modal', size = 'xl', className = '', style, children }: {
  props: QuickviewProps;
  variant?: OverlayVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <ProductScope product={props.product} surface={{ kind: 'popup', close: props.onClose, openFullPage: props.onViewFull }} preview={props.context.mode !== 'live'}>
      <Overlay onClose={props.onClose} label={props.product.title} variant={variant} size={size} className={className} style={style}>
        {children}
      </Overlay>
    </ProductScope>
  );
}

/** "View full details" — only in the store's "popup + full page" mode. */
export function FullPageLink({ className = '' }: { className?: string }) {
  const surface = useProductSurface();
  if (!surface.openFullPage) return null;
  return (
    <button type="button" onClick={surface.openFullPage} className={`sf-link inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline ${className}`}>
      View full details <ArrowRight className="h-4 w-4" aria-hidden />
    </button>
  );
}

/** Two scrolling columns on wide popups, one scrolling column on phones. */
export function SplitBody({ gallery, info, galleryWidth = '46%', padGallery = true }: { gallery: ReactNode; info: ReactNode; galleryWidth?: string; padGallery?: boolean }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto @3xl:grid @3xl:h-[min(760px,88dvh)] @3xl:overflow-hidden" style={{ gridTemplateColumns: `${galleryWidth} 1fr` }}>
      <div className={`min-w-0 @3xl:overflow-y-auto ${padGallery ? 'p-4 @3xl:p-6' : ''}`}>{gallery}</div>
      <div className="min-w-0 p-5 pt-6 @3xl:overflow-y-auto @3xl:p-8">{info}</div>
    </div>
  );
}
