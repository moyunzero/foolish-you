import * as enCopy from '../../locales/en/copy';
import * as zhCopy from '../../locales/zh/copy';
import type { GrowthTone } from '../growth/resolveGrowthLine';
import type { Locale } from '../i18n/types';
import { deriveSeed, deriveSubSeed, mulberry32 } from '../puzzles/rng';
import { pickFromPool } from './poolUtils';

function growthLineFor(locale: Locale) {
  return locale === 'zh' ? zhCopy.growthLine : enCopy.growthLine;
}

export function pickGrowthLine(
  tone: GrowthTone,
  dateKey: string,
  seed: number | null | undefined,
  locale: Locale,
): string {
  const pools = growthLineFor(locale);
  const baseSeed = seed ?? deriveSeed(dateKey);
  const rng = mulberry32(deriveSubSeed(baseSeed, 'growth-line'));
  return pickFromPool(rng, pools[tone]);
}
