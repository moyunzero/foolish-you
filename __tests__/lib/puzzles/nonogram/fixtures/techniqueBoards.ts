import type { DifficultyTier } from '../../../../../lib/puzzles/difficulty/tiers';
import type { NonogramTechnique } from '../../../../../lib/puzzles/nonogram/techniqueIds';

export type TechniqueBoardFixture = {
  id: string;
  rowClues: number[][];
  colClues: number[][];
  expectedTier: DifficultyTier;
  expectedPeak: NonogramTechnique;
};

/**
 * Easy (simple_few): FullSettle solves in ≤3 H/V sweeps.
 * Derived from curated `accordion` pattern — frozen; never regenerate in CI.
 */
export const EASY_FIXTURE: TechniqueBoardFixture = {
  id: 'easy-simple-few-accordion',
  rowClues: [
    [8],
    [1, 1, 1, 2],
    [8],
    [1, 1, 1, 2],
    [8],
    [1, 1, 1, 2],
    [8],
    [0],
  ],
  colClues: [
    [7],
    [1, 1, 1, 1],
    [7],
    [1, 1, 1, 1],
    [7],
    [1, 1, 1, 1],
    [7],
    [7],
  ],
  expectedTier: 'easy',
  expectedPeak: 'simple_few',
};

/**
 * Medium (simple_many): FullSettle solves with ≥4 sweeps, still Simple (no probe).
 * Derived from curated `star` pattern — frozen; never regenerate in CI.
 */
export const MEDIUM_FIXTURE: TechniqueBoardFixture = {
  id: 'medium-simple-many-star',
  rowClues: [[1], [3], [5], [3], [1], [0], [0], [0]],
  colClues: [[1], [3], [5], [3], [1], [0], [0], [0]],
  expectedTier: 'medium',
  expectedPeak: 'simple_many',
};

/**
 * Hard (probe): FullSettle stalls; exactly one productive depth-1 probe solves.
 * Derived from curated `moon` pattern — frozen; never regenerate in CI.
 */
export const HARD_FIXTURE: TechniqueBoardFixture = {
  id: 'hard-probe-moon',
  rowClues: [[4], [4], [4], [3], [4], [4], [4], [0]],
  colClues: [[0], [3], [5], [7], [3, 3], [2, 2], [1, 1], [0]],
  expectedTier: 'hard',
  expectedPeak: 'probe',
};

/**
 * Expert (nested_probe): ≥2 productive probes (or depth≥2).
 * Derived from curated `bicycle` pattern — frozen; never regenerate in CI.
 */
export const EXPERT_FIXTURE: TechniqueBoardFixture = {
  id: 'expert-nested-probe-bicycle',
  rowClues: [
    [0],
    [1, 1],
    [1, 1, 1, 1],
    [1, 2, 1],
    [4],
    [1, 1],
    [1, 1, 1, 1],
    [0],
  ],
  colClues: [
    [1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [2],
    [2],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1],
  ],
  expectedTier: 'expert',
  expectedPeak: 'nested_probe',
};

export const TIER_FIXTURES: TechniqueBoardFixture[] = [
  EASY_FIXTURE,
  MEDIUM_FIXTURE,
  HARD_FIXTURE,
  EXPERT_FIXTURE,
];

export const ALL_FIXTURES: TechniqueBoardFixture[] = [...TIER_FIXTURES];
