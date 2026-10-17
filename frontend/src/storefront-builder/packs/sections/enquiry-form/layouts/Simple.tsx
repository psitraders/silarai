import type { LayoutProps } from '../../../../core/types';
import { SectionHeading } from '../../../../ui/SectionHeading';
import { EnquiryForm } from '../Form';
import type { EnquiryFormSettings } from '../manifest';

/** Heading and the form in a centred card. */
export default function Simple({ settings, context }: LayoutProps<EnquiryFormSettings>) {
  return (
    <div className="sf-container sf-section-pad">
      <div className="mx-auto max-w-2xl">
        <SectionHeading eyebrow={settings.eyebrow} title={settings.heading} subtitle={settings.text} align="center" />
        <div className="sf-card p-5 @xl:p-8"><EnquiryForm settings={settings} context={context} /></div>
      </div>
    </div>
  );
}
