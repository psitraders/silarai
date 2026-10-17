import { useEffect, useState } from 'react';

export interface CountdownParts { days: number; hours: number; minutes: number; seconds: number; done: boolean; valid: boolean }

/** Live countdown to an ISO date/time (updates every second; stops at zero). */
export function useCountdown(endsAt: string | undefined): CountdownParts {
  const end = endsAt ? Date.parse(endsAt) : NaN;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (Number.isNaN(end)) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [end]);
  if (Number.isNaN(end)) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: false, valid: false };
  const left = Math.max(0, end - now);
  const s = Math.floor(left / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: left === 0,
    valid: true,
  };
}
