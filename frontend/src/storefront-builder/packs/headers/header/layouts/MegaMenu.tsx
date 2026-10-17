import type { LayoutProps } from '../../../../core/types';
import type { HeaderSettings } from '../manifest';
import { Actions } from '../parts/Actions';
import { DesktopNav } from '../parts/DesktopNav';
import { HeaderFrame, InlineSearch } from '../parts/HeaderFrame';
import { Logo } from '../parts/Logo';
import { useHeaderState } from '../parts/useHeader';
import { useCategoryMenu, useMainMenu, type HeaderMenuItem } from '../useMenu';

/**
 * Classic bar whose dropdowns open as full-width panels with photos.
 * Without a custom menu, a "Shop" item lists every category (and sub-category).
 */
export default function MegaMenu({ settings, scheme }: LayoutProps<HeaderSettings>) {
  const state = useHeaderState();
  const main = useMainMenu(settings.featuredCategoriesInMenu);
  const categories = useCategoryMenu();
  const usingCustomMenu = main.length > 0 && main[0].id !== 'home';
  const shop: HeaderMenuItem | null = !usingCustomMenu && categories.length
    ? { id: 'shop', label: 'Shop', href: main.find(m => m.id === 'all')?.href ?? '#', children: categories }
    : null;
  const menu = shop ? [main[0], shop, ...main.slice(2).filter(m => !m.id.startsWith('cat-'))] : main;
  return (
    <HeaderFrame settings={settings} state={state} menu={menu} scheme={scheme} barClassName="relative">
      <div className="sf-container flex h-16 items-center gap-3">
        <Logo settings={settings} />
        <DesktopNav items={menu} mega className="flex-1" />
        <div className="ml-auto flex items-center gap-2">
          <InlineSearch settings={settings} />
          <Actions settings={settings} state={state} />
        </div>
      </div>
    </HeaderFrame>
  );
}
