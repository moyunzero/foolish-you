import * as enCopy from '../../locales/en/copy';
import * as zhCopy from '../../locales/zh/copy';
import { pickFromPool } from '../copy/poolUtils';
import { createStatsSublineRng } from '../copy/statsSublines';
import type { Locale } from '../i18n/types';
import type { CompletionEntry } from '../storage/completionHistoryStorage';
import type { StreakState } from '../streak/types';
import { getMonthKeyForDateKey, getPreviousMonthKey } from './buildMonthGrid';

export type MonthSummary = {
  currentStreak: number;
  monthCompletedCount: number;
  growthDelta: number;
  summaryTaunt: string;
};

export type ComputeMonthSummaryInput = {
  monthKey: string;
  entries: CompletionEntry[];
  streak: StreakState | null;
  seed: number | null | undefined;
  locale: Locale;
};

function calendarSummaryPools(locale: Locale) {
  return locale === 'zh' ? zhCopy.calendarSummaryPools : enCopy.calendarSummaryPools;
}

/** Count completed days in month excluding inferred and abandoned (D-18). */
export function countMonthCompletedDays(
  entries: CompletionEntry[],
  monthKey: string,
): number {
  let count = 0;
  for (const entry of entries) {
    if (!entry.dateKey.startsWith(`${monthKey}-`)) continue;
    if (entry.inferred) continue;
    if (entry.outcome === 'abandoned') continue;
    count += 1;
  }
  return count;
}

export function computeMonthSummary(input: ComputeMonthSummaryInput): MonthSummary {
  const { monthKey, entries, streak, seed, locale } = input;
  const currentStreak = streak?.currentStreak ?? 0;
  const monthCompletedCount = countMonthCompletedDays(entries, monthKey);
  const lastMonthCount = countMonthCompletedDays(entries, getPreviousMonthKey(monthKey));
  // Suppress on first month (no real previous data) and never go negative (D-18 / D-04).
  const growthDelta =
    lastMonthCount > 0 ? Math.max(0, monthCompletedCount - lastMonthCount) : 0;
  const rng = createStatsSublineRng(monthKey, seed, 9);
  const pools = calendarSummaryPools(locale);
  const summaryTaunt = pickFromPool(rng, pools.taunt);

  return {
    currentStreak,
    monthCompletedCount,
    growthDelta,
    summaryTaunt,
  };
}

export function entriesToMap(entries: CompletionEntry[]): Map<string, CompletionEntry> {
  const map = new Map<string, CompletionEntry>();
  for (const entry of entries) {
    map.set(entry.dateKey, entry);
  }
  return map;
}

export function freezeDatesFromStreak(streak: StreakState | null): Set<string> {
  return new Set(streak?.freezeConsumedDateKeys ?? []);
}

export { getMonthKeyForDateKey };
