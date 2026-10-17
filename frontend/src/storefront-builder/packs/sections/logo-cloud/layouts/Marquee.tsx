import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { Logo } from '../Logo';
import { useLogos } from '../logos';
import type { LogoCloudSettings } from '../manifest';

/** Logos drift slowly; the duplicate set is hidden from screen readers. Stops under reduced motion. */
export default function Marquee({ settings, blocks, context }: LayoutProps<LogoCloudSettings>) {
  const logos = useLogos(blocks);
  if (!logos.length) return <EditorHint context={context} text="Add logos to this section." />;
  return (
    <div className="py-10">
      {settings.heading && <h2 className="sf-eyebrow mb-6 text-center" style={{ color: 'var(--sf-muted)' }}>{settings.heading}</h2>}
      <div className="overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
        <div className="sf-marquee">
          {[0, 1].map(copy => (
            <ul key={copy} className="inline-flex items-center gap-16 pr-16 align-middle" aria-hidden={copy === 1}>
              {logos.map(({ id, settings: l }) => <li key={id} className="inline-flex"><Logo logo={l} grayscale={settings.grayscale} /></li>)}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
