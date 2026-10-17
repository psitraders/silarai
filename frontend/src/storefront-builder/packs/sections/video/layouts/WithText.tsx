import type { LayoutProps } from '../../../../core/types';
import { CtaLink } from '../../../../ui/CtaLink';
import type { VideoSettings } from '../manifest';
import { Player } from '../Player';

export default function WithText({ settings, context }: LayoutProps<VideoSettings>) {
  const Heading = context.isFirst ? 'h1' : 'h2';
  return (
    <div className="sf-container sf-section-pad">
      <div className="grid items-center gap-8 @3xl:grid-cols-[3fr_2fr] @3xl:gap-14">
        <Player url={settings.url} poster={settings.poster} title={settings.heading} />
        <div className="flex flex-col gap-4">
          {settings.eyebrow && <p className="sf-eyebrow">{settings.eyebrow}</p>}
          {settings.heading && <Heading className="sf-h2">{settings.heading}</Heading>}
          {settings.text && <p className="sf-muted whitespace-pre-line">{settings.text}</p>}
          <div><CtaLink label={settings.buttonLabel} link={settings.buttonLink} /></div>
        </div>
      </div>
    </div>
  );
}
