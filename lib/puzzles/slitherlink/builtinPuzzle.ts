import type { SlitherlinkPuzzle } from './spec';
import { cloneSolutionEdges } from './edges';

/**
 * Pre-verified 7×7 slitherlink (perimeter loop, unique solution, 18 clues).
 * Used for offline fallback and hook stubs so we never block the UI on carve/solver.
 */
const SLITHERLINK_BUILTIN_PUZZLE: SlitherlinkPuzzle = {
  kind: 'slitherlink',
  size: 7,
  clues: [
    [2, 1, 1, 1, null, 1, null],
    [null, null, null, null, null, 0, 1],
    [1, 0, null, 0, null, null, null],
    [null, null, null, null, null, 0, 1],
    [1, null, null, null, null, null, 1],
    [1, null, null, null, null, null, 1],
    [null, null, null, null, 1, null, 2],
  ],
  puzzleHash: 'sl-172b96f3',
  solution: {
    h: [
      [1, 1, 1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2],
      [1, 1, 1, 1, 1, 1, 1],
    ],
    v: [
      [1, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 1],
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
