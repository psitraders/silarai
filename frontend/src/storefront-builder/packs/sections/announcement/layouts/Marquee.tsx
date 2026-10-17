import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import type { AnnouncementSettings } from '../manifest';
import { useMessages } from '../messages';
import { Strip } from '../Strip';

export default function Marquee({ settings, context }: LayoutProps<AnnouncementSettings>) {
  const messages = useMessages(settings);
  if (!messages.length) return <EditorHint context={context} text="Add messages." padded={false} />;
  const line = messages.join('   ✦   ');
  return (
    <Strip settings={settings}>
      <span className="sr-only">{messages.join('. ')}</span>
      <span className="sf-marquee" aria-hidden>
        {[0, 1, 2, 3].map(k => <span key={k} className="mx-8">✦ {line}</span>)}
      </span>
    </Strip>
  );
}
