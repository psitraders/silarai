import type { LayoutProps } from '../../../../core/types';
import type { FooterSettings } from '../manifest';
import { Copyright, LinkItem, Social } from '../parts/Parts';
import { useFooterColumns } from '../parts/useFooter';

export default function MinimalLine({ settings }: LayoutProps<FooterSettings>) {
  const links = useFooterColumns(settings).flatMap(c => c.links).slice(0, 6);
  return (
    <div className="sf-container flex flex-col items-center gap-4 py-6 @3xl:flex-row @3xl:justify-between">
      <Copyright settings={settings} />
      {!!links.length && (
        <nav aria-label="Footer"><ul className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs">{links.map(l => <li key={l.id}><LinkItem link={l} /></li>)}</ul></nav>
      )}
      <Social settings={settings} />
    </div>
  );
}
