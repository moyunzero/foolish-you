import * as enCopy from '../../locales/en/copy';
import * as zhCopy from '../../locales/zh/copy';
import type { Locale } from '../i18n/types';
import { deriveSeed, deriveSubSeed, mulberry32 } from '../puzzles/rng';
import { pickFromPool } from './poolUtils';

function missedYesterdayFor(locale: Locale) {
  return locale === 'zh' ? zhCopy.missedYesterday : enCopy.missedYesterday;
}

export function pickMissedYesterdayLine(input: {
  todayKey: string;
  seed?: number | null;
  locale?: Locale;
  freezeConsumedToday: boolean;
}): string {
  const locale = input.locale ?? 'zh';
  const pools = missedYesterdayFor(locale);
  const pool = input.freezeConsumedToday ? pools.softPool : pools.recallPool;
  const baseSeed = input.seed ?? deriveSeed(input.todayKey);
  const rng = mulberry32(deriveSubSeed(baseSeed, 'missed-yesterday'));
  return pickFromPool(rng, pool);
}
