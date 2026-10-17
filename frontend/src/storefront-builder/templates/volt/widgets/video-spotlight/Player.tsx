import { optimizeImage } from '../../../../../utils/imageUrl';
import { ProductImage } from '../../../../ui/ProductImage';

/** Native video with controls; nothing downloads until the shopper presses play (no autoplay). */
export function Player({ video, poster, title, className }: { video: string | null; poster: string | null; title: string; className: string }) {
  if (!video) return <ProductImage src={poster} alt={title} width={1200} className={className} />;
  return (
    <video
      className={`${className} w-full bg-black object-cover`}
      src={video}
      poster={poster ? optimizeImage(poster, 1200) : undefined}
      controls
      playsInline
      preload="none"
      aria-label={`Video: ${title}`}
    />
  );
}
