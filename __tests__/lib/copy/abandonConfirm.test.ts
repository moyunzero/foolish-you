import { pickAbandonConfirmBody } from '../../../lib/copy/abandonConfirm';
import * as enCopy from '../../../locales/en/copy';
import * as zhCopy from '../../../locales/zh/copy';

const DATE_KEY = '2026-07-22';
const SEED = 42_424_242;

describe('pickAbandonConfirmBody', () => {
  it('returns a line from the zh pool', () => {
    const line = pickAbandonConfirmBody({
      dateKey: DATE_KEY,
      seed: SEED,
      locale: 'zh',
    });
    expect(zhCopy.abandonConfirm).toContain(line);
  });

  it('returns a line from the en pool', () => {
    const line = pickAbandonConfirmBody({
      dateKey: DATE_KEY,
      seed: SEED,
      locale: 'en',
    });
    expect(enCopy.abandonConfirm).toContain(line);
  });

  it('is stable for the same dateKey + seed + locale', () => {
    const a = pickAbandonConfirmBody({
      dateKey: DATE_KEY,
      seed: SEED,
      locale: 'zh',
    });
    const b = pickAbandonConfirmBody({
      dateKey: DATE_KEY,
      seed: SEED,
      locale: 'zh',
    });
    expect(a).toBe(b);
  });

  it('falls back to deriveSeed(dateKey) when seed is null/undefined', () => {
    const a = pickAbandonConfirmBody({
      dateKey: DATE_KEY,
      seed: null,
      locale: 'zh',
    });
    const b = pickAbandonConfirmBody({ dateKey: DATE_KEY, locale: 'zh' });
    expect(a).toBe(b);
    expect(zhCopy.abandonConfirm).toContain(a);
  });

  it('en pool contains no CJK characters', () => {
    const cjk = /[\u4e00-\u9fff]/;
    for (const line of enCopy.abandonConfirm) {
      expect(line).not.toMatch(cjk);
    }
  });
});
