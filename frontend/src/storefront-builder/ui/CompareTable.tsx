import { Plus } from 'lucide-react';
import { useProductDetails } from '../core/data/hooks';
import { useShell } from '../core/shell-context';
import { Price } from './Price';
import { ProductImage } from './ProductImage';
import { isOutOfStock, needsOptions } from './product';
import { parseSpecs } from './product/blockTypes';

/**
 * Products side by side: photo, live price, availability, category and every spec row found in
 * their descriptions ("Label: value" lines). Scrolls sideways inside itself on small screens.
 * Used by the compare tray and the Spec compare section.
 */
export function CompareTable({ ids }: { ids: string[] }) {
  const { addToCart, openProduct } = useShell();
  const { items, isLoading } = useProductDetails(ids);

  if (isLoading && !items.length) return <div className="sf-skeleton h-64 rounded-[var(--sf-radius-md)]" aria-hidden />;
  if (!items.length) return <p className="py-8 text-center sf-muted">These products are no longer available.</p>;

  const specs = items.map(p => parseSpecs(p.description));
  const labels = [...new Set(specs.flatMap(list => list.map(s => s.label)))];
  const cell = 'px-3 py-2.5 align-top text-sm';
  const rowHead = `${cell} sticky left-0 z-10 w-32 text-left text-xs font-semibold uppercase tracking-wide sf-muted`;
  const line = { borderTop: '1px solid var(--sf-border)' };

  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <table className="w-full min-w-[560px] border-collapse">
        <caption className="sr-only">Product comparison</caption>
        <thead>
          <tr>
            <td className={rowHead} style={{ background: 'var(--sf-bg)' }} />
            {items.map(p => (
              <th key={p.id} scope="col" className={`${cell} text-left font-normal`}>
                <button type="button" onClick={() => openProduct(p)} className="block w-full text-left">
                  <ProductImage src={p.primaryImage} alt="" width={240} className="aspect-square w-full max-w-40 rounded-[var(--sf-radius-sm)]" />
                  <span className="mt-2 line-clamp-2 block font-semibold hover:underline">{p.title}</span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr style={line}>
            <th scope="row" className={rowHead} style={{ background: 'var(--sf-bg)' }}>Price</th>
            {items.map(p => <td key={p.id} className={cell}><Price product={p} size="sm" /></td>)}
          </tr>
          <tr style={line}>
            <th scope="row" className={rowHead} style={{ background: 'var(--sf-bg)' }}>Availability</th>
            {items.map(p => (
              <td key={p.id} className={cell} style={{ color: isOutOfStock(p) ? 'var(--sf-danger)' : 'var(--sf-success)' }}>
                {isOutOfStock(p) ? 'Sold out' : 'In stock'}
              </td>
            ))}
          </tr>
          {items.some(p => p.categoryName) && (
            <tr style={line}>
              <th scope="row" className={rowHead} style={{ background: 'var(--sf-bg)' }}>Category</th>
              {items.map(p => <td key={p.id} className={cell}>{p.categoryName ?? '—'}</td>)}
            </tr>
          )}
          {labels.map(label => (
            <tr key={label} style={line}>
              <th scope="row" className={rowHead} style={{ background: 'var(--sf-bg)' }}>{label}</th>
              {specs.map((list, i) => <td key={items[i].id} className={cell}>{list.find(s => s.label === label)?.value ?? '—'}</td>)}
            </tr>
          ))}
          <tr style={line}>
            <td className={rowHead} style={{ background: 'var(--sf-bg)' }} />
            {items.map(p => (
              <td key={p.id} className={cell}>
                {isOutOfStock(p) ? null : needsOptions(p) ? (
                  <button type="button" className="sf-btn sf-btn-secondary sf-btn-sm" onClick={() => openProduct(p)}>Choose options</button>
                ) : (
                  <button type="button" className="sf-btn sf-btn-primary sf-btn-sm" onClick={() => addToCart(p)}><Plus className="h-4 w-4" aria-hidden /> Add</button>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      {!labels.length && <p className="mt-3 text-xs sf-muted">Tip for the store: add “Label: value” lines (e.g. “Battery: 5000 mAh”) to product descriptions to compare specs here.</p>}
    </div>
  );
}
