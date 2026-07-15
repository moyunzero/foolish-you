import { weekdayBand } from '../puzzles/difficulty/weekdayBand';

/** True when local weekday is Sunday (D-04). */
export function isSundaySpecialDate(dateKey: string): boolean {
  return weekdayBand(dateKey) === 6;
}

export type ResolveGameStreakSublineInput = {
  showPlayChrome: boolean;
  freezeConsumedToday: boolean;
  freezeConsumedLine: string;
  missedYesterdayLine: string | null;
  dateKey: string | null;
  sundayGameSubline: string;
};

/**
 * Game-header single-slot subline priority (D-05, D-12):
 * freeze → missed yesterday → Sunday Special → null.
 */
export function resolveGameStreakSubline(
  input: ResolveGameStreakSublineInput,
): string | null {
  if (!input.showPlayChrome) return null;
  if (input.freezeConsumedToday) {
    return input.freezeConsumedLine === '' ? null : input.freezeConsumedLine;
  }
  if (input.missedYesterdayLine != null) return input.missedYesterdayLine;
  if (input.dateKey != null && isSundaySpecialDate(input.dateKey)) {
    return input.sundayGameSubline;
  }
  return null;
}
