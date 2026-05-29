import {
  formatElapsedDuration,
  formatTodayMeta,
  getAppDisplayName,
} from '../../../lib/i18n/format';

describe('getAppDisplayName', () => {
  it('returns Chinese brand for zh', () => {
    expect(getAppDisplayName('zh')).toBe('傻了么');
  });

  it('returns Silly Me for en', () => {
    expect(getAppDisplayName('en')).toBe('Silly Me');
  });
});

describe('formatElapsedDuration', () => {
  it('formats zh duration with 分/秒', () => {
    expect(formatElapsedDuration(192_000, 'zh')).toBe('3 分 12 秒');
    expect(formatElapsedDuration(45_000, 'zh')).toBe('45 秒');
  });

  it('formats en duration with m/s', () => {
    expect(formatElapsedDuration(192_000, 'en')).toBe('3m 12s');
    expect(formatElapsedDuration(45_000, 'en')).toBe('45s');
  });
});

describe('formatTodayMeta', () => {
  it('formats zh today line', () => {
    expect(formatTodayMeta('2026-05-26', 'zh')).toBe('今日 · 2026-05-26');
  });

  it('formats en today line', () => {
    expect(formatTodayMeta('2026-05-26', 'en')).toBe('Today · 2026-05-26');
  });

  it('uses em dash placeholder when dateKey missing', () => {
    expect(formatTodayMeta(null, 'en')).toBe('Today · —');
  });
});
