import { useStorefront } from '../../../../core/storefront-context';
import type { LayoutProps } from '../../../../core/types';
import type { FooterSettings } from '../manifest';
import { Column, Copyright, Social } from '../parts/Parts';
import { useAbout, useFooterColumns } from '../parts/useFooter';

/** Links up top and the store name set huge across the bottom (scales with the footer width). */
export default function BigWordmark({ settings }: LayoutProps<FooterSettings>) {
  const { store } = useStorefront();
  const columns = useFooterColumns(settings);
  const about = useAbout(settings);
  return (
    <div className="overflow-hidden">
      <div className="sf-container grid gap-8 pt-12 @3xl:grid-cols-4">
        <div className="flex flex-col gap-4 @3xl:col-span-2">
          {about && <p className="max-w-md text-sm sf-muted">{about}</p>}
          <Social settings={settings} />
        </div>
        {columns.slice(0, 2).map(c => <Column key={c.id} column={c} />)}
      </div>
      <p aria-hidden className="select-none whitespace-nowrap px-2 pt-6 text-center font-black leading-[0.85]" style={{ fontFamily: 'var(--sf-font-heading)', fontSize: `min(${Math.max(8, 100 / Math.max(store.name.length, 4) * 1.6)}cqi, 18rem)`, letterSpacing: '-0.04em' }}>
        {store.name}
      </p>
      <div className="sf-container flex flex-col items-center justify-between gap-2 py-4 @3xl:flex-row" style={{ borderTop: '1px solid var(--sf-border)' }}>
        <Copyright settings={settings} />
        {settings.madeIn && <p className="text-xs sf-muted">{settings.madeIn}</p>}
      </div>
    </div>
  );
}
