import type { DailyStatus } from '../puzzles/types';
import type { CompletionEntry } from '../storage/completionHistoryStorage';

export type CalendarCellState = 'completed' | 'abandoned' | 'missed' | 'shield';

export type DeriveCalendarCellStateInput = {
  dateKey: string;
  todayKey: string;
  entry?: CompletionEntry;
  todaySnapshotStatus?: DailyStatus;
  freezeDates: Set<string>;
};

export function deriveCalendarCellState(
  input: DeriveCalendarCellStateInput,
): CalendarCellState | null {
  const { dateKey, todayKey, entry, todaySnapshotStatus, freezeDates } = input;
  if (dateKey > todayKey) return null;

  if (freezeDates.has(dateKey)) return 'shield';

  if (dateKey === todayKey && todaySnapshotStatus === 'abandoned') return 'abandoned';
  if (dateKey === todayKey && todaySnapshotStatus === 'completed') return 'completed';
  if (dateKey === todayKey && todaySnapshotStatus === 'playing') return 'missed';

  if (entry != null) {
    if (entry.outcome === 'abandoned') return 'abandoned';
    return 'completed';
  }

  if (dateKey < todayKey) return 'missed';
  return 'missed';
}
