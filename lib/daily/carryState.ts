import type { DailyStatus } from '../puzzles/types';

/** Minimal snapshot shape for keep/carry predicates (no storage I/O). */
export type CarryRecordRef = {
  status: DailyStatus;
  dateKey: string;
};

/** Options for hydrate keep vs mint (route-gated suppress). */
export type ShouldKeepOptions = {
  /** When true and record is non-null, keep slot (no mint). */
  suppressMint?: boolean;
};

/**
 * Whether hydrate should keep the stored snapshot instead of minting a new daily.
 * Playing always keeps (Scheme A / D-01 / D-02). Same-calendar-day terminal keeps.
 * `suppressMint` keeps any non-null record (result anti-yank / D-09).
 * Null or terminal+stale (without suppress) → mint.
 */
export function shouldKeepOnHydrate(
  record: CarryRecordRef | null,
  calendarToday: string,
  options?: ShouldKeepOptions,
): boolean {
  if (record == null) return false;
  if (options?.suppressMint) return true;
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
