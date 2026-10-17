import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { Logo } from '../Logo';
import { useLogos } from '../logos';
import type { LogoCloudSettings } from '../manifest';

export default function Row({ settings, blocks, context }: LayoutProps<LogoCloudSettings>) {
  const logos = useLogos(blocks);
  if (!logos.length) return <EditorHint context={context} text="Add logos to this section." />;
  return (
    <div className="sf-container py-10">
      {settings.heading && <h2 className="sf-eyebrow mb-6 text-center" style={{ color: 'var(--sf-muted)' }}>{settings.heading}</h2>}
      <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
        {logos.map(({ id, settings: l }) => <li key={id}><Logo logo={l} grayscale={settings.grayscale} /></li>)}
      </ul>
    </div>
  );
}
