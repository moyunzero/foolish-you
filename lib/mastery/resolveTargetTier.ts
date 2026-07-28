import { weekdayBand } from '../puzzles/difficulty/weekdayBand';
import {
  tierFromIndex,
  tierIndex,
  type DifficultyTier,
} from '../puzzles/difficulty/tiers';
import { daysSincePractice, retrievability } from './fsrsLite';
import type { ResolveTargetTierInput } from './types';

const RETRIEVABILITY_SOFTEN_THRESHOLD = 0.5;

/** Map weekdayBand 0..6 → nudge −1 | 0 | +1 (Mon easier / Fri–Sun harder). */
export function weekdayNudge(band: number): -1 | 0 | 1 {
  if (band <= 0) return -1;
  if (band <= 3) return 0;
  return 1;
}

/**
 * Personal mastery tier primary; weekday ≤ ±1; long gap (R < 0.5) softens
 * effective personal by one before nudge (does not rewrite stored tier).
 */
export function resolveTargetTier(
  input: ResolveTargetTierInput,
): DifficultyTier {
  const row = input.mastery.byType[input.gameType];
  let personal = tierIndex(row.tier);

  if (row.lastPracticedAtMs != null && input.nowMs != null) {
    const tDays = daysSincePractice(row.lastPracticedAtMs, input.nowMs);
    const R = retrievability(tDays, row.stabilityDays);
    if (R < RETRIEVABILITY_SOFTEN_THRESHOLD) {
      personal = Math.max(0, personal - 1);
    }
  }

  const nudge = weekdayNudge(weekdayBand(input.dateKey));
  return tierFromIndex(personal + nudge);
}
