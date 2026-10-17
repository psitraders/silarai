import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import type { AnnouncementSettings } from '../manifest';
import { useMessages } from '../messages';
import { Strip } from '../Strip';

export default function Static({ settings, context }: LayoutProps<AnnouncementSettings>) {
  const [first] = useMessages(settings);
  if (!first) return <EditorHint context={context} text="Add a message." padded={false} />;
  return <Strip settings={settings}><span className="sf-container block">{first}</span></Strip>;
}
