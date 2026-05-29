import { Platform } from 'react-native';

import * as enCopy from '../../locales/en/copy';
import * as zhCopy from '../../locales/zh/copy';
import { formatElapsedDuration } from '../i18n/format';
import type { Locale } from '../i18n/types';
import { deriveSeed, deriveSubSeed, mulberry32 } from '../puzzles/rng';
import type { DailyStatus } from '../puzzles/types';
import {
  pickFromPool,
  pickUniquePlainLines,
  seededBrainCells,
  seededFoolIndexPercent,
} from './poolUtils';

export type CompletedResultCopy = {
  mode: 'completed';
  headline: string;
  punchline: string;
  sublines: string[];
  elapsedDisplay: string;
  cta: string;
};

export type AbandonedResultCopy = {
  mode: 'abandoned';
  headline: string;
  punchline: string;
  sublines: string[];
  foolIndexPercent: number;
  foolIndexHint: string;
  statsLine: string;
  cta: string;
};

export type ResultCopy = CompletedResultCopy | AbandonedResultCopy;

function copyFor(locale: Locale) {
  return locale === 'zh' ? zhCopy : enCopy;
}

function formatElapsedClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** @deprecated Use formatElapsedDuration from lib/i18n/format */
export function formatElapsedDurationLegacy(ms: number): string {
  return formatElapsedDuration(ms, 'zh');
}

export function getResultFooterHint(locale: Locale = 'zh'): string {
  const footer = copyFor(locale).resultFooter;
  return Platform.OS === 'ios' ? footer.ios : footer.default;
}

export function pickResultCopy(
  status: Exclude<DailyStatus, 'playing'>,
  elapsedMs: number,
  dateKey: string,
  seed?: number | null,
  locale: Locale = 'zh',
): ResultCopy {
  const pools = copyFor(locale).resultPools;
  const baseSeed = seed ?? deriveSeed(dateKey);
  const rng = mulberry32(deriveSubSeed(baseSeed, `result-${status}`));
  const elapsedDisplay = formatElapsedDuration(elapsedMs, locale);

  if (status === 'completed') {
    const punchline = pickFromPool(rng, pools.successPunchlines);
    const sublines = pickUniquePlainLines(rng, pools.successSublines, 2, [
      punchline,
    ]);

    return {
      mode: 'completed',
      headline: pickFromPool(rng, pools.successHeadlines),
      punchline,
      sublines,
      elapsedDisplay,
      cta: pickFromPool(rng, pools.successCtas),
    };
  }

  const punchline = pickFromPool(rng, pools.failPunchlines);
  const sublines = pickUniquePlainLines(rng, pools.failSublines, 2, [punchline]);

  return {
    mode: 'abandoned',
    headline: pickFromPool(rng, pools.failHeadlines),
    punchline,
    sublines,
    foolIndexPercent: seededFoolIndexPercent(rng),
    foolIndexHint: pickFromPool(rng, pools.foolIndexHints),
    statsLine: pools.abandonedStatsLine(
      formatElapsedClock(elapsedMs),
      seededBrainCells(rng),
    ),
    cta: pickFromPool(rng, pools.failCtas),
  };
}
