import { MessageCircle } from 'lucide-react';
import { generateWhatsAppLink } from '../../../../../utils/whatsappLink';
import { useStorefront } from '../../../../core/storefront-context';
import type { LayoutProps } from '../../../../core/types';
import type { HeaderSettings } from '../manifest';
import { Actions } from '../parts/Actions';
import { DesktopNav } from '../parts/DesktopNav';
import { HeaderFrame, InlineSearch } from '../parts/HeaderFrame';
import { Logo } from '../parts/Logo';
import { useHeaderState } from '../parts/useHeader';
import { useMainMenu } from '../useMenu';

/** A slim utility bar (your text + WhatsApp) above the classic bar. */
export default function TwoTier({ settings, scheme }: LayoutProps<HeaderSettings>) {
  const { store } = useStorefront();
  const state = useHeaderState();
  const menu = useMainMenu(settings.featuredCategoriesInMenu);
  const utility = settings.utilityText.trim();
  return (
    <>
      {(utility || store.whatsAppNumber) && (
        <div data-sf-scheme="brand" className="sf-scheme text-xs">
          <div className="sf-container flex h-9 items-center justify-between gap-4">
            <span className="truncate font-medium">{utility}</span>
            {store.whatsAppNumber && (
              <a href={generateWhatsAppLink(store.whatsAppNumber, `Hi ${store.name}!`)} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1.5 font-semibold hover:underline">
                <MessageCircle className="h-3.5 w-3.5" aria-hidden /> WhatsApp us
              </a>
            )}
          </div>
        </div>
      )}
      <HeaderFrame settings={settings} state={state} menu={menu} scheme={scheme}>
        <div className="sf-container flex h-16 items-center gap-3">
          <Logo settings={settings} />
          <DesktopNav items={menu} className="flex-1" />
          <div className="ml-auto flex items-center gap-2">
            <InlineSearch settings={settings} />
            <Actions settings={settings} state={state} whatsApp="none" />
          </div>
        </div>
      </HeaderFrame>
    </>
  );
}
