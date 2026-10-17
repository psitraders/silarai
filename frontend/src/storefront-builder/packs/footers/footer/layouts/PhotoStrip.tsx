import { blocksOf } from '../../../../core/blocks';
import { useLinkReader, useStorefront } from '../../../../core/storefront-context';
import type { LayoutProps } from '../../../../core/types';
import { SmartImage } from '../../../../ui/SmartImage';
import { SmartLinkAnchor } from '../../../../ui/SmartLinkAnchor';
import { PHOTO_DEFAULTS, type FooterSettings } from '../manifest';
import { Copyright, LinkItem, Social } from '../parts/Parts';
import { useFooterColumns } from '../parts/useFooter';

/** A row of photos (Instagram-style, add them as "Photo strip" items) above a simple footer. */
export default function PhotoStrip({ settings, blocks, context }: LayoutProps<FooterSettings>) {
  const readStoreLink = useLinkReader();
  const { store } = useStorefront();
  const photos = blocksOf(blocks, 'photo', PHOTO_DEFAULTS);
  const links = useFooterColumns(settings).flatMap(c => c.links);
  const handle = store.instagramHandle?.replace('@', '');
  return (
    <div>
      {(photos.length > 0 || context.mode !== 'live') && (
        <div>
          {handle && (
            <p className="sf-container py-4 text-center text-sm font-semibold">
              <a className="sf-link" href={`https://instagram.com/${handle}`} target="_blank" rel="noopener noreferrer">@{handle}</a>
            </p>
          )}
          <ul className="grid grid-cols-3 @3xl:grid-cols-6">
            {(photos.length ? photos : Array.from({ length: 6 }, (_, i) => ({ id: `p${i}`, settings: PHOTO_DEFAULTS }))).slice(0, 6).map(({ id, settings: p }) => {
              const href = readStoreLink(p.link);
              const img = <SmartImage value={p.image} alt="" rounded={false} className="aspect-square" sizes="(min-width: 768px) 17vw, 33vw" maxWidth={480} />;
              return <li key={id}>{href ? <SmartLinkAnchor href={href} className="block">{img}</SmartLinkAnchor> : img}</li>;
            })}
          </ul>
        </div>
      )}
      <div className="sf-container flex flex-col items-center gap-5 py-10 text-center">
        <p className="text-lg font-bold" style={{ fontFamily: 'var(--sf-font-heading)' }}>{store.name}</p>
        {!!links.length && <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">{links.map(l => <li key={l.id}><LinkItem link={l} /></li>)}</ul>}
        <Social settings={settings} />
        <Copyright settings={settings} />
      </div>
    </div>
  );
}
