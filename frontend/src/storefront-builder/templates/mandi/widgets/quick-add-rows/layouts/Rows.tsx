import { useResolvedCategories } from '../../../../../core/data/hooks';
import type { LayoutProps } from '../../../../../core/types';
import { EditorHint } from '../../../../../ui/EditorHint';
import { SectionHeading } from '../../../../../ui/SectionHeading';
import { CategoryProducts } from '../CategoryProducts';
import type { QuickAddRowsSettings } from '../manifest';

/** Products by category as +/− rows, for fast repeat adds. */
export default function Rows({ settings, context }: LayoutProps<QuickAddRowsSettings>) {
  const { items, isLoading } = useResolvedCategories(settings.categories);
  if (!isLoading && !items.length) return <EditorHint context={context} text="Add product categories to fill these rows." />;
  const limit = Math.min(Math.max(Number(settings.perCategory) || 6, 2), 12);
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} />
      <div className="space-y-10">
        {items.map(c => <CategoryProducts key={c.id} category={c} limit={limit} viewAll={settings.showViewAll} layout="rows" context={context} />)}
      </div>
    </div>
  );
}
