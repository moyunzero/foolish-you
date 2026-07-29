import { MASTERY_BASELINES_MS } from './baselines';
import {
  daysSincePractice,
  nextStability,
  retrievability,
} from './fsrsLite';
import { tierFromIndex, tierIndex } from '../puzzles/difficulty/tiers';
import type {
  ApplyMasteryOutcomeInput,
  GameTypeMastery,
  MasteryGrade,
  MasteryState,
} from './types';

const CONSECUTIVE_N = 2;

function gradeOutcome(
  outcome: ApplyMasteryOutcomeInput['outcome'],
  elapsedMs: number,
  baselineMs: number,
): MasteryGrade {
  if (outcome === 'abandoned') return 'again';
  if (elapsedMs <= baselineMs * 0.7) return 'easy';
  if (elapsedMs <= baselineMs * 1.3) return 'good';
  return 'hard';
}

function isUpGrade(grade: MasteryGrade): boolean {
  return grade === 'easy' || grade === 'good';
}

function applyAntiThrash(
  row: GameTypeMastery,
  grade: MasteryGrade,
): Pick<GameTypeMastery, 'tier' | 'consecutiveUp' | 'consecutiveDown'> {
  let { tier, consecutiveUp, consecutiveDown } = row;

  if (isUpGrade(grade)) {
    consecutiveUp += 1;
    consecutiveDown = 0;
    if (consecutiveUp >= CONSECUTIVE_N) {
      tier = tierFromIndex(tierIndex(tier) + 1);
      consecutiveUp = 0;
    }
  } else {
    consecutiveDown += 1;
    consecutiveUp = 0;
    if (consecutiveDown >= CONSECUTIVE_N) {
      tier = tierFromIndex(tierIndex(tier) - 1);
      consecutiveDown = 0;
    }
  }

  return { tier, consecutiveUp, consecutiveDown };
}

/**
 * Pure mastery update from a complete/abandon outcome.
 * Inject nowMs / elapsedMs — no wall clock, no storage I/O.
 */
export function applyMasteryOutcome(
  state: MasteryState,
  input: ApplyMasteryOutcomeInput,
): MasteryState {
  const prev = state.byType[input.gameType];
  const baseline = MASTERY_BASELINES_MS[input.gameType][prev.tier];
  const grade = gradeOutcome(input.outcome, input.elapsedMs, baseline);
  const tDays = daysSincePractice(prev.lastPracticedAtMs, input.nowMs);
  const R = retrievability(tDays, prev.stabilityDays);
  const stabilityDays = nextStability(prev.stabilityDays, R, grade);
  const thrash = applyAntiThrash(prev, grade);

  const nextRow: GameTypeMastery = {
    stabilityDays,
    tier: thrash.tier,
    lastPracticedAtMs: input.nowMs,
    lastOutcome: input.outcome,
    consecutiveUp: thrash.consecutiveUp,
    consecutiveDown: thrash.consecutiveDown,
  };

  return {
    byType: {
      ...state.byType,
      [input.gameType]: nextRow,
    },
  };
}
