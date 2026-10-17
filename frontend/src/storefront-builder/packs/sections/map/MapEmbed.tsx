import { MapPin } from 'lucide-react';
import { useState } from 'react';

const MAP_HEIGHT = { short: 'h-[260px]', regular: 'h-[380px]', tall: 'h-[520px]' } as const;

/** Click-to-load Google Maps embed (no third-party request until tapped). The URL is built here, not by the merchant. */
export function MapEmbed({ address, height, rounded }: { address: string; height: keyof typeof MAP_HEIGHT; rounded: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const cls = `${MAP_HEIGHT[height] ?? MAP_HEIGHT.regular} w-full overflow-hidden ${rounded ? 'sf-img' : ''}`;
  if (!address.trim()) {
    return <div className={`${cls} sf-placeholder flex items-center justify-center text-sm sf-muted`}>Add an address to show the map.</div>;
  }
  if (loaded) {
    return (
      <div className={cls}>
        <iframe title={`Map: ${address}`} src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>
    );
  }
  return (
    <button type="button" onClick={() => setLoaded(true)} className={`${cls} sf-placeholder sf-textured group relative flex flex-col items-center justify-center gap-3`} aria-label={`Show map of ${address}`}>
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform duration-(--sf-motion-base) group-hover:scale-110" style={{ background: 'var(--sf-button)', color: 'var(--sf-on-button)' }}>
        <MapPin className="h-6 w-6" aria-hidden />
      </span>
      <span className="text-sm font-semibold">Show map</span>
      <span className="max-w-xs px-4 text-center text-xs sf-muted">{address}</span>
    </button>
  );
}
