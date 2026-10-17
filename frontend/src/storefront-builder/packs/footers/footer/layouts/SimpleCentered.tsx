import { useStorefront } from '../../../../core/storefront-context';
import type { LayoutProps } from '../../../../core/types';
import type { FooterSettings } from '../manifest';
import { Copyright, LinkItem, Payments, Social } from '../parts/Parts';
import { useFooterColumns } from '../parts/useFooter';

export default function SimpleCentered({ settings }: LayoutProps<FooterSettings>) {
  const { store } = useStorefront();
  const links = useFooterColumns(settings).flatMap(c => c.links);
  return (
    <div className="sf-container flex flex-col items-center gap-6 py-12 text-center">
      {store.logoUrl ? <img src={store.logoUrl} alt={store.name} className="h-10 w-auto max-w-[180px] object-contain" /> : <p className="text-xl font-bold" style={{ fontFamily: 'var(--sf-font-heading)' }}>{store.name}</p>}
      {settings.madeIn && <p className="text-xs font-semibold">{settings.madeIn}</p>}
      {!!links.length && (
        <nav aria-label="Footer">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">{links.map(l => <li key={l.id}><LinkItem link={l} /></li>)}</ul>
        </nav>
      )}
      <Social settings={settings} />
      <Payments settings={settings} className="justify-center" />
      <Copyright settings={settings} />
    </div>
  );
}
