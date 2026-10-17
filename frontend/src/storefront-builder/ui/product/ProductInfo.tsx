import { ChevronDown } from 'lucide-react';
import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';
import { blockSettings } from '../../core/blocks';
import type { BlockInstance, RenderContext } from '../../core/types';
import { contentLabel, isContentBlock, PRODUCT_BLOCK_DEFAULTS, type ProductBlockType } from './blockTypes';
import { BuyButtonsView, InquiryView, QuantityView, QuoteView, VariantsView, WholesaleView } from './BuyBlocks';
import { AccordionBody, AccordionView, ReviewsView, SizeGuideView } from './ContentBlocks';
import {
  BadgesView, CountdownView, DeliveryView, DescriptionView, ImageView, PriceView, RatingView, ShareView, SpecsView, StockView,
  TextView, TitleView, TrustView,
} from './InfoBlocks';

export type InfoMode = 'plain' | 'tabs' | 'accordion';

/** Renders one product block with its settings merged over the block defaults. */
export function ProductBlock({ block, context, titleAs = 'h1', inTab = false }: { block: BlockInstance; context: RenderContext; titleAs?: 'h1' | 'h2'; inTab?: boolean }) {
  const type = block.type as ProductBlockType;
  const defaults = PRODUCT_BLOCK_DEFAULTS[type];
  if (!defaults) return null;
  const s = blockSettings(defaults as Record<string, unknown>, block) as never;
  switch (type) {
    case 'title': return <TitleView s={s} as={titleAs} />;
    case 'price': return <PriceView s={s} />;
    case 'rating': return <RatingView context={context} />;
    case 'badges': return <BadgesView s={s} context={context} />;
    case 'description': return <DescriptionView s={s} context={context} />;
    case 'variants': return <VariantsView s={s} />;
    case 'quantity': return <QuantityView />;
    case 'buy-buttons': return <BuyButtonsView s={s} context={context} />;
    case 'inquiry': return <InquiryView s={s} />;
    case 'quote': return <QuoteView s={s} context={context} />;
    case 'wholesale': return <WholesaleView context={context} />;
    case 'stock': return <StockView s={s} />;
    case 'delivery': return <DeliveryView s={s} />;
    case 'trust': return <TrustView s={s} />;
    case 'accordion': return inTab ? <AccordionBody s={s} /> : <AccordionView s={s} />;
    case 'size-guide': return <SizeGuideView s={s} context={context} />;
    case 'share': return <ShareView />;
    case 'reviews': return <ReviewsView context={context} />;
    case 'text': return <TextView s={s} context={context} />;
    case 'image': return <ImageView s={s} context={context} />;
    case 'countdown': return <CountdownView s={s} context={context} />;
    case 'specs': return <SpecsView s={s} context={context} />;
    default: return null;
  }
}

/**
 * The product details column: blocks in the merchant's order. `tabs` and
 * `accordion` move long-form blocks (full description, specs, reviews, rows,
 * text) into tabs or collapsible rows under the buying blocks.
 */
export function ProductInfo({ blocks, context, mode = 'plain', only, exclude, titleAs = 'h1', className = '', gap = 'gap-5' }: {
  blocks: BlockInstance[];
  context: RenderContext;
  mode?: InfoMode;
  /** Render only these block types (compact layouts). */
  only?: string[];
  exclude?: string[];
  titleAs?: 'h1' | 'h2';
  className?: string;
  gap?: string;
}) {
  const list = blocks.filter(b => (!only || only.includes(b.type)) && !exclude?.includes(b.type));
  const main = mode === 'plain' ? list : list.filter(b => !isContentBlock(b));
  const content = mode === 'plain' ? [] : list.filter(isContentBlock);

  return (
    <div className={`flex flex-col ${gap} ${className}`}>
      {main.map(b => <ProductBlock key={b.id} block={b} context={context} titleAs={titleAs} />)}
      {content.length > 0 && mode === 'tabs' && <ContentTabs blocks={content} context={context} />}
      {content.length > 0 && mode === 'accordion' && (
        <div style={{ borderTop: '1px solid var(--sf-border)' }}>
          {content.map((b, i) => (
            <Row key={b.id} label={contentLabel(b)} defaultOpen={i === 0}>
              <ProductBlock block={b} context={context} inTab />
            </Row>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, defaultOpen, children }: { label: string; defaultOpen: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div style={{ borderBottom: '1px solid var(--sf-border)' }}>
      <button type="button" className="flex w-full items-center justify-between gap-3 py-3.5 text-left font-semibold" aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>
        {label}
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      <div id={id} hidden={!open} className="pb-4">{children}</div>
    </div>
  );
}

function ContentTabs({ blocks, context }: { blocks: BlockInstance[]; context: RenderContext }) {
  const [active, setActive] = useState(0);
  const base = useId();
  const current = Math.min(active, blocks.length - 1);
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (current + (e.key === 'ArrowRight' ? 1 : -1) + blocks.length) % blocks.length;
    setActive(next);
    (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
  };
  return (
    <div>
      <div role="tablist" aria-label="Product information" className="sf-scroll-x flex gap-1" style={{ borderBottom: '1px solid var(--sf-border)' }}>
        {blocks.map((b, i) => (
          <button
            key={b.id}
            type="button"
            role="tab"
            id={`${base}-tab-${i}`}
            aria-selected={i === current}
            aria-controls={`${base}-panel-${i}`}
            tabIndex={i === current ? 0 : -1}
            onKeyDown={onKey}
            onClick={() => setActive(i)}
            className="shrink-0 whitespace-nowrap px-3 py-2.5 text-sm font-semibold transition-colors"
            style={{ boxShadow: i === current ? 'inset 0 -2px 0 var(--sf-text)' : undefined, opacity: i === current ? 1 : 0.65 }}
          >
            {contentLabel(b)}
          </button>
        ))}
      </div>
      {blocks.map((b, i) => (
        <div key={b.id} role="tabpanel" id={`${base}-panel-${i}`} aria-labelledby={`${base}-tab-${i}`} hidden={i !== current} className="pt-4">
          <ProductBlock block={b} context={context} inTab />
        </div>
      ))}
    </div>
  );
}
