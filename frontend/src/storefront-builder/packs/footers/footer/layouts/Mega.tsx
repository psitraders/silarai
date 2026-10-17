import { useCategories } from '../../../../core/data/hooks';
import { useStorefront } from '../../../../core/storefront-context';
import type { LayoutProps } from '../../../../core/types';
import type { FooterSettings } from '../manifest';
import { Brand, Column, Contact, Copyright, Payments, Social, TrustStrip } from '../parts/Parts';
import { useFooterColumns } from '../parts/useFooter';

/** Everything: every category, the link columns, contact, trust and payments. */
export default function Mega({ settings }: LayoutProps<FooterSettings>) {
  const { links } = useStorefront();
  const { data: categories = [] } = useCategories();
  const columns = useFooterColumns(settings);
  const catColumn = { id: 'cats', title: 'Categories', links: categories.map(c => ({ id: c.id, label: c.name, href: links.category(c.name) })) };
  return (
    <div>
      <TrustStrip settings={settings} />
      <div className="sf-container grid grid-cols-2 gap-8 py-12 @3xl:grid-cols-5">
        <div className="col-span-2 flex flex-col gap-4">
          <Brand settings={settings} />
          <Social settings={settings} />
        </div>
        {catColumn.links.length > 0 && <Column column={catColumn} />}
        {columns.map(c => <Column key={c.id} column={c} />)}
        <div className="col-span-2 @3xl:col-span-1">
          <h2 className="mb-3 text-sm font-semibold">Contact</h2>
          <Contact settings={settings} />
        </div>
      </div>
      <div className="sf-container flex flex-col items-center justify-between gap-3 py-4 @3xl:flex-row" style={{ borderTop: '1px solid var(--sf-border)' }}>
        <Copyright settings={settings} />
        <Payments settings={settings} />
      </div>
    </div>
  );
}
