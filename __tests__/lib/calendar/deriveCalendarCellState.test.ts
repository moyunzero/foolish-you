import { deriveCalendarCellState } from '../../../lib/calendar/deriveCalendarCellState';
import {
  buildMonthGrid,
  canGoToNextMonth,
  canGoToPreviousMonth,
  getMonthKeyForDateKey,
  getPreviousMonthKey,
  isMonthNavigable,
} from '../../../lib/calendar/buildMonthGrid';

describe('deriveCalendarCellState', () => {
  const todayKey = '2026-05-20';
  const freezeDates = new Set(['2026-05-15']);

  it('returns null for future dates', () => {
    expect(
      deriveCalendarCellState({
        dateKey: '2026-05-21',
        todayKey,
        freezeDates,
      }),
    ).toBeNull();
  });

  it('returns shield when freeze date matches (priority over completion)', () => {
    expect(
      deriveCalendarCellState({
        dateKey: '2026-05-15',
        todayKey,
        entry: { dateKey: '2026-05-15', elapsedMs: 1000 },
        freezeDates,
      }),
    ).toBe('shield');
  });

  it('returns in_progress when today is still playing (D-04)', () => {
    expect(
      deriveCalendarCellState({
        dateKey: todayKey,
        todayKey,
        todaySnapshotStatus: 'playing',
        freezeDates: new Set(),
      }),
    ).toBe('in_progress');
  });

  it('returns in_progress for carry opening day via activePlayingDateKey (D-01)', () => {
    expect(
      deriveCalendarCellState({
        dateKey: '2026-05-19',
        todayKey,
        freezeDates: new Set(),
        activePlayingDateKey: '2026-05-19',
      }),
    ).toBe('in_progress');
  });

  it('returns missed for empty gap between opening and wall (D-03)', () => {
    expect(
      deriveCalendarCellState({
        dateKey: '2026-05-18',
        todayKey: '2026-05-20',
        freezeDates: new Set(),
        activePlayingDateKey: '2026-05-19',
      }),
    ).toBe('missed');
  });

  it('shield beats in_progress when freezeDates has dateKey', () => {
    expect(
      deriveCalendarCellState({
        dateKey: '2026-05-19',
        todayKey,
        freezeDates: new Set(['2026-05-19']),
        activePlayingDateKey: '2026-05-19',
      }),
    ).toBe('shield');
  });

  it('returns abandoned for today abandon snapshot', () => {
    expect(
      deriveCalendarCellState({
        dateKey: todayKey,
        todayKey,
        todaySnapshotStatus: 'abandoned',
        freezeDates: new Set(),
      }),
    ).toBe('abandoned');
  });

  it('returns completed for today completed snapshot', () => {
    expect(
      deriveCalendarCellState({
        dateKey: todayKey,
        todayKey,
        todaySnapshotStatus: 'completed',
        freezeDates: new Set(),
      }),
    ).toBe('completed');
  });

  it('returns abandoned from history entry outcome', () => {
    expect(
      deriveCalendarCellState({
        dateKey: '2026-05-18',
        todayKey,
        entry: { dateKey: '2026-05-18', elapsedMs: 500, outcome: 'abandoned' },
        freezeDates: new Set(),
      }),
    ).toBe('abandoned');
  });

  it('returns completed for inferred entry (grid display)', () => {
    expect(
      deriveCalendarCellState({
        dateKey: '2026-05-17',
        todayKey,
        entry: { dateKey: '2026-05-17', elapsedMs: 0, inferred: true },
        freezeDates: new Set(),
      }),
    ).toBe('completed');
  });

  it('returns missed for past day without entry', () => {
    expect(
      deriveCalendarCellState({
        dateKey: '2026-05-10',
        todayKey,
        freezeDates: new Set(),
      }),
    ).toBe('missed');
  });
});

describe('month navigation (D-19)', () => {
  const todayKey = '2026-05-20';
  const current = getMonthKeyForDateKey(todayKey);
  const previous = getPreviousMonthKey(current);

  it('allows current and previous month only', () => {
    expect(isMonthNavigable(current, todayKey)).toBe(true);
    expect(isMonthNavigable(previous, todayKey)).toBe(true);
    expect(isMonthNavigable('2026-03', todayKey)).toBe(false);
  });

  it('can navigate prev from current month', () => {
    expect(canGoToPreviousMonth(current, todayKey)).toBe(true);
    expect(canGoToPreviousMonth(previous, todayKey)).toBe(false);
  });

  it('can navigate next from previous month back to current', () => {
    expect(canGoToNextMonth(previous, todayKey)).toBe(true);
    expect(canGoToNextMonth(current, todayKey)).toBe(false);
  });
});

describe('buildMonthGrid', () => {
  it('marks in-month cells and pads leading blanks', () => {
    const cells = buildMonthGrid({
      monthKey: '2026-05',
      todayKey: '2026-05-20',
      entriesByDate: new Map([
        ['2026-05-19', { dateKey: '2026-05-19', elapsedMs: 1000 }],
      ]),
      freezeDates: new Set(),
      todaySnapshotStatus: 'completed',
    });

    const inMonth = cells.filter((c) => c.isInMonth);
    expect(inMonth).toHaveLength(31);
    expect(cells.some((c) => !c.isInMonth)).toBe(true);

    const today = inMonth.find((c) => c.dateKey === '2026-05-20');
    expect(today?.state).toBe('completed');
    expect(today?.isToday).toBe(true);
  });

  it('marks carry opening day in_progress via activePlayingDateKey', () => {
    const cells = buildMonthGrid({
      monthKey: '2026-05',
      todayKey: '2026-05-20',
      entriesByDate: new Map(),
      freezeDates: new Set(),
      todaySnapshotStatus: 'playing',
      activePlayingDateKey: '2026-05-19',
    });

    const opening = cells.find((c) => c.dateKey === '2026-05-19');
    const gap = cells.find((c) => c.dateKey === '2026-05-18');
    const wallToday = cells.find((c) => c.dateKey === '2026-05-20');

    expect(opening?.state).toBe('in_progress');
    expect(gap?.state).toBe('missed');
    expect(wallToday?.state).toBe('in_progress');
    expect(wallToday?.isToday).toBe(true);
  });
});
