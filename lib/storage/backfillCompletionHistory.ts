import { addDaysToDateKey } from '../date/dateKeyMath';
import type { StreakState } from '../streak/types';
import type { CompletionEntry, CompletionHistoryState } from './completionHistoryStorage';

/** Placeholder elapsed for streak-inferred rows (excluded from「比上次快」对比). */
export const INFERRED_COMPLETION_ELAPSED_MS = 0;

/**
 * Consecutive calendar days in the active streak, ending at `lastCheckInDateKey`.
 * Uses `currentStreak` only (not `historicalMax`).
 */
export function getActiveStreakDateKeys(streak: StreakState): string[] {
  const { currentStreak, lastCheckInDateKey } = streak;
  if (currentStreak <= 0 || lastCheckInDateKey == null) {
    return [];
  }
  const keys: string[] = [];
  for (let daysBack = currentStreak - 1; daysBack >= 0; daysBack -= 1) {
    keys.push(addDaysToDateKey(lastCheckInDateKey, -daysBack));
  }
  return keys;
}

/**
 * Fill missing completion-history rows for dates already credited in streak storage.
 * Idempotent: only adds dateKeys absent from `state`.
 */
export function mergeBackfillFromStreak(
  state: CompletionHistoryState,
  streak: StreakState | null,
): { state: CompletionHistoryState; added: number } {
  if (streak == null) {
    return { state, added: 0 };
  }

  const chainKeys = getActiveStreakDateKeys(streak);
  if (chainKeys.length === 0) {
    return { state, added: 0 };
  }

  const existing = new Set(state.entries.map((e) => e.dateKey));
  const toAdd: CompletionEntry[] = [];
  for (const dateKey of chainKeys) {
    if (!existing.has(dateKey)) {
      toAdd.push({
        dateKey,
        elapsedMs: INFERRED_COMPLETION_ELAPSED_MS,
        inferred: true,
      });
    }
  }

  if (toAdd.length === 0) {
    return { state, added: 0 };
  }

  const next: CompletionHistoryState = {
    entries: [...state.entries, ...toAdd].sort((a, b) =>
      a.dateKey.localeCompare(b.dateKey),
    ),
  };
  return { state: next, added: toAdd.length };
}
