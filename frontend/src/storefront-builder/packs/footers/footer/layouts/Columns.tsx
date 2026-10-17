import type { LayoutProps } from '../../../../core/types';
import type { FooterSettings } from '../manifest';
import { AccordionColumn, Brand, Contact, Copyright, Payments, Social, TrustStrip } from '../parts/Parts';
import { useFooterColumns } from '../parts/useFooter';

/** Brand column + link columns + contact. Link columns become accordions on phones. */
export default function Columns({ settings }: LayoutProps<FooterSettings>) {
  const columns = useFooterColumns(settings);
  return (
    <div>
      <TrustStrip settings={settings} />
      <div className="sf-container grid grid-cols-1 gap-8 py-10 @3xl:grid-cols-[2fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-4">
          <Brand settings={settings} />
          <Social settings={settings} />
        </div>
        <div className="@3xl:col-span-2 @3xl:grid @3xl:grid-cols-2 @3xl:gap-8">
          {columns.map(c => <AccordionColumn key={c.id} column={c} />)}
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">Contact us</h2>
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
