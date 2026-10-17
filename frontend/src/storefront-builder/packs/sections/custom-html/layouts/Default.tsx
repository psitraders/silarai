import { readRichText } from '../../../../core/smart';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { RichText } from '../../../../ui/RichText';
import type { CustomHtmlSettings } from '../manifest';

/** Merchant HTML: sanitised by the server on save and again by DOMPurify before display (SB-R4). */
export default function Default({ settings, context }: LayoutProps<CustomHtmlSettings>) {
  const html = readRichText(settings.html);
  if (!html.trim()) return <EditorHint context={context} text="Paste your HTML in the settings panel." />;
  return (
    <div className="sf-container sf-section-pad">
      <RichText html={html} wide={settings.width === 'wide'} className={settings.width === 'narrow' ? 'mx-auto' : ''} />
    </div>
  );
}
