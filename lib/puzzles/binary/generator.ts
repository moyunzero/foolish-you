import {
  BINARY_GIVEN_COUNT,
  BINARY_MAX_GEN_ATTEMPTS,
} from '../../../constants/config';
import { binaryGivensForDate } from '../difficulty/weekdayBand';
import { deriveSubSeed, mulberry32 } from '../rng';
import type { BinaryPuzzle } from '../types';
import {
  BINARY_EMPTY,
  cloneGrid,
  countGivens,
  indexToCoord,
  shuffleIndices,
} from './grid';
import { BINARY_SIZE } from './spec';
import { computePuzzleHash } from './hash';
import { countSolutionsUpTo, fillCompleteGrid, solve } from './solver';

function carvePuzzle(
  complete: number[][],
  rng: () => number,
  targetGivens: number,
): number[][] | null {
  const givens = cloneGrid(complete);
  const positions = shuffleIndices(BINARY_SIZE * BINARY_SIZE, rng);

  for (const index of positions) {
    if (countGivens(givens) === targetGivens) break;

    const { row, col } = indexToCoord(index);
    const backup = givens[row][col];
    givens[row][col] = BINARY_EMPTY;

    if (countSolutionsUpTo(givens, 2) !== 1) {
      givens[row][col] = backup;
    }
  }

  if (countGivens(givens) !== targetGivens) return null;
  if (countSolutionsUpTo(givens, 2) !== 1) return null;
  if (!solve(givens)) return null;

  return givens;
}

function generateOnce(seed: number, targetGivens: number): BinaryPuzzle | null {
  const rng = mulberry32(seed);
  const complete = fillCompleteGrid(rng);
  if (complete == null) return null;

  const givens = carvePuzzle(complete, rng, targetGivens);
  if (givens == null) return null;

  return {
    kind: 'binary',
    givens,
    puzzleHash: computePuzzleHash(givens),
  };
}

export function generateBinaryPuzzle(seed: number, dateKey?: string): BinaryPuzzle {
  const targetGivens =
    dateKey != null ? binaryGivensForDate(dateKey) : BINARY_GIVEN_COUNT;
  for (let attempt = 0; attempt < BINARY_MAX_GEN_ATTEMPTS; attempt += 1) {
    const attemptSeed = deriveSubSeed(seed, `bin-gen-${attempt}`);
    const puzzle = generateOnce(attemptSeed, targetGivens);
    if (puzzle != null) return puzzle;
  }

  const fallback = generateOnce(deriveSubSeed(seed, 'bin-gen-fallback'), targetGivens);
  if (fallback != null) return fallback;

  throw new Error('Failed to generate binary puzzle');
}
