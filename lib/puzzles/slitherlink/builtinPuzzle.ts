import type { SlitherlinkPuzzle } from './spec';
import { cloneSolutionEdges } from './edges';

/**
 * Pre-verified 7×7 slitherlink (polyomino-style interior loop, unique solution).
 * Used for offline fallback and hook stubs when generation exhausts attempts —
 * not the normal deriveSeed(dateKey) daily path.
 */
const SLITHERLINK_BUILTIN_PUZZLE: SlitherlinkPuzzle = {
  kind: 'slitherlink',
  size: 7,
  clues: [
    [null, 0, null, null, null, null, null],
    [null, null, null, 1, 1, 2, 1],
    [1, 2, 0, 0, null, null, null],
    [1, null, null, null, 0, 1, null],
    [1, null, null, null, 0, 1, 1],
    [null, 2, null, null, 1, 2, null],
    [null, 1, 1, null, null, null, null],
  ],
  puzzleHash: 'sl-f43e34c7',
  solution: {
    h: [
      [2, 2, 2, 2, 2, 2, 2],
      [2, 2, 1, 1, 1, 1, 2],
      [2, 1, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2],
      [2, 1, 1, 1, 1, 1, 2],
      [2, 2, 2, 2, 2, 2, 2],
    ],
    v: [
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 1, 2, 2, 2, 1, 2],
      [2, 1, 2, 2, 2, 2, 1, 2],
      [2, 1, 2, 2, 2, 2, 1, 2],
      [2, 1, 2, 2, 2, 2, 1, 2],
      [2, 1, 2, 2, 2, 2, 1, 2],
      [2, 2, 2, 2, 2, 2, 2, 2],
    ],
  },
};

export function getSlitherlinkBuiltinPuzzle(): SlitherlinkPuzzle {
  return {
    ...SLITHERLINK_BUILTIN_PUZZLE,
    clues: SLITHERLINK_BUILTIN_PUZZLE.clues.map((row) => [...row]),
    solution: cloneSolutionEdges(SLITHERLINK_BUILTIN_PUZZLE.solution),
  };
}
