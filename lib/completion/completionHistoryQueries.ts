import { getRollingDateKeysEnding } from '../date/dateKeyMath';
import { daysBetweenDateKeys } from '../streak/streakLogic';
import { weekdayBand } from '../puzzles/difficulty/weekdayBand';
import type { GameType } from '../puzzles/types';
import type { CompletionEntry } from '../storage/completionHistoryStorage';
import {
  GROWTH_SMOOTHER_MEDIAN_RATIO,
  GROWTH_SMOOTHER_MIN_SAMPLES,
} from '../../constants/config';

/** True when a non-inferred completion exists for the dateKey. */
export function hasRealCompletionForDateKey(
  entries: CompletionEntry[],
  dateKey: string,
): boolean {
  return entries.some(
    (entry) => entry.dateKey === dateKey && entry.inferred !== true,
  );
}

/** dateKeys that count as a real completion (non-inferred, not abandoned). */
function completedDateKeySet(entries: CompletionEntry[]): Set<string> {
  const set = new Set<string>();
  for (const entry of entries) {
    if (entry.inferred) continue;
    if (entry.outcome === 'abandoned') continue;
    set.add(entry.dateKey);
  }
  return set;
}

/** Count of real completions within the rolling `windowDays` window ending at `today` (inclusive). */
export function countCompletedInLastDays(
  entries: CompletionEntry[],
  today: string,
  windowDays: number,
): number {
  const completed = completedDateKeySet(entries);
  return getRollingDateKeysEnding(today, windowDays).filter((key) =>
    completed.has(key),
  ).length;
}

/**
 * Whole days since the most recent real completion strictly BEFORE `today`.
 * Returns null when there is no prior completion (new user / first day).
 * Today's own entry is excluded so the gap reflects the time before today.
 */
export function daysSincePreviousCompletion(
  entries: CompletionEntry[],
  today: string,
): number | null {
  let latest: string | null = null;
  for (const entry of entries) {
    if (entry.inferred) continue;
    if (entry.outcome === 'abandoned') continue;
    if (entry.dateKey >= today) continue;
    if (latest == null || entry.dateKey > latest) latest = entry.dateKey;
  }
  return latest == null ? null : daysBetweenDateKeys(latest, today);
}

function medianElapsedMs(samples: number[]): number {
  const sorted = [...samples].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1]! + sorted[mid]!) / 2;
  }
  return sorted[mid]!;
}

/** Prior completed timings: same gameType + weekday band as `today`, excluding today. */
export function collectSameTypeBandElapsedSamples(
  entries: CompletionEntry[],
  today: string,
  gameType: GameType,
): number[] {
  const band = weekdayBand(today);
  const samples: number[] = [];

  for (const entry of entries) {
    if (entry.inferred) continue;
    if (entry.outcome === 'abandoned') continue;
    if (entry.gameType !== gameType) continue;
    if (entry.dateKey >= today) continue;
    if (weekdayBand(entry.dateKey) !== band) continue;
    if (
      typeof entry.elapsedMs !== 'number' ||
      !Number.isFinite(entry.elapsedMs) ||
      entry.elapsedMs <= 0
    ) {
      continue;
    }
    samples.push(entry.elapsedMs);
  }

  return samples;
}

/** True when enough same-type band history exists and today is clearly faster (strict). */
export function isSmootherEligible(
  entries: CompletionEntry[],
  today: string,
  gameType: GameType,
  todayElapsedMs: number,
): boolean {
  if (
    typeof todayElapsedMs !== 'number' ||
    !Number.isFinite(todayElapsedMs) ||
    todayElapsedMs <= 0
  ) {
    return false;
  }

  const samples = collectSameTypeBandElapsedSamples(entries, today, gameType);
  if (samples.length < GROWTH_SMOOTHER_MIN_SAMPLES) return false;

  const median = medianElapsedMs(samples);
  return todayElapsedMs < median * GROWTH_SMOOTHER_MEDIAN_RATIO;
}
