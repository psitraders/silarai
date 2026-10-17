import { ChevronDown } from 'lucide-react';
import { optimizeImage } from '../../../../../utils/imageUrl';
import { SmartLinkAnchor } from '../../../../ui/SmartLinkAnchor';
import type { HeaderMenuItem } from '../useMenu';

const LINK = 'inline-flex items-center gap-1 rounded-[var(--sf-radius-sm)] px-3 py-2 text-sm font-medium opacity-80 hover:opacity-100';
const PANEL = 'invisible absolute z-40 opacity-0 shadow-lg transition-opacity duration-(--sf-motion-fast) group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100';
const PANEL_STYLE = { background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', color: 'var(--sf-text)' };

/**
 * Desktop menu with hover / focus dropdowns (keyboard reachable via focus-within).
 * `mega` turns dropdowns into full-width panels with photos and 3rd-level links.
 */
export function DesktopNav({ items, align = 'center', mega = false, className = '' }: {
  items: HeaderMenuItem[];
  align?: 'start' | 'center' | 'end';
  mega?: boolean;
  className?: string;
}) {
  const justify = align === 'start' ? 'justify-start' : align === 'end' ? 'justify-end' : 'justify-center';
  return (
    <nav aria-label="Main" className={`hidden @4xl:flex ${justify} ${className}`}>
      <ul className={`flex flex-wrap items-center gap-1 ${mega ? '' : 'relative'}`}>
        {items.map(item => (
          <li key={item.id} className={`group ${mega ? '' : 'relative'}`}>
            <SmartLinkAnchor href={item.href} className={LINK}>
              {item.label}
              {item.children && <ChevronDown className="h-3 w-3 opacity-60 transition-transform group-hover:rotate-180" aria-hidden />}
            </SmartLinkAnchor>
            {item.children && (mega ? <MegaPanel item={item} /> : <Dropdown items={item.children} />)}
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Dropdown({ items }: { items: HeaderMenuItem[] }) {
  return (
    <ul className={`${PANEL} left-0 top-full mt-1 w-56 rounded-[var(--sf-radius-md)] py-1`} style={PANEL_STYLE}>
      {items.map(c => (
        <li key={c.id} className="group/sub relative">
          <SmartLinkAnchor href={c.href} className="flex items-center justify-between px-4 py-2 text-sm opacity-80 hover:opacity-100">
            {c.label}
            {c.children && <ChevronDown className="h-3 w-3 -rotate-90 opacity-60" aria-hidden />}
          </SmartLinkAnchor>
          {c.children && (
            <ul className="invisible absolute left-full top-0 ml-1 w-52 rounded-[var(--sf-radius-md)] py-1 opacity-0 shadow-lg transition-opacity group-focus-within/sub:visible group-focus-within/sub:opacity-100 group-hover/sub:visible group-hover/sub:opacity-100" style={PANEL_STYLE}>
              {c.children.map(g => (
                <li key={g.id}><SmartLinkAnchor href={g.href} className="block px-4 py-2 text-sm opacity-80 hover:opacity-100">{g.label}</SmartLinkAnchor></li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

function MegaPanel({ item }: { item: HeaderMenuItem }) {
  const children = item.children ?? [];
  const withImages = children.filter(c => c.image).slice(0, 2);
  return (
    <div className={`${PANEL} inset-x-0 top-full`} style={PANEL_STYLE}>
      <div className="sf-container grid grid-cols-4 gap-8 py-8">
        <div className={`${withImages.length ? 'col-span-2' : 'col-span-4'} grid grid-cols-2 content-start gap-x-8 gap-y-5`}>
          {children.map(c => (
            <div key={c.id}>
              <SmartLinkAnchor href={c.href} className="text-sm font-bold hover:underline">{c.label}</SmartLinkAnchor>
              {c.children && (
                <ul className="mt-2 space-y-1.5">
                  {c.children.map(g => <li key={g.id}><SmartLinkAnchor href={g.href} className="text-sm opacity-75 hover:opacity-100">{g.label}</SmartLinkAnchor></li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
        {withImages.map(c => (
          <SmartLinkAnchor key={c.id} href={c.href} className="sf-card-hover group/img block">
            <span className="sf-img relative block aspect-[4/3] overflow-hidden">
              <img src={optimizeImage(c.image!, 400)} alt="" loading="lazy" className="sf-zoom absolute inset-0 h-full w-full object-cover" />
            </span>
            <span className="mt-2 block text-sm font-semibold">{c.label}</span>
          </SmartLinkAnchor>
        ))}
      </div>
    </div>
  );
}
