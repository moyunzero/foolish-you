import { formatStreakLine } from '../../../lib/copy/streak';

describe('formatStreakLine', () => {
  it('uses witty copy for no streak yet', () => {
    expect(
      formatStreakLine({
        displayStreak: 0,
        checkedInToday: false,
        streakBroken: false,
      }),
    ).toBe('连签战绩 · 完成今日入账');
  });

  it('uses witty copy when streak is broken', () => {
    expect(
      formatStreakLine({
        displayStreak: 0,
        checkedInToday: false,
        streakBroken: true,
      }),
    ).toBe('连签断了 · 通关一次重新开张');
  });

  it('celebrates today completion', () => {
    expect(
      formatStreakLine({
        displayStreak: 7,
        checkedInToday: true,
        streakBroken: false,
      }),
    ).toBe('连续 7 天 · 今天没傻过');
  });

  it('nudges when today is still open', () => {
    expect(
      formatStreakLine({
        displayStreak: 7,
        checkedInToday: false,
        streakBroken: false,
      }),
    ).toBe('连续 7 天 · 今日卷面待交');
  });
});
