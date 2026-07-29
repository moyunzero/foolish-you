import type { DifficultyTier } from '../../../../../lib/puzzles/difficulty/tiers';
import type { SlitherlinkTechnique } from '../../../../../lib/puzzles/slitherlink/techniqueIds';

export type TechniqueBoardFixture = {
  id: string;
  clues: (number | null)[][];
  expectedTier: DifficultyTier;
  expectedPeak: SlitherlinkTechnique;
};

/**
 * Easy: center 2×2 polyomino, full clues — peak edge_count.
 * Frozen — do not regenerate in CI.
 */
const EASY_CLUES: (number | null)[][] = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 0],
  [0, 1, 2, 2, 1, 0, 0],
  [0, 1, 2, 2, 1, 0, 0],
  [0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
];

/** Medium: corner 2×2 at bottom-right — peak vertex_degree. */
const MEDIUM_CLUES: (number | null)[][] = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1],
  [0, 0, 0, 0, 1, 2, 2],
  [0, 0, 0, 0, 1, 2, 2],
];

/** Hard: top-edge strip with corner 3s — peak local_loop (never bifurcation). */
const HARD_CLUES: (number | null)[][] = [
  [3, null, null, 3, null, 0, 0],
  [null, null, null, null, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
];

/** Expert: sparse corner square — peak bifurcation. */
const EXPERT_CLUES: (number | null)[][] = [
  [2, 2, null, 0, 0, 0, 0],
  [2, 2, null, 0, 0, 0, 0],
  [null, null, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
];

export const EASY_FIXTURE: TechniqueBoardFixture = {
  id: 'easy-edge-count',
  clues: EASY_CLUES,
  expectedTier: 'easy',
  expectedPeak: 'edge_count',
};

export const MEDIUM_FIXTURE: TechniqueBoardFixture = {
  id: 'medium-vertex-degree',
  clues: MEDIUM_CLUES,
  expectedTier: 'medium',
  expectedPeak: 'vertex_degree',
};

export const HARD_FIXTURE: TechniqueBoardFixture = {
  id: 'hard-local-loop',
  clues: HARD_CLUES,
  expectedTier: 'hard',
  expectedPeak: 'local_loop',
};

export const EXPERT_FIXTURE: TechniqueBoardFixture = {
  id: 'expert-bifurcation',
  clues: EXPERT_CLUES,
  expectedTier: 'expert',
  expectedPeak: 'bifurcation',
};

export const TIER_FIXTURES: TechniqueBoardFixture[] = [
  EASY_FIXTURE,
  MEDIUM_FIXTURE,
  HARD_FIXTURE,
  EXPERT_FIXTURE,
];

export const ALL_FIXTURES: TechniqueBoardFixture[] = [...TIER_FIXTURES];
