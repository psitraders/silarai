import type { CSSProperties, ReactNode } from 'react';
import type { SchemeId } from '../../../../core/types';
import type { HeaderSettings } from '../manifest';
import type { HeaderMenuItem } from '../useMenu';
import { Announcement } from './Announcement';
import { MobileMenu } from './MobileMenu';
import { SearchField, SearchPanel } from './SearchBar';
import type { HeaderState } from './useHeader';

/**
 * What every header layout shares: announcement strip, the bar itself (layout
 * content as children), the drop-down search row and the mobile menu drawer.
 */
export function HeaderFrame({ settings, state, menu, scheme, children, barClassName = '', barStyle, below, announcement = true }: {
  settings: HeaderSettings;
  state: HeaderState;
  menu: HeaderMenuItem[];
  scheme: SchemeId;
  children: ReactNode;
  barClassName?: string;
  barStyle?: CSSProperties;
  /** Extra rows inside the bar (category chips, a second nav row…). */
  below?: ReactNode;
  announcement?: boolean;
}) {
  return (
    <>
      {announcement && <Announcement settings={settings} />}
      <div className={`sf-bar ${barClassName}`} style={barStyle}>
        {children}
        {below}
        <SearchPanel state={state} />
      </div>
      <MobileMenu items={menu} settings={settings} state={state} scheme={scheme} />
    </>
  );
}

/** Always-visible search field on wide screens when the "search" option is "bar". */
export function InlineSearch({ settings, className = 'w-56' }: { settings: HeaderSettings; className?: string }) {
  if (settings.search !== 'bar') return null;
  return <SearchField className={`hidden @4xl:block ${className}`} />;
}
