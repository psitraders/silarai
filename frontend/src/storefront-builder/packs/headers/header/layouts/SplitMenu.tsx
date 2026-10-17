import type { LayoutProps } from '../../../../core/types';
import type { HeaderSettings } from '../manifest';
import { AccountButton, CartButton, MenuButton, SearchButton } from '../parts/Actions';
import { DesktopNav } from '../parts/DesktopNav';
import { HeaderFrame } from '../parts/HeaderFrame';
import { Logo } from '../parts/Logo';
import { useHeaderState } from '../parts/useHeader';
import { useMainMenu } from '../useMenu';

/** Menu split around a centred logo (first half left, second half right). */
export default function SplitMenu({ settings, scheme }: LayoutProps<HeaderSettings>) {
  const state = useHeaderState();
  const menu = useMainMenu(settings.featuredCategoriesInMenu);
  const half = Math.ceil(menu.length / 2);
  return (
    <HeaderFrame settings={settings} state={state} menu={menu} scheme={scheme}>
      <div className="sf-container grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 @4xl:h-20">
        <div className="flex items-center">
          <MenuButton state={state} />
          <DesktopNav items={menu.slice(0, half)} align="end" className="flex-1" />
        </div>
        <Logo settings={settings} showName="always" />
        <div className="flex items-center justify-end gap-1">
          <DesktopNav items={menu.slice(half)} align="start" className="mr-auto" />
          <SearchButton settings={{ ...settings, search: settings.search === 'off' ? 'off' : 'icon' }} state={state} />
          <AccountButton settings={settings} />
          <CartButton settings={settings} />
        </div>
      </div>
    </HeaderFrame>
  );
}
