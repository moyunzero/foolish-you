import { DEV_TOOLS_ENABLED } from '../../constants/dev';

/**
 * Stable Sunday (`weekdayBand === 6`) for __DEV__ Maestro / panel QA.
 * Does not ship in release; never affects production `dateKey`.
 */
export const DEV_QA_SUNDAY_DATE_KEY = '2026-07-12';

let forceDateKey: string | null = null;

/** Active __DEV__ fake dateKey, or null when following the device calendar. */
export function getDevForceDateKey(): string | null {
  if (!DEV_TOOLS_ENABLED) return null;
  return forceDateKey;
}

/** Set or clear the in-memory __DEV__ fake dateKey (process lifetime). */
export function setDevForceDateKey(next: string | null): void {
  if (!DEV_TOOLS_ENABLED) return;
  forceDateKey = next;
}
