import { useResolvedProducts } from '../../../../core/data/hooks';
import { isVideoUrl } from '../../../../ui/product/blockTypes';
import type { VideoSpotlightSettings } from './manifest';

/** The picked product, its first video and a poster photo. */
export function useSpotlightProduct(settings: VideoSpotlightSettings) {
  const picked = (settings.product?.$products?.productIds?.length ?? 0) > 0 || !!settings.product?.items?.length;
  const { items, isLoading } = useResolvedProducts(picked ? settings.product : undefined);
  const product = items[0] ?? null;
  const media = product?.allImages ?? [];
  const video = media.find(isVideoUrl) ?? null;
  const poster = product?.primaryImage && !isVideoUrl(product.primaryImage) ? product.primaryImage : media.find(u => !isVideoUrl(u)) ?? null;
  return { product, video, poster, isLoading: picked && isLoading };
}
