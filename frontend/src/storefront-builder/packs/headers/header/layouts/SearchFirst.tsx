import type { LayoutProps } from '../../../../core/types';
import type { HeaderSettings } from '../manifest';
import { AccountButton, CartButton, MenuButton, WhatsAppButton } from '../parts/Actions';
import { DesktopNav } from '../parts/DesktopNav';
import { HeaderFrame } from '../parts/HeaderFrame';
import { Logo } from '../parts/Logo';
import { SearchField } from '../parts/SearchBar';
import { useHeaderState } from '../parts/useHeader';
import { useMainMenu } from '../useMenu';

/** Logo · big search bar · icons; menu on a slim second row. The search shows on phones too. */
export default function SearchFirst({ settings, scheme }: LayoutProps<HeaderSettings>) {
  const state = useHeaderState();
  const menu = useMainMenu(settings.featuredCategoriesInMenu);
  return (
    <HeaderFrame
      settings={settings}
      state={state}
      menu={menu}
      scheme={scheme}
      below={
        <>
          <div className="sf-container pb-3 @3xl:hidden"><SearchField /></div>
          <div className="hidden @4xl:block" style={{ borderTop: '1px solid var(--sf-border)' }}>
            <DesktopNav items={menu} align="start" className="sf-container py-1" />
          </div>
        </>
      }
    >
      <div className="sf-container flex h-16 items-center gap-4">
        <MenuButton state={state} />
        <Logo settings={settings} />
        <SearchField className="mx-auto hidden max-w-xl flex-1 @3xl:block" />
        <div className="ml-auto flex items-center gap-1 @3xl:ml-0">
          <WhatsAppButton settings={settings} compact />
          <AccountButton settings={settings} />
          <CartButton settings={settings} />
        </div>
      </div>
    </HeaderFrame>
  );
}
