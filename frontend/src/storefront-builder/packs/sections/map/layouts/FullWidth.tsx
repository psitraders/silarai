import type { LayoutProps } from '../../../../core/types';
import type { MapSettings } from '../manifest';
import { MapEmbed } from '../MapEmbed';

export default function FullWidth({ settings }: LayoutProps<MapSettings>) {
  return (
    <div>
      {settings.heading && <div className="sf-container pt-10 pb-6"><h2 className="sf-h2">{settings.heading}</h2>{settings.note && <p className="mt-2 sf-muted">{settings.note}</p>}</div>}
      <MapEmbed address={settings.address} height={settings.height} rounded={false} />
    </div>
  );
}
