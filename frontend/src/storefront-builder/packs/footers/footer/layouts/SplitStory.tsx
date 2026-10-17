import type { LayoutProps } from '../../../../core/types';
import type { FooterSettings } from '../manifest';
import { AccordionColumn, Brand, Copyright, Payments, Social } from '../parts/Parts';
import { useFooterColumns } from '../parts/useFooter';

export default function SplitStory({ settings }: LayoutProps<FooterSettings>) {
  const columns = useFooterColumns(settings);
  return (
    <div>
      <div className="sf-container grid gap-10 py-12 @3xl:grid-cols-2 @3xl:gap-16">
        <div className="flex flex-col gap-5">
          <Brand settings={settings} size="lg" />
          <Social settings={settings} />
        </div>
        <div className="@3xl:grid @3xl:grid-cols-2 @3xl:gap-8">{columns.map(c => <AccordionColumn key={c.id} column={c} />)}</div>
      </div>
      <div className="sf-container flex flex-col items-center justify-between gap-3 py-4 @3xl:flex-row" style={{ borderTop: '1px solid var(--sf-border)' }}>
        <Copyright settings={settings} />
        <Payments settings={settings} />
      </div>
    </div>
  );
}
