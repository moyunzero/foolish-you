import type { GameTypeMastery, MasteryState } from './types';

export function defaultGameTypeMastery(): GameTypeMastery {
  return {
    stabilityDays: 2,
    tier: 'easy',
    lastPracticedAtMs: null,
    lastOutcome: null,
    consecutiveUp: 0,
    consecutiveDown: 0,
  };
}

export const DEFAULT_MASTERY_STATE: MasteryState = {
  byType: {
    sudoku: defaultGameTypeMastery(),
    binary: defaultGameTypeMastery(),
    nonogram: defaultGameTypeMastery(),
    slitherlink: defaultGameTypeMastery(),
  },
};
