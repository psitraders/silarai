import { readImage } from '../../../core/smart';
import { SmartLinkAnchor } from '../../../ui/SmartLinkAnchor';
import { optimizeImage } from '../../../../utils/imageUrl';
import type { LogoBlock } from './manifest';
import { useLinkReader } from '../../../core/storefront-context';

export function Logo({ logo, grayscale }: { logo: LogoBlock; grayscale: boolean }) {
  const readStoreLink = useLinkReader();
  const src = readImage(logo.image);
  const href = readStoreLink(logo.link);
  const body = src ? (
    <img src={optimizeImage(src, 320)} alt={logo.name} loading="lazy" decoding="async" className={`h-10 w-auto max-w-[140px] object-contain transition ${grayscale ? 'opacity-70 grayscale hover:opacity-100 hover:grayscale-0' : ''}`} />
  ) : (
    <span className="text-lg font-bold tracking-tight sf-muted" style={{ fontFamily: 'var(--sf-font-heading)' }}>{logo.name}</span>
  );
  return href ? <SmartLinkAnchor href={href} className="inline-flex">{body}</SmartLinkAnchor> : body;
}
