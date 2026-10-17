import { useState } from 'react';
import { blocksOf } from '../../../../../core/blocks';
import { useProductList } from '../../../../../core/data/hooks';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { ProductRow } from '../../../../../ui/ProductRow';
import { SectionHeading } from '../../../../../ui/SectionHeading';
import { BUDGET_DEFAULTS, OCCASION_DEFAULTS, type GiftFinderSettings } from '../manifest';

/** Occasion and budget chips; the products below follow the picks (live prices and stock). */
export default function Chips({ settings, blocks, context }: LayoutProps<GiftFinderSettings>) {
  const occasions = blocksOf(blocks, 'occasion', OCCASION_DEFAULTS).filter(o => o.settings.label.trim());
  const budgets = blocksOf(blocks, 'budget', BUDGET_DEFAULTS).filter(b => b.settings.label.trim());
  const [occasion, setOccasion] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);

  const pickedOccasion = occasions.find(o => o.id === occasion)?.settings;
  const pickedBudget = budgets.find(b => b.id === budget)?.settings;
  const categoryId = pickedOccasion?.category?.$categories?.source === 'manual' ? pickedOccasion.category.$categories.categoryIds?.[0] ?? null : null;
  const min = Number(pickedBudget?.min) > 0 ? Number(pickedBudget!.min) : null;
  const max = Number(pickedBudget?.max) > 0 ? Number(pickedBudget!.max) : null;
  const limit = Math.min(Math.max(Number(settings.limit) || 8, 4), 24);
  const list = useProductList({ categoryId, minPrice: min, maxPrice: max, pageSize: limit }, occasions.length + budgets.length > 0);

  if (!occasions.length && !budgets.length) return <EditorHint context={context} text="Add occasions and budgets for shoppers to pick from." />;

  const chipRow = (label: string, items: { id: string; settings: { label: string } }[], value: string | null, set: (v: string | null) => void, anyLabel: string) => (
    <div role="group" aria-label={label} className="sf-scroll-x -mx-4 flex gap-2 px-4 pb-1">
      <button type="button" className="sf-chip shrink-0" aria-pressed={value === null} onClick={() => set(null)}>{anyLabel}</button>
      {items.map(i => (
        <button key={i.id} type="button" className="sf-chip shrink-0" aria-pressed={value === i.id} onClick={() => set(i.id)}>{i.settings.label}</button>
      ))}
    </div>
  );

  const items = list.data?.items ?? [];
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} />
      <div className="mb-6 space-y-3">
        {occasions.length > 0 && chipRow('Occasion', occasions, occasion, setOccasion, 'Any occasion')}
        {budgets.length > 0 && chipRow('Budget', budgets, budget, setBudget, 'Any budget')}
      </div>
      <div aria-live="polite" aria-busy={list.isLoading}>
        {!list.isLoading && !items.length ? (
          <p className="py-10 text-center sf-muted">Nothing matches yet — try another occasion or budget.</p>
        ) : (
          <ProductRow products={items} isLoading={list.isLoading} layout="grid" context={context} label="Gift ideas" skeletons={4} />
        )}
      </div>
    </div>
  );
}
