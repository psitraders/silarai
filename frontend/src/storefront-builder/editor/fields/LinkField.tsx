import { useId, useMemo, useState } from 'react';
import { readLink } from '../../core/smart';
import { slugify } from '../../core/storefront-context';
import type { SmartLink } from '../../core/types';
import { registry } from '../../core/registry';
import { useCurrentLayout } from '../state/store';
import { usePagesQuery } from '../state/useEditorBoot';
import { FieldLabel, INPUT } from '../ui/controls';
import { useEditorCategories, useProductSearch } from './useStoreData';

type Kind = 'none' | 'home' | 'all' | 'category' | 'page' | 'product' | 'section' | 'url' | 'email' | 'phone';

const KINDS: { value: Kind; label: string }[] = [
  { value: 'none', label: 'No link' },
  { value: 'home', label: 'Home page' },
  { value: 'all', label: 'All products' },
  { value: 'category', label: 'A category' },
  { value: 'page', label: 'One of your pages' },
  { value: 'product', label: 'A product' },
  { value: 'section', label: 'A section on this page' },
  { value: 'url', label: 'Web address' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone call' },
];

/** What kind of link a stored value is (store-relative paths, anchors, URLs). */
function kindOf(href: string): Kind {
  if (!href) return 'none';
  if (href === '/') return 'home';
  if (href === '/products') return 'all';
  if (href.startsWith('/category/')) return 'category';
  if (href.startsWith('/p/')) return 'page';
  if (href.startsWith('/products/')) return 'product';
  if (href.startsWith('#')) return 'section';
  if (href.startsWith('mailto:')) return 'email';
  if (href.startsWith('tel:')) return 'phone';
  return 'url';
}

/**
 * Builds a `$link` value. Internal links are stored store-relative ("/products",
 * "/p/about") so they work on /{slug} and on custom domains alike.
 */
export function LinkField({ label, helper, value, onChange }: { label: string; helper?: string; value: unknown; onChange: (v: SmartLink) => void }) {
  const id = useId();
  const href = readLink(value) ?? '';
  const [kind, setKind] = useState<Kind>(() => kindOf(href));
  const set = (next: string) => onChange({ $link: next });

  const changeKind = (k: Kind) => {
    setKind(k);
    if (k === 'none') set('');
    else if (k === 'home') set('/');
    else if (k === 'all') set('/products');
    else if (kindOf(href) !== k) set(k === 'url' ? 'https://' : k === 'email' ? 'mailto:' : k === 'phone' ? 'tel:' : '');
  };

  return (
    <div>
      <FieldLabel htmlFor={id} helper={helper}>{label}</FieldLabel>
      <select id={id} value={kind} onChange={e => changeKind(e.target.value as Kind)} className={INPUT}>
        {KINDS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
      </select>
      <div className="mt-2">
        {kind === 'category' && <CategoryLink href={href} onChange={set} />}
        {kind === 'page' && <PageLink href={href} onChange={set} />}
        {kind === 'product' && <ProductLink href={href} onChange={set} />}
        {kind === 'section' && <SectionLink href={href} onChange={set} />}
        {kind === 'url' && <input type="url" aria-label="Web address" value={href} onChange={e => set(e.target.value)} placeholder="https://" className={INPUT} />}
        {kind === 'email' && <input type="email" aria-label="Email address" value={href.replace(/^mailto:/, '')} onChange={e => set(`mailto:${e.target.value.trim()}`)} placeholder="hello@yourstore.in" className={INPUT} />}
        {kind === 'phone' && <input type="tel" aria-label="Phone number" value={href.replace(/^tel:/, '')} onChange={e => set(`tel:${e.target.value.replace(/[^\d+]/g, '')}`)} placeholder="+91 98765 43210" className={INPUT} />}
      </div>
    </div>
  );
}

function CategoryLink({ href, onChange }: { href: string; onChange: (v: string) => void }) {
  const { data: categories = [] } = useEditorCategories();
  const options = categories.flatMap(c => [
    { value: `/category/${slugify(c.name)}`, label: c.name },
    ...(c.subCategories ?? []).map(s => ({ value: `/category/${slugify(c.name)}?sub=${slugify(s.name)}`, label: `${c.name} › ${s.name}` })),
  ]);
  return (
    <select aria-label="Category" value={href} onChange={e => onChange(e.target.value)} className={INPUT}>
      <option value="">Choose a category…</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function PageLink({ href, onChange }: { href: string; onChange: (v: string) => void }) {
  const { data: pages = [] } = usePagesQuery();
  const custom = pages.filter(p => p.pageType === 'Custom');
  return (
    <select aria-label="Page" value={href} onChange={e => onChange(e.target.value)} className={INPUT}>
      <option value="">{custom.length ? 'Choose a page…' : 'No pages yet — create one in Pages'}</option>
      {custom.map(p => <option key={p.id} value={`/p/${p.slug}`}>{p.title}{p.isPublished ? '' : ' (hidden)'}</option>)}
    </select>
  );
}

function ProductLink({ href, onChange }: { href: string; onChange: (v: string) => void }) {
  const [search, setSearch] = useState('');
  const { data } = useProductSearch(search);
  const current = href.replace('/products/', '');
  return (
    <div className="space-y-2">
      <input type="search" aria-label="Search products" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" className={INPUT} />
      <select aria-label="Product" value={href} onChange={e => onChange(e.target.value)} className={INPUT} size={Math.min(6, Math.max(2, (data?.items.length ?? 0) + 1))}>
        {current && !data?.items.some(p => (p.slug || p.id) === current) && <option value={href}>Current: {current}</option>}
        {data?.items.map(p => <option key={p.id} value={`/products/${p.slug || p.id}`}>{p.title}</option>)}
      </select>
    </div>
  );
}

function SectionLink({ href, onChange }: { href: string; onChange: (v: string) => void }) {
  const layout = useCurrentLayout();
  const options = useMemo(() => [
    { value: '#all-products', label: 'Product catalogue (All products section)' },
    ...(layout?.sections ?? []).map(s => ({ value: `#section-${s.id}`, label: registry.getPack('section', s.type)?.name ?? s.type })),
  ], [layout]);
  return (
    <select aria-label="Section" value={href} onChange={e => onChange(e.target.value)} className={INPUT}>
      <option value="">Choose a section…</option>
      {options.map((o, i) => <option key={`${o.value}-${i}`} value={o.value}>{o.label}</option>)}
    </select>
  );
}
