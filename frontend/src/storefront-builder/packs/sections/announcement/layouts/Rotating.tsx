import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import type { AnnouncementSettings } from '../manifest';
import { useMessages } from '../messages';
import { Strip } from '../Strip';

/** Messages take turns every 4 s (paused for reduced motion), with arrows for manual control. */
export default function Rotating({ settings, context }: LayoutProps<AnnouncementSettings>) {
  const messages = useMessages(settings);
  const [i, setI] = useState(0);
  const count = messages.length;
  useEffect(() => {
    if (count < 2 || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI(n => (n + 1) % count), 4000);
    return () => clearInterval(t);
  }, [count]);
  if (!count) return <EditorHint context={context} text="Add messages." padded={false} />;
  const current = i % count;
  return (
    <div className="sf-container flex items-center gap-2">
      {count > 1 && <button type="button" className="sf-icon-btn h-8 w-8 shrink-0" onClick={() => setI((current - 1 + count) % count)} aria-label="Previous message"><ChevronLeft className="h-4 w-4" aria-hidden /></button>}
      <div className="min-w-0 flex-1" aria-live="polite">
        <Strip settings={settings}><span key={current} className="sf-reveal inline-block">{messages[current]}</span></Strip>
      </div>
      {count > 1 && <button type="button" className="sf-icon-btn h-8 w-8 shrink-0" onClick={() => setI((current + 1) % count)} aria-label="Next message"><ChevronRight className="h-4 w-4" aria-hidden /></button>}
    </div>
  );
}
