import type { CountdownParts } from '../../../ui/useCountdown';

const pad = (n: number) => String(n).padStart(2, '0');

export function Timer({ parts, size = 'md' }: { parts: CountdownParts; size?: 'md' | 'lg' }) {
  const units = [
    { v: parts.days, l: 'Days' },
    { v: parts.hours, l: 'Hours' },
    { v: parts.minutes, l: 'Mins' },
    { v: parts.seconds, l: 'Secs' },
  ];
  const label = `${parts.days} days ${parts.hours} hours ${parts.minutes} minutes left`;
  return (
    <div className="flex gap-2 @3xl:gap-3" role="timer" aria-label={label}>
      {units.map(u => (
        <div key={u.l} className={`sf-card flex flex-col items-center justify-center ${size === 'lg' ? 'min-w-[72px] px-3 py-4 @3xl:min-w-[96px]' : 'min-w-[60px] px-2 py-2'}`} aria-hidden>
          <span className={`font-black tabular-nums ${size === 'lg' ? 'text-3xl @3xl:text-5xl' : 'text-2xl'}`} style={{ fontFamily: 'var(--sf-font-heading)' }}>{pad(u.v)}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider sf-muted">{u.l}</span>
        </div>
      ))}
    </div>
  );
}
