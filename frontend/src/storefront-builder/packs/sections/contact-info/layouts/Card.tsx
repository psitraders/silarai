import { useStorefront } from '../../../../core/storefront-context';
import type { LayoutProps } from '../../../../core/types';
import { EditorHint } from '../../../../ui/EditorHint';
import { hasContactContent } from '../contact';
import { ContactActions, ContactRows } from '../Details';
import type { ContactInfoSettings } from '../manifest';

export default function Card({ settings, context }: LayoutProps<ContactInfoSettings>) {
  const { store } = useStorefront();
  if (!hasContactContent(settings, !!store.whatsAppNumber)) return <EditorHint context={context} text="Add your address, phone, email or hours." />;
  const Heading = context.isFirst ? 'h1' : 'h2';
  return (
    <div className="sf-container sf-section-pad">
      <div className="sf-card mx-auto flex max-w-2xl flex-col gap-6 p-6 @3xl:p-10">
        <div>
          {settings.eyebrow && <p className="sf-eyebrow mb-2">{settings.eyebrow}</p>}
          {settings.heading && <Heading className="sf-h2">{settings.heading}</Heading>}
          {settings.text && <p className="mt-2 sf-muted">{settings.text}</p>}
        </div>
        <ContactRows settings={settings} />
        <ContactActions settings={settings} />
      </div>
    </div>
  );
}
