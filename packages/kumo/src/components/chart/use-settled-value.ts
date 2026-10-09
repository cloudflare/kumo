import { useEffect, useState } from "react";

/** Hover-intent delay: skips list rows the pointer only passes over. */
export const DEFAULT_ACTIVE_DELAY = 300;

/** Shorter delay once a value is active, so moving between rows feels instant. */
export const FOLLOW_UP_ACTIVE_DELAY = 100;

/**
 * Returns `value` once it has been unchanged for `delay` ms, or
 * `min(FOLLOW_UP_ACTIVE_DELAY, delay)` while a previous value is still active.
 * `null`, the initial value and `delay <= 0` apply immediately.
 */
export function useSettledValue<T>(value: T | null, delay: number): T | null {
  const [settled, setSettled] = useState(value);

  // Clear during render so the next value waits the full delay.
  if (value === null && settled !== null) setSettled(null);

  const isActive = settled !== null;
  const wait = isActive ? Math.min(FOLLOW_UP_ACTIVE_DELAY, delay) : delay;

  useEffect(() => {
    if (value === null) return;
    const timer = setTimeout(() => setSettled(value), Math.max(0, wait));
    return () => clearTimeout(timer);
  }, [value, wait]);

  return value === null || delay <= 0 ? value : settled;
}
