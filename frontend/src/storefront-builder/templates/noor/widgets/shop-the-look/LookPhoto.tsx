import { Plus } from 'lucide-react';
import type { SmartImage as SmartImageValue } from '../../../../core/types';
import { SmartImage } from '../../../../ui/SmartImage';
import type { Spot } from './useLook';

/** The look photo with hotspot buttons (44 px touch targets, a ring so they read on any photo). */
export function LookPhoto({ image, spots, active, onPick, className, eager }: {
  image: SmartImageValue;
  spots: Spot[];
  active: number;
  onPick: (i: number) => void;
  className: string;
  eager: boolean;
}) {
  return (
    <div className={`relative ${className}`}>
      <SmartImage value={image} alt="" eager={eager} className="h-full w-full" sizes="(min-width: 768px) 55vw, 100vw" />
      {spots.map((s, i) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onPick(i)}
          aria-pressed={i === active}
          aria-label={`${i + 1}: ${s.product.title}`}
          className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
        >
          <span aria-hidden className="absolute inset-1 rounded-full opacity-50" style={{ background: 'var(--sf-surface)' }} />
          <span aria-hidden className="relative flex h-7 w-7 items-center justify-center rounded-full shadow-lg transition-transform motion-reduce:transition-none" style={i === active ? { background: 'var(--sf-button)', color: 'var(--sf-on-button)', transform: 'scale(1.1)' } : { background: 'var(--sf-surface)', color: 'var(--sf-text)' }}>
            <Plus className="h-4 w-4" />
          </span>
        </button>
      ))}
    </div>
  );
}
