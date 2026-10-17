import { SmartImage } from '../../../ui/SmartImage';
import { SmartLinkAnchor } from '../../../ui/SmartLinkAnchor';
import type { GalleryImageBlock } from './manifest';
import { useLinkReader } from '../../../core/storefront-context';

export function Tile({ img, className }: { img: GalleryImageBlock; className: string }) {
  const readStoreLink = useLinkReader();
  const href = readStoreLink(img.link);
  const body = (
    <figure className="group">
      <SmartImage value={img.image} alt={img.caption} sizes="(min-width: 768px) 33vw, 50vw" className={className} />
      {img.caption && <figcaption className="mt-2 text-sm sf-muted">{img.caption}</figcaption>}
    </figure>
  );
  return href ? <SmartLinkAnchor href={href} className="sf-card-hover block">{body}</SmartLinkAnchor> : body;
}
