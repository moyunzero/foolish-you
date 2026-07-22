import * as enCopy from '../../locales/en/copy';
import * as zhCopy from '../../locales/zh/copy';
import type { Locale } from '../i18n/types';
import { deriveSeed, deriveSubSeed, mulberry32 } from '../puzzles/rng';
import { pickFromPool } from './poolUtils';

function hostIntroFor(locale: Locale) {
  return locale === 'zh' ? zhCopy.hostIntro : enCopy.hostIntro;
}

export function pickHostIntroLine(input: {
  dateKey: string;
  seed?: number | null;
  locale?: Locale;
}): string {
  const locale = input.locale ?? 'zh';
  const pool = hostIntroFor(locale);
  const baseSeed = input.seed ?? deriveSeed(input.dateKey);
  const rng = mulberry32(deriveSubSeed(baseSeed, 'host-intro'));
  return pickFromPool(rng, pool);
}
