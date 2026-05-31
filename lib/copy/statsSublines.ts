import * as enCopy from '../../locales/en/copy';
import * as zhCopy from '../../locales/zh/copy';
import type { Locale } from '../i18n/types';
import { deriveSeed, deriveSubSeed, mulberry32 } from '../puzzles/rng';
import type { CompletionEntry } from '../storage/completionHistoryStorage';
import { formatElapsedClock } from '../time/formatElapsedClock';
import { pickFromPool } from './poolUtils';

const ELAPSED_FAST_SEC = 120;
const ELAPSED_SLOW_SEC = 480;

function poolsFor(locale: Locale) {
  return locale === 'zh' ? zhCopy.statsPools : enCopy.statsPools;
}

export function formatStatsClock(ms: number): string {
  return formatElapsedClock(ms);
}

function findPreviousCompletion(
  entries: CompletionEntry[],
  today: string,
): CompletionEntry | null {
  let best: CompletionEntry | null = null;
  for (const entry of entries) {
    if (entry.inferred) continue;
    if (entry.dateKey >= today) continue;
    if (best == null || entry.dateKey > best.dateKey) {
      best = entry;
    }
  }
  return best;
}

export function pickElapsedSubline(
  elapsedMs: number,
  entries: CompletionEntry[],
  today: string,
  rng: () => number,
  locale: Locale = 'zh',
): string {
  const pools = poolsFor(locale);
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const previous = findPreviousCompletion(entries, today);

  if (previous != null) {
    const deltaSec = Math.floor((previous.elapsedMs - elapsedMs) / 1000);
    if (deltaSec >= 5) {
      return pools.fasterThanPrevious(deltaSec);
    }
    if (deltaSec <= -5) {
      return pools.slowerThanPrevious(Math.abs(deltaSec));
    }
  }

  if (totalSeconds <= ELAPSED_FAST_SEC) {
    return pickFromPool(rng, pools.elapsedFast);
  }
  if (totalSeconds >= ELAPSED_SLOW_SEC) {
    return pickFromPool(rng, pools.elapsedSlow);
  }
  return pickFromPool(rng, pools.elapsedMid);
}

export function pickWeeklySubline(
  weeklyCount: number,
  rng: () => number,
  locale: Locale = 'zh',
): string {
  const pools = poolsFor(locale);
  if (weeklyCount >= 7) {
    return pickFromPool(rng, pools.weeklyFull);
  }
  if (weeklyCount <= 1) {
    return pickFromPool(rng, pools.weeklyLow);
  }
  return pools.weeklyRemaining(7 - weeklyCount);
}

export function pickStreakSubline(
  currentStreak: number,
  historicalMax: number,
  rng: () => number,
  locale: Locale = 'zh',
): string {
  const pools = poolsFor(locale);
  if (historicalMax <= 0) {
    return pools.streakNoRecord;
  }
  if (currentStreak >= historicalMax && currentStreak > 0) {
    return pickFromPool(rng, pools.streakRecord);
  }
  const gap = Math.max(0, historicalMax - currentStreak);
  const index = Math.floor(rng() * pools.streakChase.length);
  return pools.streakChase[Math.min(index, pools.streakChase.length - 1)]!(gap);
}

export function appendFreezeShieldSubline(
  subline: string,
  freezeCount: number,
  locale: Locale = 'zh',
): string {
  if (freezeCount <= 0) {
    return subline;
  }
  const suffix =
    locale === 'zh'
      ? zhCopy.freeze.shieldSuffix(freezeCount)
      : enCopy.freeze.shieldSuffix(freezeCount);
  return `${subline}${suffix}`;
}

export function createStatsSublineRng(
  dateKey: string,
  seed: number | null | undefined,
  cardIndex: number,
): () => number {
  const baseSeed = seed ?? deriveSeed(dateKey);
  return mulberry32(deriveSubSeed(baseSeed, `stats-card-${cardIndex}`));
}
