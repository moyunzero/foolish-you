import type { DifficultyTier } from '../../../../../lib/puzzles/difficulty/tiers';
import type { SudokuTechnique } from '../../../../../lib/puzzles/sudoku/techniqueIds';

export type TechniqueBoardFixture = {
  id: string;
  givens: number[][];
  expectedTier: DifficultyTier;
  expectedPeak: SudokuTechnique;
};

/** Full valid solution used to derive easy near-complete boards. */
const SOLUTION = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

function cloneSolution(): number[][] {
  return SOLUTION.map((row) => [...row]);
}

/** Easy: single empty cell → full_house (singles band). */
function makeEasyFullHouse(): number[][] {
  const g = cloneSolution();
  g[8][8] = 0;
  return g;
}

/** Medium: generator seed 700022 — peak claiming (frozen). */
const MEDIUM_GIVENS = [
  [4, 0, 0, 0, 0, 3, 6, 0, 0],
  [0, 2, 0, 0, 1, 0, 0, 0, 8],
  [6, 9, 0, 0, 7, 0, 2, 0, 0],
  [0, 6, 7, 0, 0, 2, 0, 1, 0],
  [0, 0, 2, 1, 8, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 2],
  [8, 0, 0, 7, 0, 0, 0, 2, 3],
  [0, 3, 0, 0, 4, 0, 0, 0, 0],
  [2, 0, 9, 0, 3, 6, 0, 4, 7],
];

/** Hard: generator seed 700433 — peak x_wing (frozen). */
const HARD_GIVENS = [
  [6, 0, 0, 0, 1, 0, 4, 9, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 3],
  [0, 0, 9, 2, 0, 4, 5, 1, 0],
  [9, 0, 6, 0, 2, 8, 0, 5, 0],
  [0, 0, 7, 0, 0, 6, 0, 0, 0],
  [0, 3, 8, 5, 0, 0, 0, 0, 6],
  [0, 0, 0, 0, 3, 9, 7, 2, 0],
  [0, 0, 0, 6, 0, 0, 0, 0, 0],
  [8, 0, 0, 0, 0, 7, 0, 0, 0],
];

/** Expert: generator seed 700012 — peak xy_wing (frozen). */
const EXPERT_GIVENS = [
  [0, 2, 0, 0, 0, 0, 0, 0, 5],
  [0, 8, 0, 3, 1, 0, 0, 4, 2],
  [0, 0, 0, 0, 7, 0, 0, 3, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 8],
  [8, 7, 0, 0, 0, 0, 5, 1, 4],
  [0, 1, 4, 0, 0, 7, 0, 0, 9],
  [7, 0, 0, 6, 0, 0, 9, 8, 3],
  [4, 0, 2, 1, 8, 3, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1],
];

export const EASY_FIXTURE: TechniqueBoardFixture = {
  id: 'easy-full-house',
  givens: makeEasyFullHouse(),
  expectedTier: 'easy',
  expectedPeak: 'full_house',
};

export const MEDIUM_FIXTURE: TechniqueBoardFixture = {
  id: 'medium-claiming-700022',
  givens: MEDIUM_GIVENS,
  expectedTier: 'medium',
  expectedPeak: 'claiming',
};

export const HARD_FIXTURE: TechniqueBoardFixture = {
  id: 'hard-x-wing-700433',
  givens: HARD_GIVENS,
  expectedTier: 'hard',
  expectedPeak: 'x_wing',
};

export const EXPERT_FIXTURE: TechniqueBoardFixture = {
  id: 'expert-xy-wing-700012',
  givens: EXPERT_GIVENS,
  expectedTier: 'expert',
  expectedPeak: 'xy_wing',
};

export const TIER_FIXTURES: TechniqueBoardFixture[] = [
  EASY_FIXTURE,
  MEDIUM_FIXTURE,
  HARD_FIXTURE,
  EXPERT_FIXTURE,
];

export const ALL_FIXTURES: TechniqueBoardFixture[] = [...TIER_FIXTURES];
