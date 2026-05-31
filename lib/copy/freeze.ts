import * as enCopy from '../../locales/en/copy';
import * as zhCopy from '../../locales/zh/copy';
import type { Locale } from '../i18n/types';
import { deriveSeed, deriveSubSeed, mulberry32 } from '../puzzles/rng';
import { pickFromPool } from './poolUtils';

function freezeFor(locale: Locale) {
  return locale === 'zh' ? zhCopy.freeze : enCopy.freeze;
}

export function pickFreezeConsumedLine(
  dateKey: string,
  seed: number | null | undefined,
  locale: Locale = 'zh',
): string {
  const pool = freezeFor(locale).consumedLines;
  const baseSeed = seed ?? deriveSeed(dateKey);
  const rng = mulberry32(deriveSubSeed(baseSeed, 'freeze-consumed'));
  return pickFromPool(rng, pool);
}

export function formatFreezeShieldSuffix(
  count: number,
  locale: Locale = 'zh',
): string {
  if (count <= 0) return '';
  return freezeFor(locale).shieldSuffix(count);
}
