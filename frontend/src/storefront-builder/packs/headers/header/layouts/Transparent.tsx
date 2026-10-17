import { useRef } from 'react';
import type { LayoutProps } from '../../../../core/types';
import type { HeaderSettings } from '../manifest';
import { Actions } from '../parts/Actions';
import { DesktopNav } from '../parts/DesktopNav';
import { HeaderFrame, InlineSearch } from '../parts/HeaderFrame';
import { Logo } from '../parts/Logo';
import { useHeaderState, useScrolled } from '../parts/useHeader';
import { useMainMenu } from '../useMenu';

/**
 * Sits over the first section (the shell pulls the page up underneath it) and
 * turns solid once the shopper scrolls. Pick a colour scheme whose text reads on
 * your hero (e.g. "contrast" over a photo).
 */
export default function Transparent({ settings, scheme }: LayoutProps<HeaderSettings>) {
  const state = useHeaderState();
  const menu = useMainMenu(settings.featuredCategoriesInMenu);
  const ref = useRef<HTMLDivElement>(null);
  const scrolled = useScrolled(ref);
  const solid = scrolled || state.searchOpen;
  return (
    <div ref={ref}>
      <HeaderFrame
        settings={settings}
        state={state}
        menu={menu}
        scheme={scheme}
        barClassName="transition-[background-color,border-color,box-shadow] duration-(--sf-motion-base)"
        barStyle={solid ? undefined : { background: 'transparent', borderBottomColor: 'transparent', backdropFilter: 'none', textShadow: '0 1px 2px rgb(0 0 0 / 0.25)' }}
      >
        <div className="sf-container flex h-16 items-center gap-3 @4xl:h-20">
          <Logo settings={settings} />
          <DesktopNav items={menu} className="flex-1" />
          <div className="ml-auto flex items-center gap-2">
            <InlineSearch settings={settings} />
            <Actions settings={settings} state={state} whatsApp="icon" />
          </div>
        </div>
      </HeaderFrame>
    </div>
  );
}
