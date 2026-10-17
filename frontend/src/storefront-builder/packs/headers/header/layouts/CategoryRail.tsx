import { useLocation } from 'react-router-dom';
import type { LayoutProps } from '../../../../core/types';
import { SmartLinkAnchor } from '../../../../ui/SmartLinkAnchor';
import type { HeaderSettings } from '../manifest';
import { Actions } from '../parts/Actions';
import { DesktopNav } from '../parts/DesktopNav';
import { HeaderFrame, InlineSearch } from '../parts/HeaderFrame';
import { Logo } from '../parts/Logo';
import { useHeaderState } from '../parts/useHeader';
import { useCategoryMenu, useMainMenu } from '../useMenu';

/** Main bar plus a swipeable row of category chips (great for large catalogues). */
export default function CategoryRail({ settings, scheme }: LayoutProps<HeaderSettings>) {
  const state = useHeaderState();
  const menu = useMainMenu(settings.featuredCategoriesInMenu);
  const categories = useCategoryMenu();
  const { pathname } = useLocation();
  return (
    <HeaderFrame
      settings={settings}
      state={state}
      menu={menu}
      scheme={scheme}
      below={categories.length ? (
        <nav aria-label="Categories" style={{ borderTop: '1px solid var(--sf-border)' }}>
          <ul className="sf-container sf-scroll-x flex gap-2 py-2">
            {categories.map(c => (
              <li key={c.id} className="shrink-0">
                <SmartLinkAnchor href={c.href} className="sf-chip" ariaLabel={c.label}>
                  <span aria-current={pathname === c.href.split('?')[0] ? 'true' : undefined}>{c.label}</span>
                </SmartLinkAnchor>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    >
      <div className="sf-container flex h-16 items-center gap-3">
        <Logo settings={settings} />
        <DesktopNav items={menu.filter(m => !m.id.startsWith('cat-'))} className="flex-1" />
        <div className="ml-auto flex items-center gap-2">
          <InlineSearch settings={settings} />
          <Actions settings={settings} state={state} />
        </div>
      </div>
    </HeaderFrame>
  );
}
