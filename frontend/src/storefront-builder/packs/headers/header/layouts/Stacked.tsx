import type { LayoutProps } from '../../../../core/types';
import type { HeaderSettings } from '../manifest';
import { AccountButton, CartButton, MenuButton, SearchButton, WhatsAppButton } from '../parts/Actions';
import { DesktopNav } from '../parts/DesktopNav';
import { HeaderFrame } from '../parts/HeaderFrame';
import { Logo } from '../parts/Logo';
import { useHeaderState } from '../parts/useHeader';
import { useMainMenu } from '../useMenu';

/** Logo centred on the top row, menu centred underneath (boutique / luxury look). */
export default function Stacked({ settings, scheme }: LayoutProps<HeaderSettings>) {
  const state = useHeaderState();
  const menu = useMainMenu(settings.featuredCategoriesInMenu);
  return (
    <HeaderFrame
      settings={settings}
      state={state}
      menu={menu}
      scheme={scheme}
      below={
        <div className="hidden @4xl:block" style={{ borderTop: '1px solid var(--sf-border)' }}>
          <DesktopNav items={menu} className="sf-container py-1" />
        </div>
      }
    >
      <div className="sf-container grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3 @4xl:h-24">
        <div className="flex items-center">
          <MenuButton state={state} />
          <SearchButton settings={{ ...settings, search: settings.search === 'off' ? 'off' : 'icon' }} state={state} className="hidden @4xl:inline-flex" />
        </div>
        <Logo settings={{ ...settings, logoSize: settings.logoSize === 'small' ? 'medium' : 'large' }} showName="always" />
        <div className="flex items-center justify-end gap-1">
          <WhatsAppButton settings={settings} compact />
          <AccountButton settings={settings} />
          <CartButton settings={settings} />
        </div>
      </div>
    </HeaderFrame>
  );
}
