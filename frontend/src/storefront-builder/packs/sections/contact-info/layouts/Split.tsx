import type { LayoutProps } from '../../../../core/types';
import { SmartImage } from '../../../../ui/SmartImage';
import { ContactActions, ContactRows } from '../Details';
import type { ContactInfoSettings } from '../manifest';

export default function Split({ settings, context }: LayoutProps<ContactInfoSettings>) {
  const Heading = context.isFirst ? 'h1' : 'h2';
  return (
    <div className="sf-container sf-section-pad">
      <div className="grid items-center gap-8 @3xl:grid-cols-2 @3xl:gap-14">
        <SmartImage value={settings.image} alt="" sizes="(min-width: 768px) 50vw, 100vw" className="aspect-[4/3]" />
        <div className="flex flex-col gap-6">
          <div>
            {settings.eyebrow && <p className="sf-eyebrow mb-2">{settings.eyebrow}</p>}
            {settings.heading && <Heading className="sf-h2">{settings.heading}</Heading>}
            {settings.text && <p className="mt-2 sf-muted">{settings.text}</p>}
          </div>
          <ContactRows settings={settings} />
          <ContactActions settings={settings} />
        </div>
      </div>
    </div>
  );
}
