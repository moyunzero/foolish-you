import * as enCopy from '../../locales/en/copy';
import * as zhCopy from '../../locales/zh/copy';
import type { Locale } from '../i18n/types';
import { deriveSeed, deriveSubSeed, mulberry32 } from '../puzzles/rng';
import { pickFromPool } from './poolUtils';

function shareFor(locale: Locale) {
  return locale === 'zh' ? zhCopy.share : enCopy.share;
}

export function pickShareSuccessToast(
  seed?: number | null,
  dateKey?: string,
  locale: Locale = 'zh',
): string {
  const base = seed ?? (dateKey != null ? deriveSeed(dateKey) : 1);
  const rng = mulberry32(deriveSubSeed(base, 'share-success-toast'));
  return pickFromPool(rng, shareFor(locale).successToasts);
}

export function pickShareErrorToast(
  seed?: number | null,
  dateKey?: string,
  locale: Locale = 'zh',
): string {
  const base = seed ?? (dateKey != null ? deriveSeed(dateKey) : 1);
  const rng = mulberry32(deriveSubSeed(base, 'share-error-toast'));
  return pickFromPool(rng, shareFor(locale).errorToasts);
}
