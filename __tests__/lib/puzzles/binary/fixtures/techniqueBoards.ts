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

/** Expert: carve seed 1 guide 22 (subseed 1*97+22) — peak look_ahead. */
const EXPERT_GIVENS = [
  [0, 0, 2, 2, 0, 0, 0, 0],
  [0, 2, 0, 0, 0, 0, 2, 0],
  [0, 1, 2, 2, 0, 0, 1, 0],
  [2, 0, 1, 0, 0, 2, 0, 0],
  [2, 0, 0, 1, 0, 0, 2, 0],
  [1, 0, 0, 0, 0, 0, 2, 0],
  [0, 0, 1, 2, 0, 0, 1, 0],
  [0, 2, 0, 1, 0, 0, 0, 2],
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

/** Expert: frozen look_ahead board (seed 1 guide 22). */
export const EXPERT_FIXTURE: TechniqueBoardFixture = {
  id: 'expert-look-ahead',
  givens: EXPERT_GIVENS,
  expectedTier: 'expert',
  expectedPeak: 'look_ahead',
};

export const TIER_FIXTURES: TechniqueBoardFixture[] = [
  EASY_FIXTURE,
  MEDIUM_FIXTURE,
  HARD_FIXTURE,
  EXPERT_FIXTURE,
];

export const ALL_FIXTURES: TechniqueBoardFixture[] = [...TIER_FIXTURES];
