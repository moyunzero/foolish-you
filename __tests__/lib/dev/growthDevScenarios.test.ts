import { computeMonthSummary, getMonthKeyForDateKey } from '../../../lib/calendar/monthSummary';
import { applyGrowthDevScenario } from '../../../lib/dev/growthDevScenarios';
import { loadCompletionHistory, saveCompletionHistory } from '../../../lib/storage/completionHistoryStorage';

jest.mock('../../../constants/dev', () => ({
  DEV_TOOLS_ENABLED: true,
}));

jest.mock('../../../lib/date/localDay', () => ({
  getLocalDateKey: () => '2026-06-20',
}));

describe('growthDevScenarios', () => {
  beforeEach(async () => {
    await saveCompletionHistory({ entries: [] });
  });

  it('growth-calendar seeds positive month summary delta', async () => {
    await applyGrowthDevScenario('growth-calendar');
    const { entries } = await loadCompletionHistory();
    const monthKey = getMonthKeyForDateKey('2026-06-20');
    const summary = computeMonthSummary({
      monthKey,
      entries: [
        ...entries,
        { dateKey: '2026-06-20', elapsedMs: 120_000, outcome: 'completed' },
      ],
      streak: null,
      seed: 42,
      locale: 'zh',
    });
    expect(summary.growthDelta).toBeGreaterThan(0);
    expect(summary.monthCompletedCount).toBeGreaterThan(0);
  });

  it('growth-smoother seeds same-weekday band history without hot rhythm', async () => {
    await applyGrowthDevScenario('growth-smoother');
    const { entries } = await loadCompletionHistory();
    expect(entries).toHaveLength(4);
    expect(entries.every((e) => e.gameType === 'sudoku')).toBe(true);
    expect(entries.every((e) => e.elapsedMs === 120_000)).toBe(true);
  });
});
