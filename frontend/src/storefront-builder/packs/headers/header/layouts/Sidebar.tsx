import type { LayoutProps } from '../../../../core/types';
import { SmartLinkAnchor } from '../../../../ui/SmartLinkAnchor';
import type { HeaderSettings } from '../manifest';
import { AccountButton, CartButton, MenuButton, SearchButton, WhatsAppButton } from '../parts/Actions';
import { HeaderFrame } from '../parts/HeaderFrame';
import { Logo } from '../parts/Logo';
import { SearchField } from '../parts/SearchBar';
import { useHeaderState } from '../parts/useHeader';
import { useMainMenu } from '../useMenu';

/**
 * A fixed menu column on the left at ≥ 1024 px (the shell shifts the page right);
 * a normal top bar on smaller screens. Uses a viewport query because it changes the
 * whole page frame, not just this section.
 */
export default function Sidebar({ settings, scheme, context }: LayoutProps<HeaderSettings>) {
  const state = useHeaderState();
  const menu = useMainMenu(settings.featuredCategoriesInMenu);
  return (
    <>
      <div className="lg:hidden">
        <HeaderFrame settings={settings} state={state} menu={menu} scheme={scheme}>
          <div className="sf-container flex h-16 items-center gap-3">
            <MenuButton state={state} alwaysVisible />
            <Logo settings={settings} showName="always" />
            <div className="ml-auto flex items-center gap-1">
              <SearchButton settings={{ ...settings, search: settings.search === 'off' ? 'off' : 'icon' }} state={state} />
              <CartButton settings={settings} />
            </div>
          </div>
        </HeaderFrame>
      </div>

      <aside className={`sf-bar ${context.mode === 'gallery' ? 'relative h-[420px]' : 'fixed inset-y-0 left-0 z-30'} hidden w-[260px] flex-col gap-8 overflow-y-auto px-6 py-8 lg:flex`} style={{ borderBottom: 0, borderRight: '1px solid var(--sf-border)' }}>
        <Logo settings={{ ...settings, logoSize: 'large' }} showName="always" />
        {settings.search !== 'off' && <SearchField />}
        <nav aria-label="Main" className="flex-1">
          <ul className="space-y-1">
            {menu.map(item => (
              <li key={item.id}>
                <SmartLinkAnchor href={item.href} className="block rounded-[var(--sf-radius-sm)] py-1.5 text-sm font-semibold opacity-85 hover:opacity-100">{item.label}</SmartLinkAnchor>
                {item.children && (
                  <ul className="mb-2 ml-3 space-y-0.5">
                    {item.children.map(c => <li key={c.id}><SmartLinkAnchor href={c.href} className="block py-1 text-sm opacity-70 hover:opacity-100">{c.label}</SmartLinkAnchor></li>)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <CartButton settings={settings} />
          <AccountButton settings={settings} />
          <WhatsAppButton settings={settings} compact />
        </div>
      </aside>
    </>
  );
}
