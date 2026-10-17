import type { LayoutProps } from '../../../../core/types';
import { CtaLink } from '../../../../ui/CtaLink';
import { SectionHeading } from '../../../../ui/SectionHeading';
import type { VideoSettings } from '../manifest';
import { Player } from '../Player';

export default function Inline({ settings }: LayoutProps<VideoSettings>) {
  return (
    <div className="sf-container sf-section-pad">
      <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.text} align="center" />
      <div className="mx-auto max-w-4xl"><Player url={settings.url} poster={settings.poster} title={settings.heading} /></div>
      <div className="mt-6 flex justify-center"><CtaLink label={settings.buttonLabel} link={settings.buttonLink} /></div>
    </div>
  );
}
