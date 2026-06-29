import { pickGrowthLine } from '../../../lib/copy/growthLine';
import type { GrowthTone } from '../../../lib/growth/resolveGrowthLine';
import * as enCopy from '../../../locales/en/copy';
import * as zhCopy from '../../../locales/zh/copy';

const DATE_KEY = '2026-05-19';
const SEED = 9001;
const TONES: GrowthTone[] = ['comeback', 'hot', 'steady', 'smoother'];

describe('pickGrowthLine', () => {
  it('returns a line belonging to the matching zh pool', () => {
    for (const tone of TONES) {
      const line = pickGrowthLine(tone, DATE_KEY, SEED, 'zh');
      expect(zhCopy.growthLine[tone]).toContain(line);
    }
  });

  it('returns a line belonging to the matching en pool', () => {
    for (const tone of TONES) {
      const line = pickGrowthLine(tone, DATE_KEY, SEED, 'en');
      expect(enCopy.growthLine[tone]).toContain(line);
    }
  });

  it('is stable for the same dateKey + seed', () => {
    for (const tone of TONES) {
      const a = pickGrowthLine(tone, DATE_KEY, SEED, 'zh');
      const b = pickGrowthLine(tone, DATE_KEY, SEED, 'zh');
      expect(a).toBe(b);
    }
  });

  it('falls back to deriveSeed(dateKey) when seed is null/undefined', () => {
    for (const tone of TONES) {
      const a = pickGrowthLine(tone, DATE_KEY, null, 'zh');
      const b = pickGrowthLine(tone, DATE_KEY, undefined, 'zh');
      expect(a).toBe(b);
      expect(zhCopy.growthLine[tone]).toContain(a);
    }
  });

  it('en pools contain no CJK characters', () => {
    const cjk = /[\u4e00-\u9fff]/;
    for (const tone of TONES) {
      for (const line of enCopy.growthLine[tone]) {
        expect(line).not.toMatch(cjk);
      }
    }
  });

  it('zh and en expose identical tone key sets', () => {
    expect(Object.keys(zhCopy.growthLine).sort()).toEqual(
      Object.keys(enCopy.growthLine).sort(),
    );
  });
});
