import type { LayoutProps } from '../../../../core/types';
import type { FooterSettings } from '../manifest';
import { AccordionColumn, Brand, Contact, Copyright, Payments, Social } from '../parts/Parts';
import { useFooterColumns } from '../parts/useFooter';

/** Compact, mobile-first footer: every group is a tap-to-open row, on every screen size. */
export default function AppLike({ settings }: LayoutProps<FooterSettings>) {
  const columns = useFooterColumns(settings);
  return (
    <div className="sf-container max-w-2xl py-8">
      <div className="flex items-start justify-between gap-4 pb-4">
        <Brand settings={settings} />
        <Social settings={settings} />
      </div>
      {columns.map(c => <AccordionColumn key={c.id} column={c} alwaysAccordion />)}
      <details className="group" style={{ borderBottom: '1px solid var(--sf-border)' }}>
        <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">Contact</summary>
        <div className="pb-4"><Contact settings={settings} /></div>
      </details>
      <div className="flex flex-col items-center gap-3 pt-6 text-center">
        <Payments settings={settings} className="justify-center" />
        <Copyright settings={settings} />
      </div>
    </div>
  );
}
