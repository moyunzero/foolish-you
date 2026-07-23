jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { pickResultCopy } from '../../../lib/copy/resultMessages';
import * as enCopy from '../../../locales/en/copy';
import * as zhCopy from '../../../locales/zh/copy';

const SUNDAY_BRAND_ZH = /周日特辑/;
const SUNDAY_BRAND_EN = /Sunday Special/i;
const WASTE_SHAME_ZH = /浪费.*特辑|特辑.*浪费|糟蹋.*特辑/;
const WASTE_SHAME_EN = /wast(ed|ing).*(special|Sunday)|special.*wast/i;

function flattenResultText(
  copy: ReturnType<typeof pickResultCopy>,
): string {
  return [copy.headline, copy.punchline, ...copy.sublines, copy.cta].join('\n');
}

describe('pickResultCopy', () => {
  const dateKey = '2026-05-20';
  const seed = 42_424_242;

  it('returns stable copy for same dateKey, seed, and status', () => {
    const a = pickResultCopy('completed', 125_000, dateKey, seed);
    const b = pickResultCopy('completed', 125_000, dateKey, seed);
    expect(a).toEqual(b);
  });

  it('differs between completed and abandoned for same day', () => {
    const completed = pickResultCopy('completed', 60_000, dateKey, seed);
    const abandoned = pickResultCopy('abandoned', 60_000, dateKey, seed);
    expect(completed.mode).toBe('completed');
    expect(abandoned.mode).toBe('abandoned');
    expect(completed.punchline).not.toBe(abandoned.punchline);
  });

  it('returns at most one subline for completed and abandoned (D-21)', () => {
    const completed = pickResultCopy('completed', 90_000, dateKey, seed);
    const abandoned = pickResultCopy('abandoned', 90_000, dateKey, seed);
    expect(completed.sublines.length).toBeLessThanOrEqual(1);
    expect(abandoned.sublines.length).toBeLessThanOrEqual(1);
  });

  it('derives seed from dateKey when seed omitted', () => {
    const a = pickResultCopy('abandoned', 30_000, dateKey);
    const b = pickResultCopy('abandoned', 30_000, dateKey);
    expect(a).toEqual(b);
    expect(a.mode).toBe('abandoned');
    if (a.mode === 'abandoned') {
      expect(a.foolIndexPercent).toBeGreaterThanOrEqual(72);
      expect(a.foolIndexPercent).toBeLessThan(96);
    }
  });

  it('returns English copy without Chinese characters when locale is en', () => {
    const completed = pickResultCopy('completed', 90_000, dateKey, seed, 'en');
    const abandoned = pickResultCopy('abandoned', 90_000, dateKey, seed, 'en');
    const cjk = /[\u4e00-\u9fff]/;

    expect(completed.mode).toBe('completed');
    expect(abandoned.mode).toBe('abandoned');
    expect(completed.headline).not.toMatch(cjk);
    expect(completed.punchline).not.toMatch(cjk);
    expect(abandoned.headline).not.toMatch(cjk);
    if (completed.mode === 'completed') {
      expect(completed.elapsedDisplay).toMatch(/^\d+m \d+s$|^\d+s$/);
    }
  });

  it('returns stable English copy for same inputs', () => {
    const a = pickResultCopy('completed', 125_000, dateKey, seed, 'en');
    const b = pickResultCopy('completed', 125_000, dateKey, seed, 'en');
    expect(a).toEqual(b);
  });

  it('weekday completed/abandoned never mention Sunday brand', () => {
    const monday = '2026-07-13';
    for (const status of ['completed', 'abandoned'] as const) {
      const zh = flattenResultText(
        pickResultCopy(status, 90_000, monday, seed, 'zh'),
      );
      const en = flattenResultText(
        pickResultCopy(status, 90_000, monday, seed, 'en'),
      );
      expect(zh).not.toMatch(SUNDAY_BRAND_ZH);
      expect(en).not.toMatch(SUNDAY_BRAND_EN);
    }
  });

  it('Sunday completed draws from dedicated sunday success pools', () => {
    const sunday = '2026-07-12';
    const zh = pickResultCopy('completed', 90_000, sunday, seed, 'zh');
    const en = pickResultCopy('completed', 90_000, sunday, seed, 'en');

    expect(zhCopy.resultPools.sundaySuccessPunchlines).toContain(zh.punchline);
    expect(enCopy.resultPools.sundaySuccessPunchlines).toContain(en.punchline);
    for (const line of zh.sublines) {
      expect(zhCopy.resultPools.sundaySuccessSublines).toContain(line);
    }
    for (const line of en.sublines) {
      expect(enCopy.resultPools.sundaySuccessSublines).toContain(line);
    }
  });

  it('Sunday abandoned draws from dedicated sunday fail pools without waste shame', () => {
    const sunday = '2026-07-12';
    const zh = pickResultCopy('abandoned', 90_000, sunday, seed, 'zh');
    const en = pickResultCopy('abandoned', 90_000, sunday, seed, 'en');

    expect(zhCopy.resultPools.sundayFailPunchlines).toContain(zh.punchline);
    expect(enCopy.resultPools.sundayFailPunchlines).toContain(en.punchline);
    expect(flattenResultText(zh)).not.toMatch(WASTE_SHAME_ZH);
    expect(flattenResultText(en)).not.toMatch(WASTE_SHAME_EN);

    const zhPoolText = [
      ...zhCopy.resultPools.sundayFailPunchlines,
      ...zhCopy.resultPools.sundayFailSublines,
    ].join('\n');
    const enPoolText = [
      ...enCopy.resultPools.sundayFailPunchlines,
      ...enCopy.resultPools.sundayFailSublines,
    ].join('\n');
    expect(zhPoolText).not.toMatch(WASTE_SHAME_ZH);
    expect(enPoolText).not.toMatch(WASTE_SHAME_EN);
  });

  it('Sunday pools may name the brand and stay deterministic', () => {
    const sunday = '2026-07-12';
    const a = pickResultCopy('completed', 90_000, sunday, seed, 'zh');
    const b = pickResultCopy('completed', 90_000, sunday, seed, 'zh');
    expect(a).toEqual(b);

    const zhPools = [
      ...zhCopy.resultPools.sundaySuccessPunchlines,
      ...zhCopy.resultPools.sundaySuccessSublines,
      ...zhCopy.resultPools.sundayFailPunchlines,
      ...zhCopy.resultPools.sundayFailSublines,
    ].join('\n');
    const enPools = [
      ...enCopy.resultPools.sundaySuccessPunchlines,
      ...enCopy.resultPools.sundaySuccessSublines,
      ...enCopy.resultPools.sundayFailPunchlines,
      ...enCopy.resultPools.sundayFailSublines,
    ].join('\n');
    expect(zhPools).toMatch(SUNDAY_BRAND_ZH);
    expect(enPools).toMatch(SUNDAY_BRAND_EN);
  });
});
