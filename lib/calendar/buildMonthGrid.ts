import type { DailyStatus } from '../puzzles/types';
import type { CompletionEntry } from '../storage/completionHistoryStorage';
import { deriveCalendarCellState, type CalendarCellState } from './deriveCalendarCellState';

export type { CalendarCellState };
export { deriveCalendarCellState };

export type MonthGridCell = {
  dateKey: string | null;
  state: CalendarCellState | null;
  isToday: boolean;
  isInMonth: boolean;
};

export type BuildMonthGridInput = {
  monthKey: string;
  todayKey: string;
  entriesByDate: Map<string, CompletionEntry>;
  freezeDates: Set<string>;
  todaySnapshotStatus?: DailyStatus;
};

function parseMonthKey(monthKey: string): { year: number; month: number } {
  const [yearStr, monthStr] = monthKey.split('-');
  return { year: Number(yearStr), month: Number(monthStr) };
}

function formatMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function dateKeyFromParts(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Month key `YYYY-MM` for a dateKey. */
export function getMonthKeyForDateKey(dateKey: string): string {
  return dateKey.slice(0, 7);
}

/** Previous calendar month key. */
export function getPreviousMonthKey(monthKey: string): string {
  const { year, month } = parseMonthKey(monthKey);
  if (month === 1) {
    return formatMonthKey(year - 1, 12);
  }
  return formatMonthKey(year, month - 1);
}

/** Whether month is current or immediately previous relative to today (D-19). */
export function isMonthNavigable(monthKey: string, todayKey: string): boolean {
  const current = getMonthKeyForDateKey(todayKey);
  if (monthKey === current) return true;
  return monthKey === getPreviousMonthKey(current);
}

export function canGoToPreviousMonth(monthKey: string, todayKey: string): boolean {
  const current = getMonthKeyForDateKey(todayKey);
  return monthKey === current && isMonthNavigable(getPreviousMonthKey(current), todayKey);
}

export function canGoToNextMonth(monthKey: string, todayKey: string): boolean {
  const current = getMonthKeyForDateKey(todayKey);
  return monthKey === getPreviousMonthKey(current);
}

export function buildMonthGrid(input: BuildMonthGridInput): MonthGridCell[] {
  const { monthKey, todayKey, entriesByDate, freezeDates, todaySnapshotStatus } = input;
  const { year, month } = parseMonthKey(monthKey);
  const totalDays = daysInMonth(year, month);
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const leadingBlanks = firstWeekday;
  const totalCells = Math.ceil((leadingBlanks + totalDays) / 7) * 7;

  const cells: MonthGridCell[] = [];

  for (let i = 0; i < totalCells; i += 1) {
    const dayIndex = i - leadingBlanks + 1;
    if (dayIndex < 1 || dayIndex > totalDays) {
      cells.push({ dateKey: null, state: null, isToday: false, isInMonth: false });
      continue;
    }

    const dateKey = dateKeyFromParts(year, month, dayIndex);
    const entry = entriesByDate.get(dateKey);
    const state = deriveCalendarCellState({
      dateKey,
      todayKey,
      entry,
      todaySnapshotStatus: dateKey === todayKey ? todaySnapshotStatus : undefined,
      freezeDates,
    });

    cells.push({
      dateKey,
      state,
      isToday: dateKey === todayKey,
      isInMonth: true,
    });
  }

  return cells;
}
