import * as enCopy from '../../locales/en/copy';
import * as zhCopy from '../../locales/zh/copy';
import type { Locale } from '../i18n/types';
import { deriveSeed, deriveSubSeed, mulberry32 } from '../puzzles/rng';
import { pickFromPool } from './poolUtils';

function abandonConfirmFor(locale: Locale) {
  return locale === 'zh' ? zhCopy.abandonConfirm : enCopy.abandonConfirm;
}

export function pickAbandonConfirmBody(input: {
  dateKey: string;
  seed?: number | null;
  locale?: Locale;
}): string {
  const locale = input.locale ?? 'zh';
  const pool = abandonConfirmFor(locale);
  const baseSeed = input.seed ?? deriveSeed(input.dateKey);
  const rng = mulberry32(deriveSubSeed(baseSeed, 'abandon-confirm'));
  return pickFromPool(rng, pool);
}
