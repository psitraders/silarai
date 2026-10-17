import type { LayoutProps } from '../../../../core/types';
import type { HeaderSettings } from '../manifest';
import { Actions } from '../parts/Actions';
import { DesktopNav } from '../parts/DesktopNav';
import { HeaderFrame, InlineSearch } from '../parts/HeaderFrame';
import { Logo } from '../parts/Logo';
import { useHeaderState } from '../parts/useHeader';
import { useMainMenu } from '../useMenu';

/** Logo left · menu and icons grouped on the right. */
export default function MenuRight({ settings, scheme }: LayoutProps<HeaderSettings>) {
  const state = useHeaderState();
  const menu = useMainMenu(settings.featuredCategoriesInMenu);
  return (
    <HeaderFrame settings={settings} state={state} menu={menu} scheme={scheme}>
      <div className="sf-container flex h-16 items-center gap-3">
        <Logo settings={settings} />
        <div className="ml-auto flex items-center gap-2">
          <DesktopNav items={menu} align="end" />
          <InlineSearch settings={settings} className="w-48" />
          <Actions settings={settings} state={state} whatsApp="icon" />
        </div>
      </div>
    </HeaderFrame>
  );
}
