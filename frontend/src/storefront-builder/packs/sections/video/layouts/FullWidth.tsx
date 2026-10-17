import type { LayoutProps } from '../../../../core/types';
import type { VideoSettings } from '../manifest';
import { Player } from '../Player';

export default function FullWidth({ settings }: LayoutProps<VideoSettings>) {
  return (
    <div>
      {(settings.eyebrow || settings.heading) && (
        <div className="sf-container pt-10 text-center">
          {settings.eyebrow && <p className="sf-eyebrow mb-2">{settings.eyebrow}</p>}
          {settings.heading && <h2 className="sf-h2">{settings.heading}</h2>}
        </div>
      )}
      <div className={settings.heading ? 'pt-8' : ''}>
        <Player url={settings.url} poster={settings.poster} title={settings.heading} className="aspect-video [--sf-img-radius:0px] @5xl:aspect-[21/9]" />
      </div>
    </div>
  );
}
