import type { CSSProperties, ReactNode } from 'react';
import { SmartLinkAnchor } from './SmartLinkAnchor';
import { useLinkReader } from '../core/storefront-context';

/** A merchant button: label + `$link`. Renders nothing when either is missing. */
export function CtaLink({ label, link, variant = 'primary', size, className = '', icon, style }: {
  label: string | undefined;
  link: unknown;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'lg';
  className?: string;
  icon?: ReactNode;
  style?: CSSProperties;
}) {
  const readStoreLink = useLinkReader();
  const href = readStoreLink(link);
  if (!href || !label?.trim()) return null;
  const sizeClass = size === 'sm' ? 'sf-btn-sm' : size === 'lg' ? 'sf-btn-lg' : '';
  return (
    <SmartLinkAnchor href={href} className={`sf-btn sf-btn-${variant} ${sizeClass} ${className}`} style={style}>
      {icon}{label}
    </SmartLinkAnchor>
  );
}
