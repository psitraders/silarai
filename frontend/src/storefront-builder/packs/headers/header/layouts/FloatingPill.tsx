import type { LayoutProps } from '../../../../core/types';
import type { HeaderSettings } from '../manifest';
import { Actions } from '../parts/Actions';
import { DesktopNav } from '../parts/DesktopNav';
import { HeaderFrame } from '../parts/HeaderFrame';
import { Logo } from '../parts/Logo';
import { useHeaderState } from '../parts/useHeader';
import { useMainMenu } from '../useMenu';

/** A rounded bar floating with a margin (pairs well with the Glass style kit). */
export default function FloatingPill({ settings, scheme }: LayoutProps<HeaderSettings>) {
  const state = useHeaderState();
  const menu = useMainMenu(settings.featuredCategoriesInMenu);
  return (
    <div className="px-3 pt-3" style={{ background: 'transparent' }}>
      <HeaderFrame
        settings={settings}
        state={state}
        menu={menu}
        scheme={scheme}
        barClassName="sf-container overflow-visible shadow-lg"
        barStyle={{ borderRadius: 'calc(var(--sf-radius-lg) + 8px)', border: '1px solid var(--sf-border)' }}
      >
        <div className="flex h-14 items-center gap-3 px-2">
          <Logo settings={settings} />
          <DesktopNav items={menu} className="flex-1" />
          <div className="ml-auto"><Actions settings={settings} state={state} whatsApp="icon" /></div>
        </div>
      </HeaderFrame>
    </div>
  );
}
