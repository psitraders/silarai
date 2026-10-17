import { BadgeCheck, Gift, Lock, RotateCcw, ShieldCheck, Star, Truck } from 'lucide-react';
import type { ReactElement } from 'react';
import { WhatsAppIcon } from '../../../ui/brand-icons';
import type { TrustIcon } from './manifest';

const ICONS: Record<TrustIcon, (p: { className?: string }) => ReactElement> = {
  truck: p => <Truck {...p} aria-hidden />,
  shield: p => <ShieldCheck {...p} aria-hidden />,
  whatsapp: p => <WhatsAppIcon {...p} />,
  returns: p => <RotateCcw {...p} aria-hidden />,
  verified: p => <BadgeCheck {...p} aria-hidden />,
  lock: p => <Lock {...p} aria-hidden />,
  star: p => <Star {...p} aria-hidden />,
  gift: p => <Gift {...p} aria-hidden />,
};

export function TrustIconView({ icon, className }: { icon: TrustIcon; className?: string }) {
  const Render = ICONS[icon] ?? ICONS.verified;
  return <Render className={className} />;
}
