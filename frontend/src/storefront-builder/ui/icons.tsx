import { ICONS } from './iconSet';

/** Renders a merchant-picked icon from the curated set (falls back to "sparkles"). */
export function StoreIcon({ name, className = 'h-6 w-6' }: { name: string | undefined; className?: string }) {
  const entry = (name && ICONS[name]) || ICONS.sparkles;
  const { Icon } = entry;
  return <Icon className={className} aria-hidden />;
}
