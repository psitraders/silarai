import type { LayoutProps } from '../../../../core/types';
import type { NewsletterSettings } from '../manifest';
import { SignupForm } from '../SignupForm';

/** A centred card with the heading and the form. */
export default function Card({ settings, context }: LayoutProps<NewsletterSettings>) {
  return (
    <div className="sf-container sf-section-pad">
      <div className="sf-card mx-auto max-w-xl p-6 text-center @xl:p-10">
        {settings.eyebrow && <p className="sf-eyebrow mb-2">{settings.eyebrow}</p>}
        <h2 className="sf-h2">{settings.heading}</h2>
        {settings.text && <p className="mt-2 sf-muted">{settings.text}</p>}
        <div className="mt-6 text-left"><SignupForm settings={settings} context={context} stacked /></div>
      </div>
    </div>
  );
}
