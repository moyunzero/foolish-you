import { computeClues } from './clues';
import { computePuzzleHash } from './hash';
import { weekdayBand } from '../difficulty/weekdayBand';
import {
  NONOGRAM_PATTERNS,
  patternSolution,
  patternsForTier,
  type NonogramPattern,
} from './patterns';
import { applyTransform, type TransformFlags } from './transform';
import { deriveSubSeed, hashStringToSeed, mulberry32 } from '../rng';
import type { NonogramPuzzle } from '../types';
import { NONOGRAM_COLS, NONOGRAM_ROWS } from './spec';

function pickTransform(seed: number): TransformFlags {
  const rng = mulberry32(deriveSubSeed(seed, 'nono-xform'));
  return {
    mirrorX: rng() < 0.5,
    mirrorY: rng() < 0.5,
  };
}

function selectPatternIndex(seed: number): number {
  const rng = mulberry32(deriveSubSeed(seed, 'nono-pattern'));
  return Math.floor(rng() * NONOGRAM_PATTERNS.length);
}

function selectPattern(seed: number, dateKey?: string): NonogramPattern {
  if (dateKey == null) {
    return NONOGRAM_PATTERNS[selectPatternIndex(seed)]!;
  }
  const bucket = patternsForTier(weekdayBand(dateKey));
  const idx = hashStringToSeed(`${seed}:nono-pattern`) % bucket.length;
  return bucket[idx]!;
}

export function generateNonogramPuzzle(seed: number, dateKey?: string): NonogramPuzzle {
  const pattern = selectPattern(seed, dateKey);
  const transform = pickTransform(seed);
  const solution = applyTransform(patternSolution(pattern), transform);
  const { rowClues, colClues } = computeClues(solution);
  const puzzleHash = computePuzzleHash({
    patternId: pattern.id,
    mirrorX: transform.mirrorX,
    mirrorY: transform.mirrorY,
    rowClues,
    colClues,
  });

  return {
    kind: 'nonogram',
    rows: NONOGRAM_ROWS,
    cols: NONOGRAM_COLS,
    rowClues,
    colClues,
    solution,
    pictureTitle: pattern.id,
    puzzleHash,
  };
}
