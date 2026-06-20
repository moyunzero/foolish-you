import { getRollingDateKeysEnding } from '../date/dateKeyMath';
import { daysBetweenDateKeys } from '../streak/streakLogic';
import type { CompletionEntry } from '../storage/completionHistoryStorage';

/** True when a non-inferred completion exists for the dateKey. */
export function hasRealCompletionForDateKey(
  entries: CompletionEntry[],
  dateKey: string,
): boolean {
  return entries.some(
    (entry) => entry.dateKey === dateKey && entry.inferred !== true,
  );
}

/** dateKeys that count as a real completion (non-inferred, not abandoned). */
function completedDateKeySet(entries: CompletionEntry[]): Set<string> {
  const set = new Set<string>();
  for (const entry of entries) {
    if (entry.inferred) continue;
    if (entry.outcome === 'abandoned') continue;
    set.add(entry.dateKey);
  }
  return set;
}

/** Count of real completions within the rolling `windowDays` window ending at `today` (inclusive). */
export function countCompletedInLastDays(
  entries: CompletionEntry[],
  today: string,
  windowDays: number,
): number {
  const completed = completedDateKeySet(entries);
  return getRollingDateKeysEnding(today, windowDays).filter((key) =>
    completed.has(key),
  ).length;
}

/**
 * Whole days since the most recent real completion strictly BEFORE `today`.
 * Returns null when there is no prior completion (new user / first day).
 * Today's own entry is excluded so the gap reflects the time before today.
 */
export function daysSincePreviousCompletion(
  entries: CompletionEntry[],
  today: string,
): number | null {
  let latest: string | null = null;
  for (const entry of entries) {
    if (entry.inferred) continue;
    if (entry.outcome === 'abandoned') continue;
    if (entry.dateKey >= today) continue;
    if (latest == null || entry.dateKey > latest) latest = entry.dateKey;
  }
  return latest == null ? null : daysBetweenDateKeys(latest, today);
}
