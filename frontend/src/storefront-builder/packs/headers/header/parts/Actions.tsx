import { Menu, MessageCircle, Search, ShoppingBag, ShoppingBasket, ShoppingCart, UserCircle, X } from 'lucide-react';
import { generateWhatsAppLink } from '../../../../../utils/whatsappLink';
import { useShell } from '../../../../core/shell-context';
import { useStorefront } from '../../../../core/storefront-context';
import type { HeaderSettings } from '../manifest';
import type { HeaderState } from './useHeader';

const CART_ICON = { bag: ShoppingBag, cart: ShoppingCart, basket: ShoppingBasket } as const;

export function CartButton({ settings }: { settings: HeaderSettings }) {
  const shell = useShell();
  const Icon = CART_ICON[settings.cartIcon] ?? ShoppingBag;
  return (
    <button type="button" className="sf-icon-btn" onClick={shell.openCart} aria-label={`Cart${shell.cartCount ? `, ${shell.cartCount} item${shell.cartCount === 1 ? '' : 's'}` : ''}`}>
      <Icon className="h-5 w-5" aria-hidden />
      {shell.cartCount > 0 && (
        <span aria-hidden className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold" style={{ background: 'var(--sf-badge)', color: 'var(--sf-on-badge)' }}>
          {shell.cartCount > 9 ? '9+' : shell.cartCount}
        </span>
      )}
    </button>
  );
}

export function MenuButton({ state, alwaysVisible = false }: { state: HeaderState; alwaysVisible?: boolean }) {
  return (
    <button
      type="button"
      className={`sf-icon-btn ${alwaysVisible ? '' : '@4xl:hidden'}`}
      onClick={() => state.setMobileOpen(o => !o)}
      aria-expanded={state.mobileOpen}
      aria-label={state.mobileOpen ? 'Close menu' : 'Open menu'}
    >
      {state.mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
    </button>
  );
}

export function SearchButton({ settings, state, className = '' }: { settings: HeaderSettings; state: HeaderState; className?: string }) {
  if (settings.search === 'off') return null;
  return (
    <button
      type="button"
      className={`sf-icon-btn ${settings.search === 'bar' ? '@4xl:hidden' : ''} ${className}`}
      onClick={() => state.setSearchOpen(o => !o)}
      aria-expanded={state.searchOpen}
      aria-label="Search products"
    >
      <Search className="h-5 w-5" aria-hidden />
    </button>
  );
}

export function AccountButton({ settings }: { settings: HeaderSettings }) {
  const shell = useShell();
  if (!settings.showAccount) return null;
  return (
    <button
      type="button"
      className="sf-icon-btn"
      onClick={shell.isSignedIn ? shell.openAccount : shell.openAuth}
      aria-label={shell.isSignedIn ? `My account${shell.customerName ? ` (${shell.customerName})` : ''}` : 'Sign in'}
    >
      <UserCircle className="h-5 w-5" aria-hidden />
      {shell.isSignedIn && <span aria-hidden className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2" style={{ background: 'var(--sf-success)', borderColor: 'var(--sf-bg)' }} />}
    </button>
  );
}

export function WhatsAppButton({ settings, compact = false }: { settings: HeaderSettings; compact?: boolean }) {
  const { store } = useStorefront();
  if (!settings.showWhatsApp || !store.whatsAppNumber) return null;
  const href = generateWhatsAppLink(store.whatsAppNumber, `Hi! I'm visiting ${store.name}'s store.`);
  return compact ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="sf-icon-btn" aria-label="Chat on WhatsApp">
      <MessageCircle className="h-5 w-5" aria-hidden />
    </a>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className="sf-btn sf-btn-primary sf-btn-sm ml-1 hidden @2xl:inline-flex">
      <MessageCircle className="h-4 w-4" aria-hidden /> Chat
    </a>
  );
}

/** The usual icon group: search · cart · account · WhatsApp · menu. */
export function Actions({ settings, state, whatsApp = 'button', menu = true }: {
  settings: HeaderSettings;
  state: HeaderState;
  whatsApp?: 'button' | 'icon' | 'none';
  menu?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <SearchButton settings={settings} state={state} />
      <CartButton settings={settings} />
      <AccountButton settings={settings} />
      {whatsApp !== 'none' && <WhatsAppButton settings={settings} compact={whatsApp === 'icon'} />}
      {menu && <MenuButton state={state} />}
    </div>
  );
}
