import { useState } from 'react';
import { useCountdown } from '../../../../ui/useCountdown';
import type { DealOfTheDaySettings } from './manifest';

/** Next local midnight, as an ISO string. */
function nextMidnight(): string {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.toISOString();
}

/** Countdown to the fixed end time, or to midnight when the deal resets daily. */
export function useDealCountdown(settings: DealOfTheDaySettings) {
  const fixed = settings.endsAt?.trim() ? settings.endsAt : '';
  const [midnight] = useState(nextMidnight);
  const parts = useCountdown(fixed || midnight);
  const over = !!fixed && parts.valid && parts.done;
  return { ...parts, hidden: over && settings.hideWhenDone !== false, daily: !fixed };
}
