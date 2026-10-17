import type { LayoutProps } from '../../../../core/types';
import { SmartImage } from '../../../../ui/SmartImage';
import { EnquiryForm } from '../Form';
import type { EnquiryFormSettings } from '../manifest';

/** A photo on one side, heading and form on the other. */
export default function Split({ settings, context }: LayoutProps<EnquiryFormSettings>) {
  return (
    <div className="sf-container sf-section-pad">
      <div className="grid items-center gap-10 @3xl:grid-cols-2 @3xl:gap-14">
        <SmartImage value={settings.image} alt="" className="aspect-[4/5] @3xl:aspect-auto @3xl:h-full @3xl:min-h-[460px]" sizes="(min-width: 768px) 50vw, 100vw" maxWidth={1200} />
        <div>
          {settings.eyebrow && <p className="sf-eyebrow mb-2">{settings.eyebrow}</p>}
          {settings.heading && <h2 className="sf-h2">{settings.heading}</h2>}
          {settings.text && <p className="mb-6 mt-3 sf-muted">{settings.text}</p>}
          <EnquiryForm settings={settings} context={context} />
        </div>
      </div>
    </div>
  );
}
