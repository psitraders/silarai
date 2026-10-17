import type { LayoutProps } from '../../../../core/types';
import type { HeaderSettings } from '../manifest';
import { AccountButton, CartButton, MenuButton, WhatsAppButton } from '../parts/Actions';
import { HeaderFrame } from '../parts/HeaderFrame';
import { Logo } from '../parts/Logo';
import { useHeaderState } from '../parts/useHeader';
import { useMainMenu } from '../useMenu';

/** Menu button · logo · cart. Menu and search live in the drawer on every screen size. */
export default function MinimalDrawer({ settings, scheme }: LayoutProps<HeaderSettings>) {
  const state = useHeaderState();
  const menu = useMainMenu(settings.featuredCategoriesInMenu);
  return (
    <HeaderFrame settings={settings} state={state} menu={menu} scheme={scheme}>
      <div className="sf-container grid h-16 grid-cols-[1fr_auto_1fr] items-center">
        <div><MenuButton state={state} alwaysVisible /></div>
        <Logo settings={settings} showName="always" />
        <div className="flex items-center justify-end gap-1">
          <WhatsAppButton settings={settings} compact />
          <AccountButton settings={settings} />
          <CartButton settings={settings} />
        </div>
      </div>
    </HeaderFrame>
  );
}
