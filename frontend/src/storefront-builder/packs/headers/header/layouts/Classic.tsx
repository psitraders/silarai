import type { LayoutProps } from '../../../../core/types';
import type { HeaderSettings } from '../manifest';
import { Actions } from '../parts/Actions';
import { DesktopNav } from '../parts/DesktopNav';
import { HeaderFrame, InlineSearch } from '../parts/HeaderFrame';
import { Logo } from '../parts/Logo';
import { useHeaderState } from '../parts/useHeader';
import { useMainMenu } from '../useMenu';

/** Logo left · menu centre · icons right. */
export default function Classic({ settings, scheme }: LayoutProps<HeaderSettings>) {
  const state = useHeaderState();
  const menu = useMainMenu(settings.featuredCategoriesInMenu);
  return (
    <HeaderFrame settings={settings} state={state} menu={menu} scheme={scheme}>
      <div className="sf-container flex h-16 items-center gap-3">
        <Logo settings={settings} />
        <DesktopNav items={menu} className="flex-1" />
        <div className="ml-auto flex items-center gap-2">
          <InlineSearch settings={settings} />
          <Actions settings={settings} state={state} />
        </div>
      </div>
    </HeaderFrame>
  );
}
