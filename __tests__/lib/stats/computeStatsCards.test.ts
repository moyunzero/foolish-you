import { clearCompletionHistory, recordCompletion } from '../../../lib/storage/completionHistoryStorage';
import { clearStreakState, saveStreakState } from '../../../lib/storage/streakStorage';
import { computeStatsCards } from '../../../lib/stats/computeStatsCards';

describe('computeStatsCards', () => {
  beforeEach(async () => {
    await clearCompletionHistory();
    await clearStreakState();
  });

  it('first-time user sees 1/7 and streak max 1', async () => {
    await saveStreakState({
      currentStreak: 1,
      lastCheckInDateKey: '2026-05-19',
      historicalMax: 1,
    });
    await recordCompletion('2026-05-19', 200_000);

    const data = await computeStatsCards({
      elapsedMs: 200_000,
      today: '2026-05-19',
      seed: 42,
    });

    expect(data.cards[0].label).toBe('今日');
    expect(data.cards[0].value).toBe('03:20');
    expect(data.cards[1].value).toBe('1 / 7');
    expect(data.cards[2].value).toBe('1 天');
  });

  it('long-term user keeps historical max above current', async () => {
    await saveStreakState({
      currentStreak: 7,
      lastCheckInDateKey: '2026-05-19',
      historicalMax: 17,
    });
    await recordCompletion('2026-05-19', 150_000);

    const data = await computeStatsCards({
      elapsedMs: 150_000,
      today: '2026-05-19',
      seed: 99,
    });

    expect(data.cards[2].value).toBe('17 天');
    expect(data.cards[2].subline).toContain('10');
  });
});
