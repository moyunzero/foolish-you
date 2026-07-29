import type { DifficultyTier } from '../../../../../lib/puzzles/difficulty/tiers';
import type { SlitherlinkTechnique } from '../../../../../lib/puzzles/slitherlink/techniqueIds';

export type TechniqueBoardFixture = {
  id: string;
  clues: (number | null)[][];
  expectedTier: DifficultyTier;
  expectedPeak: SlitherlinkTechnique;
};

/**
 * Easy: dense 0-heavy board designed for zero_elim / corner_three peak.
 * Frozen after rate green — do not regenerate in CI.
 */
const EASY_CLUES: (number | null)[][] = [
  [3, 0, 0, 2, 0, 0, 3],
  [0, null, 1, null, 1, null, 0],
  [0, 1, null, 2, null, 1, 0],
  [2, null, 2, null, 2, null, 2],
  [0, 1, null, 2, null, 1, 0],
  [0, null, 1, null, 1, null, 0],
  [3, 0, 0, 2, 0, 0, 3],
];

/** Medium: adjacent patterns / edge_count peak (frozen provisional). */
const MEDIUM_CLUES: (number | null)[][] = [
  [null, 3, 3, null, 0, null, null],
  [null, null, null, 1, null, 2, null],
  [2, null, 0, null, 3, null, 1],
  [null, 2, null, 2, null, 1, null],
  [1, null, 3, null, 0, null, 2],
  [null, 2, null, 1, null, null, null],
  [null, null, 0, null, 3, 3, null],
];

/** Hard: vertex_degree or local_loop peak — never bifurcation. */
const HARD_CLUES: (number | null)[][] = [
  [null, null, 2, null, 1, null, null],
  [null, 3, null, 1, null, 2, null],
  [1, null, null, null, null, null, 2],
  [null, 2, null, 0, null, 1, null],
  [2, null, null, null, null, null, 1],
  [null, 1, null, 2, null, 3, null],
  [null, null, 1, null, 2, null, null],
];

/**
 * Expert stub — Task 2 freezes a bifurcation board.
 * Placeholder clues; expectedPeak bifurcation for metadata coverage.
 */
const EXPERT_CLUES: (number | null)[][] = [
  [null, null, null, 1, null, null, null],
  [null, 2, null, null, null, 1, null],
  [null, null, 0, null, 2, null, null],
  [1, null, null, null, null, null, 1],
  [null, null, 2, null, 0, null, null],
  [null, 1, null, null, null, 2, null],
  [null, null, null, 1, null, null, null],
];

export const EASY_FIXTURE: TechniqueBoardFixture = {
  id: 'easy-zero-corner',
  clues: EASY_CLUES,
  expectedTier: 'easy',
  expectedPeak: 'corner_three',
};

export const MEDIUM_FIXTURE: TechniqueBoardFixture = {
  id: 'medium-edge-count',
  clues: MEDIUM_CLUES,
  expectedTier: 'medium',
  expectedPeak: 'edge_count',
};

export const HARD_FIXTURE: TechniqueBoardFixture = {
  id: 'hard-vertex-degree',
  clues: HARD_CLUES,
  expectedTier: 'hard',
  expectedPeak: 'vertex_degree',
};

/** Expert: stub until Task 2 freezes bifurcation board. */
export const EXPERT_FIXTURE: TechniqueBoardFixture = {
  id: 'expert-bifurcation-stub',
  clues: EXPERT_CLUES,
  expectedTier: 'expert',
  expectedPeak: 'bifurcation',
};

export const TIER_FIXTURES: TechniqueBoardFixture[] = [
  EASY_FIXTURE,
  MEDIUM_FIXTURE,
  HARD_FIXTURE,
];

export const ALL_FIXTURES: TechniqueBoardFixture[] = [
  ...TIER_FIXTURES,
  EXPERT_FIXTURE,
];
