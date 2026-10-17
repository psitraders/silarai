import type { LayoutProps } from '../../../../core/types';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { MapSettings } from '../manifest';
import { MapEmbed } from '../MapEmbed';

export default function Contained({ settings }: LayoutProps<MapSettings>) {
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading title={settings.heading} subtitle={settings.note} />
      <MapEmbed address={settings.address} height={settings.height} rounded />
    </div>
  );
}
