import type { CountdownParts } from '../../../../ui/useCountdown';

const pad = (n: number) => String(n).padStart(2, '0');

/** Hours : minutes : seconds boxes (days folded into hours). Announced politely once a minute. */
export function Timer({ parts, label }: { parts: CountdownParts; label: string }) {
  const hours = parts.days * 24 + parts.hours;
  const box = 'flex min-w-12 flex-col items-center rounded-[var(--sf-radius-sm)] px-2 py-1.5';
  const style = { background: 'var(--sf-button)', color: 'var(--sf-on-button)' };
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide sf-muted">{label}</p>
      <div className="flex items-center gap-1.5" role="timer" aria-label={`${hours} hours ${parts.minutes} minutes left`}>
        {([[hours, 'hrs'], [parts.minutes, 'min'], [parts.seconds, 'sec']] as const).map(([n, unit], i) => (
          <span key={unit} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden className="font-bold">:</span>}
            <span className={box} style={style} aria-hidden>
              <span className="text-lg font-bold tabular-nums leading-none">{pad(n)}</span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase opacity-80">{unit}</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
