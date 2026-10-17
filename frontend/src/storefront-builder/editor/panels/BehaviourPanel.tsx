import { Eye, Pencil } from 'lucide-react';
import type { CartOptions, PackKind, StoreBehaviour } from '../../core/types';
import { editorPacks } from '../packs';
import { useEditor } from '../state/store';
import { FieldLabel, INPUT, Segmented, Toggle } from '../ui/controls';
import { Thumb } from '../ui/Thumb';

const CART_DEFAULTS: CartOptions = { freeDeliveryAt: 0, upsell: false, coupon: true, autoOpen: true };

/** Style → Store behaviour: product view, popup layout, card style, cart style and options, floating buttons. */
export function Behaviour() {
  const behaviour = useEditor(s => s.site!.behaviour);
  const updateSite = useEditor(s => s.updateSite);
  const setCurrentPage = useEditor(s => s.setCurrentPage);
  const setLeftTab = useEditor(s => s.setLeftTab);
  const popupPreview = useEditor(s => s.popupPreview);
  const setPopupPreview = useEditor(s => s.setPopupPreview);
  const set = <K extends keyof StoreBehaviour>(key: K, value: StoreBehaviour[K]) => updateSite(s => { s.behaviour[key] = value; });
  const cart = { ...CART_DEFAULTS, ...behaviour.cart };
  const setCart = <K extends keyof CartOptions>(key: K, value: CartOptions[K]) => updateSite(s => { s.behaviour.cart = { ...CART_DEFAULTS, ...s.behaviour.cart, [key]: value }; });
  const editProductPage = () => { setCurrentPage('product'); setLeftTab('sections'); };

  return (
    <div className="space-y-6">
      <section className="space-y-3" aria-labelledby="sb-pv">
        <p id="sb-pv" className="text-sm font-semibold text-slate-800">When a shopper taps a product</p>
        <Segmented
          label="Product view"
          value={behaviour.productView}
          options={[{ value: 'popup', label: 'Popup' }, { value: 'page', label: 'Full page' }, { value: 'both', label: 'Popup + page' }]}
          onChange={v => set('productView', v)}
          size="sm"
        />
        <p className="text-xs text-slate-500">
          {behaviour.productView === 'popup' && 'Products open in a quick-view popup over the page.'}
          {behaviour.productView === 'page' && 'Products open on their own page.'}
          {behaviour.productView === 'both' && 'A popup opens first, with a “View full details” link to the product page.'}
          {' '}Both use the blocks of your Product page.
        </p>
        <button type="button" onClick={editProductPage} className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium theme-text hover:underline">
          <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit the product page
        </button>
      </section>

      {behaviour.productView !== 'page' && (
        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800">Popup layout</p>
            <button type="button" onClick={() => setPopupPreview(!popupPreview)} aria-pressed={popupPreview} className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${popupPreview ? 'theme-bg theme-text' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Eye className="h-3.5 w-3.5" aria-hidden /> {popupPreview ? 'Hide preview' : 'Preview popup'}
            </button>
          </div>
          <ThumbChoice kind="quickview" packId="quickview" value={behaviour.quickviewLayout} onChange={v => { set('quickviewLayout', v); setPopupPreview(true); }} label="Popup layout" />
        </section>
      )}

      <section className="space-y-2">
        <p className="text-sm font-semibold text-slate-800">Product cards</p>
        <p className="text-xs text-slate-500">Used by every product section (each section can override it).</p>
        <ThumbChoice kind="card" packId="card" value={behaviour.cardStyle} onChange={v => set('cardStyle', v)} label="Card style" />
      </section>

      <section className="space-y-3">
        <p className="text-sm font-semibold text-slate-800">Cart</p>
        <ThumbChoice kind="cart" packId="cart" value={behaviour.cartStyle} onChange={v => set('cartStyle', v)} label="Cart style" />
        <Toggle label="Open the cart when something is added" helper="Off: a short “Added” message with a View cart link." checked={cart.autoOpen} onChange={v => setCart('autoOpen', v)} />
        <Toggle label="Coupon field" checked={cart.coupon} onChange={v => setCart('coupon', v)} />
        <Toggle label="“You may also like” row" helper="Featured products the shopper hasn’t added yet." checked={cart.upsell} onChange={v => setCart('upsell', v)} />
        <div>
          <FieldLabel htmlFor="sb-free-delivery" helper="Shows a progress bar; 0 turns it off. It does not change delivery charges.">Free-delivery goal (₹)</FieldLabel>
          <input
            id="sb-free-delivery"
            type="number"
            min={0}
            step={50}
            value={cart.freeDeliveryAt || ''}
            placeholder="0"
            onChange={e => setCart('freeDeliveryAt', Math.max(0, Math.round(Number(e.target.value) || 0)))}
            className={INPUT}
          />
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-semibold text-slate-800">Floating buttons</p>
        <Toggle label="Back-to-top button" checked={behaviour.backToTop} onChange={v => set('backToTop', v)} />
        <Toggle label="Mobile bottom bar" helper="Cart and WhatsApp buttons fixed at the bottom on phones." checked={behaviour.mobileBottomBar} onChange={v => set('mobileBottomBar', v)} />
      </section>

      <section className="space-y-3">
        <p className="text-sm font-semibold text-slate-800">Compare</p>
        <Toggle label="Product compare" helper="A “Compare” button under product cards and a tray to compare up to 4 products side by side (specs come from “Label: value” lines in descriptions)." checked={!!behaviour.compare} onChange={v => set('compare', v)} />
      </section>
    </div>
  );
}

/** Thumbnail radio grid over a pack's layouts (popup, card and cart styles). */
function ThumbChoice({ kind, packId, value, onChange, label }: { kind: PackKind; packId: string; value: string; onChange: (id: string) => void; label: string }) {
  const pack = editorPacks.get(kind, packId);
  if (!pack) return null;
  const current = pack.layouts[value] ? value : pack.defaultLayout;
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-2">
      {Object.entries(pack.layouts).map(([id, def]) => {
        const active = id === current;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            title={def.description}
            onClick={() => onChange(id)}
            className={`cursor-pointer overflow-hidden rounded-xl border bg-white text-left transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rc-primary)] ${active ? 'theme-border border-2 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}
          >
            <Thumb rects={def.thumb} />
            <span className={`block truncate border-t border-slate-100 px-2 py-1.5 text-xs font-medium ${active ? 'theme-text' : 'text-slate-700'}`}>{def.name}</span>
          </button>
        );
      })}
    </div>
  );
}
