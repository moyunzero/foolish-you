import { addDaysToDateKey } from '../../../lib/date/dateKeyMath';
import { getLocalDateKey } from '../../../lib/date/localDay';
import {
  applyStreakDevScenario,
  formatStreakDevSummary,
} from '../../../lib/dev/streakDevScenarios';
import { saveCompletionHistory } from '../../../lib/storage/completionHistoryStorage';
import {
  loadStreakState,
  saveStreakState,
} from '../../../lib/storage/streakStorage';

jest.mock('../../../constants/dev', () => ({
  DEV_TOOLS_ENABLED: true,
}));

jest.mock('../../../lib/storage/streakStorage', () => ({
  clearStreakState: jest.fn(async () => undefined),
  saveStreakState: jest.fn(async () => true),
  loadStreakState: jest.fn(),
}));

jest.mock('../../../lib/storage/completionHistoryStorage', () => ({
  saveCompletionHistory: jest.fn(async () => true),
}));

describe('streakDevScenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('formatStreakDevSummary renders null and populated state', () => {
    expect(formatStreakDevSummary(null)).toContain('null');
    expect(
      formatStreakDevSummary({
        currentStreak: 3,
        lastCheckInDateKey: '2026-05-18',
        historicalMax: 3,
        freezeCount: 1,
        lastFreezeGrantWeekKey: '2026-W21',
        freezeConsumedSessionKey: null,
      }),
    ).toContain('shield 1');
  });

  it('gap2-freeze-ready seeds two-day gap with one shield', async () => {
    const today = getLocalDateKey();
    const twoDaysAgo = addDaysToDateKey(today, -2);

    await applyStreakDevScenario('gap2-freeze-ready');

    expect(saveCompletionHistory).toHaveBeenCalledWith({ entries: [] });
    expect(saveStreakState).toHaveBeenCalledWith(
      expect.objectContaining({
        lastCheckInDateKey: twoDaysAgo,
        freezeCount: 1,
        currentStreak: 4,
      }),
    );
  });

  it('gap2-yesterday-real writes real completion for yesterday', async () => {
    const today = getLocalDateKey();
    const yesterday = addDaysToDateKey(today, -1);

    await applyStreakDevScenario('gap2-yesterday-real');

    expect(saveCompletionHistory).toHaveBeenCalledWith({
      entries: [{ dateKey: yesterday, elapsedMs: 120_000 }],
    });
  });

  it('no-ops when dev disabled', async () => {
    jest.resetModules();
    jest.doMock('../../../constants/dev', () => ({
      DEV_TOOLS_ENABLED: false,
    }));
    const { applyStreakDevScenario: applyDisabled } = await import(
      '../../../lib/dev/streakDevScenarios'
    );
    expect(await applyDisabled('clear')).toBe(false);
  });
});
