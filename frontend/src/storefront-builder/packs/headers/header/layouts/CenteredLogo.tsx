import type { LayoutProps } from '../../../../core/types';
import type { HeaderSettings } from '../manifest';
import { AccountButton, CartButton, MenuButton, SearchButton, WhatsAppButton } from '../parts/Actions';
import { DesktopNav } from '../parts/DesktopNav';
import { HeaderFrame } from '../parts/HeaderFrame';
import { Logo } from '../parts/Logo';
import { useHeaderState } from '../parts/useHeader';
import { useMainMenu } from '../useMenu';

/** Menu left · logo centre · icons right (menu button on the left on phones). */
export default function CenteredLogo({ settings, scheme }: LayoutProps<HeaderSettings>) {
  const state = useHeaderState();
  const menu = useMainMenu(settings.featuredCategoriesInMenu);
  return (
    <HeaderFrame settings={settings} state={state} menu={menu} scheme={scheme}>
      <div className="sf-container grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center">
          <MenuButton state={state} />
          <DesktopNav items={menu} align="start" />
        </div>
        <Logo settings={settings} showName="always" />
        <div className="flex items-center justify-end gap-1">
          <SearchButton settings={{ ...settings, search: settings.search === 'off' ? 'off' : 'icon' }} state={state} />
          <WhatsAppButton settings={settings} compact />
          <AccountButton settings={settings} />
          <CartButton settings={settings} />
        </div>
      </div>
    </HeaderFrame>
  );
}
