import type { LayoutProps } from '../../../../../core/types';
import { CompareTable } from '../../../../../ui/CompareTable';
import { EditorHint } from '../../../../../ui/EditorHint';
import { SectionHeading } from '../../../../../ui/SectionHeading';
import type { SpecCompareSettings } from '../manifest';

/** The picked products in a comparison table (live prices; specs from descriptions). */
export default function Table({ settings, context }: LayoutProps<SpecCompareSettings>) {
  const query = settings.products?.$products;
  const ids = (query?.source === 'manual' ? query.productIds ?? [] : settings.products?.items?.map(p => p.id) ?? []).slice(0, 4);
  if (ids.length < 2) return <EditorHint context={context} text="Pick 2 to 4 products to compare." />;
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.subtitle} />
      <CompareTable ids={ids} />
    </div>
  );
}
