import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { isExternal } from '../core/smart';

/**
 * Renders a merchant link: internal paths via the router, external ones in a new
 * tab with rel="noopener noreferrer", "#id" as an in-page anchor.
 */
export function SmartLinkAnchor({ href, className, children, onClick, ariaLabel, style }: {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  style?: CSSProperties;
}) {
  if (href.startsWith('#')) {
    return (
      <a
        href={href}
        className={className}
        style={style}
        aria-label={ariaLabel}
        onClick={e => {
          // ownerDocument: also works inside the editor's preview frame.
          const el = e.currentTarget.ownerDocument.getElementById(href.slice(1));
          if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
          onClick?.();
        }}
      >
        {children}
      </a>
    );
  }
  if (isExternal(href)) {
    return (
      <a href={href} className={className} style={style} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} onClick={onClick}>
        {children}
      </a>
    );
  }
  return <Link to={href} className={className} style={style} aria-label={ariaLabel} onClick={onClick}>{children}</Link>;
}
