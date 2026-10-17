import type { LayoutProps } from '../../../../core/types';
import type { RichTextSettings } from '../manifest';
import { RichTextBody } from '../RichTextBody';

export default function Narrow({ settings, context }: LayoutProps<RichTextSettings>) {
  return (
    <div className="sf-container sf-section-pad">
      <RichTextBody settings={settings} context={context} wide={false} />
    </div>
  );
}
