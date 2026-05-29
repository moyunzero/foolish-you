import * as enCopy from '../../locales/en/copy';
import * as zhCopy from '../../locales/zh/copy';
import type { Locale } from '../i18n/types';
import { deriveSeed, deriveSubSeed, mulberry32 } from '../puzzles/rng';
import { pickFromPool } from './poolUtils';

function shareFor(locale: Locale) {
  return locale === 'zh' ? zhCopy.share : enCopy.share;
}

export function pickNonogramShareTail(
  seed: number,
  dateKey: string,
  locale: Locale = 'zh',
): string {
  const baseSeed = seed || deriveSeed(dateKey);
  const rng = mulberry32(deriveSubSeed(baseSeed, 'share-nonogram-tail'));
  return pickFromPool(rng, shareFor(locale).nonogramTails);
}

export function pickAbandonShareTail(locale: Locale = 'zh'): string {
  return shareFor(locale).abandonTails[0]!;
}

export function pickAbandonShareTailSeeded(
  seed: number,
  dateKey: string,
  locale: Locale = 'zh',
): string {
  const baseSeed = seed || deriveSeed(dateKey);
  const rng = mulberry32(deriveSubSeed(baseSeed, 'share-abandon-tail'));
  return pickFromPool(rng, shareFor(locale).abandonTails);
}

export function pickSuccessShareTail(
  seed: number,
  dateKey: string,
  locale: Locale = 'zh',
): string {
  const baseSeed = seed || deriveSeed(dateKey);
  const rng = mulberry32(deriveSubSeed(baseSeed, 'share-success-tail'));
  return pickFromPool(rng, shareFor(locale).successTails);
}

export function getShareCardCta(locale: Locale = 'zh'): string {
  return shareFor(locale).cardCta;
}

/** @deprecated Use getShareCardCta(locale) */
export const SHARE_CARD_CTA = zhCopy.share.cardCta;
