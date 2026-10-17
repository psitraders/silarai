import { BadgeCheck, CreditCard, Truck } from 'lucide-react';
import { useProductCtl } from '../../../../core/commerce/useProductController';
import type { RenderContext } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { parseSpecs } from '../../../../ui/product/blockTypes';
import { ProductGallery } from '../../../../ui/product/Gallery';
import { ProductInfo } from '../../../../ui/product/ProductInfo';
import type { ProductMainProps, ProductMainSettings } from '../manifest';
import { ProductMainFrame } from '../parts/Frame';
import { TwoColumn } from '../parts/TwoColumn';

/** Electronics-style: gallery + details, then a full spec grid and a warranty / EMI strip. */
export default function SpecSheet({ settings, blocks, context }: ProductMainProps) {
  const specsTitle = String(blocks.find(b => b.type === 'specs')?.settings?.title ?? 'Specifications');
  return (
    <ProductMainFrame settings={settings} context={context}>
      <TwoColumn
        gallery={<ProductGallery mode="thumbs-left" ratio={settings.imageRatio === 'portrait' ? 'square' : settings.imageRatio} zoom={settings.zoom} eager />}
        info={<ProductInfo blocks={blocks} context={context} mode={settings.infoStyle} exclude={['specs']} />}
        cols="gallery-wide"
      />
      <Specs title={specsTitle} settings={settings} context={context} />
    </ProductMainFrame>
  );
}

function Specs({ title, settings, context }: { title: string; settings: ProductMainSettings; context: RenderContext }) {
  const { product } = useProductCtl();
  const rows = parseSpecs(product.description);
  const strip = [
    settings.warranty && { icon: BadgeCheck, text: settings.warranty },
    settings.emi && { icon: CreditCard, text: settings.emi },
    { icon: Truck, text: 'Cash on delivery available' },
  ].filter(Boolean) as { icon: typeof Truck; text: string }[];

  return (
    <div className="mt-14">
      <h2 className="sf-h3 mb-4 font-bold">{title}</h2>
      {rows.length ? (
        <dl className="grid overflow-hidden rounded-[var(--sf-radius-md)] text-sm @3xl:grid-cols-2" style={{ border: '1px solid var(--sf-border)' }}>
          {rows.map((r, i) => (
            <div key={r.label} className="grid grid-cols-[42%_1fr] gap-3 px-4 py-3" style={{ borderTop: i ? '1px solid var(--sf-border)' : undefined, background: i % 2 ? 'transparent' : 'color-mix(in srgb, var(--sf-text) 3%, transparent)' }}>
              <dt className="sf-muted">{r.label}</dt>
              <dd className="font-semibold">{r.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <EditorHint context={context} padded={false} text='Specs come from "Label: value" lines in the product description, e.g. "Battery: 5000 mAh".' />
      )}
      <ul className="mt-6 grid gap-3 @xl:grid-cols-3">
        {strip.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3 rounded-[var(--sf-radius-md)] px-4 py-3 text-sm font-semibold" style={{ background: 'color-mix(in srgb, var(--sf-text) 5%, transparent)' }}>
            <Icon className="h-5 w-5 shrink-0 sf-link" aria-hidden /> {text}
          </li>
        ))}
      </ul>
    </div>
  );
}
