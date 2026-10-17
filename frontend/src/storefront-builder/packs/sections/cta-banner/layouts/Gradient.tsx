import type { LayoutProps } from '../../../../core/types';
import { Content } from '../Content';
import type { CtaBannerSettings } from '../manifest';

export default function Gradient({ settings, context }: LayoutProps<CtaBannerSettings>) {
  return (
    <div className="sf-container sf-section-pad">
      <div
        className="relative overflow-hidden rounded-[var(--sf-radius-lg)] p-8 @3xl:p-12"
        style={{ background: 'linear-gradient(135deg, var(--sf-bg) 0%, var(--sf-gradient-to) 100%)', boxShadow: 'inset 0 0 0 1px var(--sf-border)' }}
      >
        <div aria-hidden className="absolute -right-20 -top-24 h-72 w-72 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, var(--sf-badge), transparent 70%)' }} />
        <div className="relative"><Content settings={settings} context={context} align="start" /></div>
      </div>
    </div>
  );
}
