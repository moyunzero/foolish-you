import type { DailyStatus } from '../puzzles/types';

/** Minimal snapshot shape for keep/carry predicates (no storage I/O). */
export type CarryRecordRef = {
  status: DailyStatus;
  dateKey: string;
};

/**
 * Whether hydrate should keep the stored snapshot instead of minting a new daily.
 * Playing always keeps (Scheme A / D-01 / D-02). Same-calendar-day terminal keeps.
 * Null or terminal+stale → mint (advance ownership: v2.7-02).
 */
export function shouldKeepOnHydrate(
  record: CarryRecordRef | null,
  calendarToday: string,
): boolean {
  if (record == null) return false;
  if (record.status === 'playing') return true;
  return record.dateKey === calendarToday;
}

/**
 * True when the active board is an unfinished open from a prior calendar day.
 * Lexicographic compare assumes `YYYY-MM-DD` dateKeys.
 */
export function isCarrying(
  status: DailyStatus | 'loading',
  openingDateKey: string | null | undefined,
  calendarToday: string,
): boolean {
  if (status !== 'playing') return false;
  if (openingDateKey == null || openingDateKey === '') return false;
  return openingDateKey < calendarToday;
}
