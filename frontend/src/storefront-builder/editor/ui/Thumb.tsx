import type { ThumbRect } from '../../core/types';

const FILL: Record<ThumbRect[4], { fill: string; stroke?: string; rx: number }> = {
  h: { fill: '#334155', rx: 1.5 },
  t: { fill: '#cbd5e1', rx: 1.5 },
  i: { fill: '#e2e8f0', rx: 2 },
  b: { fill: 'var(--rc-primary, #0d9488)', rx: 2.5 },
  m: { fill: '#f1f5f9', rx: 2 },
  c: { fill: '#ffffff', stroke: '#cbd5e1', rx: 2 },
};

/** Schematic layout thumbnail drawn from a manifest's `thumb` rectangles (100 × 64). */
export function Thumb({ rects, className = '' }: { rects?: ThumbRect[]; className?: string }) {
  return (
    <svg viewBox="0 0 100 64" className={`block h-auto w-full ${className}`} aria-hidden>
      <rect x="0" y="0" width="100" height="64" fill="#f8fafc" />
      {(rects ?? [[10, 14, 80, 8, 'h'], [10, 28, 60, 4, 't'], [10, 36, 50, 4, 't']] as ThumbRect[]).map(([x, y, w, h, k], i) => {
        const s = FILL[k];
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} rx={s.rx} fill={s.fill} stroke={s.stroke} strokeWidth={s.stroke ? 0.8 : 0} />
            {k === 'i' && <path d={`M${x + w * 0.3} ${y + h * 0.68} l${w * 0.14} ${-h * 0.2} l${w * 0.1} ${h * 0.12} l${w * 0.12} ${-h * 0.18} l${w * 0.14} ${h * 0.26}z`} fill="#cbd5e1" />}
          </g>
        );
      })}
    </svg>
  );
}
