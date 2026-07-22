import { pickHostIntroLine } from '../../../lib/copy/hostIntro';
import * as enCopy from '../../../locales/en/copy';
import * as zhCopy from '../../../locales/zh/copy';

const DATE_KEY = '2026-07-22';
const SEED = 42_424_242;

describe('pickHostIntroLine', () => {
  it('returns a line from the zh pool', () => {
    const line = pickHostIntroLine({ dateKey: DATE_KEY, seed: SEED, locale: 'zh' });
    expect(zhCopy.hostIntro).toContain(line);
  });

  it('returns a line from the en pool', () => {
    const line = pickHostIntroLine({ dateKey: DATE_KEY, seed: SEED, locale: 'en' });
    expect(enCopy.hostIntro).toContain(line);
  });

  it('is stable for the same dateKey + seed + locale', () => {
    const a = pickHostIntroLine({ dateKey: DATE_KEY, seed: SEED, locale: 'zh' });
    const b = pickHostIntroLine({ dateKey: DATE_KEY, seed: SEED, locale: 'zh' });
    expect(a).toBe(b);
  });

  it('falls back to deriveSeed(dateKey) when seed is null/undefined', () => {
    const a = pickHostIntroLine({ dateKey: DATE_KEY, seed: null, locale: 'zh' });
    const b = pickHostIntroLine({ dateKey: DATE_KEY, locale: 'zh' });
    expect(a).toBe(b);
    expect(zhCopy.hostIntro).toContain(a);
  });

  it('en pool contains no CJK characters', () => {
    const cjk = /[\u4e00-\u9fff]/;
    for (const line of enCopy.hostIntro) {
      expect(line).not.toMatch(cjk);
    }
  });

  it('zh host intro lines are roughly 12–20 characters', () => {
    for (const line of zhCopy.hostIntro) {
      expect(line.length).toBeGreaterThanOrEqual(10);
      expect(line.length).toBeLessThanOrEqual(22);
    }
  });
});
