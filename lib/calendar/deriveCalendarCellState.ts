import type { DailyStatus } from '../puzzles/types';
import type { CompletionEntry } from '../storage/completionHistoryStorage';

export type CalendarCellState =
  | 'completed'
  | 'abandoned'
  | 'missed'
  | 'shield'
  | 'in_progress';

export type DeriveCalendarCellStateInput = {
  dateKey: string;
  todayKey: string;
  entry?: CompletionEntry;
  todaySnapshotStatus?: DailyStatus;
  freezeDates: Set<string>;
  /** Opening day still playing (same-day or carry); never treated as missed. */
  activePlayingDateKey?: string | null;
};

export function deriveCalendarCellState(
  input: DeriveCalendarCellStateInput,
): CalendarCellState | null {
  const {
    dateKey,
    todayKey,
    entry,
    todaySnapshotStatus,
    freezeDates,
    activePlayingDateKey,
  } = input;
  if (dateKey > todayKey) return null;

  if (freezeDates.has(dateKey)) return 'shield';

  if (dateKey === todayKey && todaySnapshotStatus === 'abandoned') {
    return 'abandoned';
  }
  if (dateKey === todayKey && todaySnapshotStatus === 'completed') {
    return 'completed';
  }

  if (
    dateKey === activePlayingDateKey ||
    (dateKey === todayKey && todaySnapshotStatus === 'playing')
  ) {
    return 'in_progress';
  }

  if (entry != null) {
    if (entry.outcome === 'abandoned') return 'abandoned';
    return 'completed';
  }

  if (dateKey < todayKey) return 'missed';
  return 'missed';
}
