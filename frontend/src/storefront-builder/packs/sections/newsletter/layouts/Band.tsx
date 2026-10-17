import type { LayoutProps } from '../../../../core/types';
import type { NewsletterSettings } from '../manifest';
import { SignupForm } from '../SignupForm';

/** Text on the left, the form on the right (stacked on phones). */
export default function Band({ settings, context }: LayoutProps<NewsletterSettings>) {
  return (
    <div className="sf-container sf-section-pad">
      <div className="grid items-center gap-6 @3xl:grid-cols-2 @3xl:gap-12">
        <div>
          {settings.eyebrow && <p className="sf-eyebrow mb-2">{settings.eyebrow}</p>}
          <h2 className="sf-h2">{settings.heading}</h2>
          {settings.text && <p className="mt-2 sf-muted">{settings.text}</p>}
        </div>
        <SignupForm settings={settings} context={context} stacked={false} />
      </div>
    </div>
  );
}
