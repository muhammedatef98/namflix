import { useEffect, useState } from 'react';

export type Countdown = {
  /** Whole days / hours / minutes / seconds remaining (all zero once expired). */
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Milliseconds left; clamped to 0. */
  totalMs: number;
  /** True once the target has passed (or when there is no target). */
  expired: boolean;
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function compute(target: number | null): Countdown {
  if (target == null) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, expired: true };
  }
  const totalMs = Math.max(0, target - Date.now());
  return {
    days: Math.floor(totalMs / DAY),
    hours: Math.floor((totalMs % DAY) / HOUR),
    minutes: Math.floor((totalMs % HOUR) / MINUTE),
    seconds: Math.floor((totalMs % MINUTE) / SECOND),
    totalMs,
    expired: totalMs <= 0,
  };
}

/**
 * Live countdown to `target` (a Date, or null for "no deadline"). Re-renders
 * once a second while time remains, then stops ticking to avoid idle timers.
 */
export function useCountdown(target: Date | null): Countdown {
  const targetMs = target ? target.getTime() : null;
  const [state, setState] = useState<Countdown>(() => compute(targetMs));

  useEffect(() => {
    setState(compute(targetMs));
    if (targetMs == null || targetMs - Date.now() <= 0) return;

    const id = setInterval(() => {
      const next = compute(targetMs);
      setState(next);
      if (next.expired) clearInterval(id);
    }, SECOND);
    return () => clearInterval(id);
  }, [targetMs]);

  return state;
}
