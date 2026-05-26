import { clearCompletionHistory, recordCompletion } from '../../../lib/storage/completionHistoryStorage';
import { countWeeklyCompleted } from '../../../lib/stats/weeklyCompletedCount';

describe('countWeeklyCompleted', () => {
  beforeEach(async () => {
    await clearCompletionHistory();
  });

  it('returns 0 when no history', async () => {
    await expect(countWeeklyCompleted('2026-05-19')).resolves.toBe(0);
  });

  it('counts only entries in rolling 7-day window', async () => {
    await recordCompletion('2026-05-12', 60_000);
    await recordCompletion('2026-05-13', 60_000);
    await recordCompletion('2026-05-19', 60_000);

    await expect(countWeeklyCompleted('2026-05-19')).resolves.toBe(2);
  });

  it('counts all 7 when window is full', async () => {
    const keys = [
      '2026-05-13',
      '2026-05-14',
      '2026-05-15',
      '2026-05-16',
      '2026-05-17',
      '2026-05-18',
      '2026-05-19',
    ];
    for (const key of keys) {
      await recordCompletion(key, 90_000);
    }
    await expect(countWeeklyCompleted('2026-05-19')).resolves.toBe(7);
  });
});
