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
