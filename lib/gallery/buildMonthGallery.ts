import type { CompletionEntry, CompletionOutcome } from '../storage/completionHistoryStorage';

export type MonthGalleryDay = {
  dateKey: string;
  outcome: CompletionOutcome;
};

export type BuildMonthGalleryInput = {
  monthKey: string;
  todayKey: string;
  entries: CompletionEntry[];
};

function normalizeOutcome(entry: CompletionEntry): CompletionOutcome {
  return entry.outcome === 'abandoned' ? 'abandoned' : 'completed';
}

/** Ordered dateKeys in month that have a completion record and are not after today. */
export function buildMonthGallery(input: BuildMonthGalleryInput): MonthGalleryDay[] {
  const { monthKey, todayKey, entries } = input;
  const prefix = `${monthKey}-`;

  return entries
    .filter((entry) => entry.dateKey.startsWith(prefix) && entry.dateKey <= todayKey)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    .map((entry) => ({
      dateKey: entry.dateKey,
      outcome: normalizeOutcome(entry),
    }));
}

/** D-30 gating: current view month has at least one stored completion (incl. surrender). */
export function monthHasGalleryRecords(
  monthKey: string,
  entries: CompletionEntry[],
): boolean {
  const prefix = `${monthKey}-`;
  return entries.some((entry) => entry.dateKey.startsWith(prefix));
}
