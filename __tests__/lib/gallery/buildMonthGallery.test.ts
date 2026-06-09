import {
  buildMonthGallery,
  monthHasGalleryRecords,
} from '../../../lib/gallery/buildMonthGallery';
import type { CompletionEntry } from '../../../lib/storage/completionHistoryStorage';

describe('buildMonthGallery', () => {
  const monthKey = '2026-05';
  const todayKey = '2026-05-20';

  it('returns ordered dateKeys with records up to today only', () => {
    const entries: CompletionEntry[] = [
      { dateKey: '2026-05-19', elapsedMs: 1000 },
      { dateKey: '2026-05-21', elapsedMs: 1000 },
      { dateKey: '2026-05-03', elapsedMs: 1000, outcome: 'abandoned' },
      { dateKey: '2026-04-30', elapsedMs: 1000 },
    ];

    expect(buildMonthGallery({ monthKey, todayKey, entries })).toEqual([
      { dateKey: '2026-05-03', outcome: 'abandoned' },
      { dateKey: '2026-05-19', outcome: 'completed' },
    ]);
  });

  it('monthHasGalleryRecords is true when any month entry exists', () => {
    expect(
      monthHasGalleryRecords(monthKey, [
        { dateKey: '2026-05-01', elapsedMs: 1 },
      ]),
    ).toBe(true);
    expect(monthHasGalleryRecords(monthKey, [])).toBe(false);
  });
});
