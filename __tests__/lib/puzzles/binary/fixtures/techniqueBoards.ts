import type { DifficultyTier } from '../../../../../lib/puzzles/difficulty/tiers';
import type { BinaryTechnique } from '../../../../../lib/puzzles/binary/techniqueIds';

export type TechniqueBoardFixture = {
  id: string;
  givens: number[][];
  expectedTier: DifficultyTier;
  expectedPeak: BinaryTechnique;
};

/**
 * Easy: dense carve from seed-1 complete grid — peak gap_fill (pair then gap).
 * Frozen — never regenerate in CI.
 */
const EASY_GIVENS = [
  [2, 1, 2, 2, 0, 1, 2, 1],
  [1, 2, 0, 1, 2, 1, 2, 2],
  [0, 1, 2, 2, 1, 2, 1, 2],
  [2, 2, 1, 1, 2, 0, 1, 1],
  [2, 1, 2, 1, 2, 1, 2, 1],
  [1, 1, 2, 2, 1, 1, 2, 2],
  [2, 2, 1, 2, 1, 2, 1, 1],
  [1, 2, 1, 1, 2, 2, 1, 2],
];

/** Medium: carve seed 1 + guide 30 (subseed 1+30*9973) — peak balance. */
const MEDIUM_GIVENS = [
  [2, 0, 2, 2, 1, 1, 2, 0],
  [0, 0, 0, 0, 0, 1, 0, 0],
  [1, 0, 2, 2, 1, 0, 0, 2],
  [2, 0, 0, 0, 2, 0, 0, 1],
  [0, 0, 2, 1, 2, 1, 0, 1],
  [0, 0, 0, 0, 0, 0, 2, 0],
  [2, 2, 1, 0, 1, 2, 0, 1],
  [0, 2, 0, 0, 0, 0, 1, 2],
];

/** Hard: carve seed 1 guide 30 (subseed 1*31+30) — peak uniqueness. */
const HARD_GIVENS = [
  [2, 0, 2, 0, 0, 1, 0, 0],
  [1, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 2, 1, 0],
  [2, 0, 1, 0, 2, 2, 0, 0],
  [2, 1, 0, 1, 2, 0, 2, 0],
  [1, 1, 2, 0, 1, 0, 2, 2],
  [0, 2, 1, 2, 0, 0, 1, 0],
  [1, 2, 0, 0, 0, 0, 1, 0],
];

/**
 * Expert stub — replaced in Task 2 with a frozen look_ahead board.
 * Placeholder keeps the export shape; rater tests for Expert land in Task 2.
 */
const EXPERT_GIVENS_STUB = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

export const EASY_FIXTURE: TechniqueBoardFixture = {
  id: 'easy-gap-fill',
  givens: EASY_GIVENS,
  expectedTier: 'easy',
  expectedPeak: 'gap_fill',
};

export const MEDIUM_FIXTURE: TechniqueBoardFixture = {
  id: 'medium-balance',
  givens: MEDIUM_GIVENS,
  expectedTier: 'medium',
  expectedPeak: 'balance',
};

export const HARD_FIXTURE: TechniqueBoardFixture = {
  id: 'hard-uniqueness',
  givens: HARD_GIVENS,
  expectedTier: 'hard',
  expectedPeak: 'uniqueness',
};

/** Stub until Task 2 freezes a look_ahead board. */
export const EXPERT_FIXTURE: TechniqueBoardFixture = {
  id: 'expert-look-ahead-stub',
  givens: EXPERT_GIVENS_STUB,
  expectedTier: 'expert',
  expectedPeak: 'look_ahead',
};

/** Task 1 scaffold: Easy/Medium/Hard only (Expert stub excluded from rate cases). */
export const TIER_FIXTURES: TechniqueBoardFixture[] = [
  EASY_FIXTURE,
  MEDIUM_FIXTURE,
  HARD_FIXTURE,
];

export const ALL_FIXTURES: TechniqueBoardFixture[] = [
  ...TIER_FIXTURES,
  EXPERT_FIXTURE,
];
