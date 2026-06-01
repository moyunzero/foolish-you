import { FALLBACK_DATE_KEYS, getFallbackDailySelection } from '../../../lib/puzzles/fallbackPuzzles';
import { isPerimeterLoop } from '../../../lib/puzzles/slitherlink/generator';
import { getSlitherlinkBuiltinPuzzle } from '../../../lib/puzzles/slitherlink/builtinPuzzle';
import { isPuzzleSolvable } from '../../../lib/puzzles/isSolvable';
import { isSlitherlinkPuzzle } from '../../../lib/puzzles/types';

describe('fallbackPuzzles', () => {
  it('each game type fallback is solvable', () => {
    for (const gameType of [
      'sudoku',
      'binary',
      'nonogram',
      'slitherlink',
    ] as const) {
      const selected = getFallbackDailySelection(gameType);
      expect(selected.gameType).toBe(gameType);
      expect(isPuzzleSolvable(gameType, selected.puzzle)).toBe(true);
      expect(FALLBACK_DATE_KEYS[gameType]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('slitherlink fallback hash is stable', () => {
    const first = getFallbackDailySelection('slitherlink');
    const second = getFallbackDailySelection('slitherlink');
    expect(second.puzzleHash).toBe(first.puzzleHash);
    expect(second.seed).toBe(first.seed);
  });

  it('slitherlink builtin is not a perimeter-only loop', () => {
    const builtin = getSlitherlinkBuiltinPuzzle();
    expect(builtin.puzzleHash).toBe('sl-f43e34c7');
    expect(isSlitherlinkPuzzle(builtin)).toBe(true);
    expect(builtin.solution).not.toBeNull();
    expect(isPerimeterLoop(builtin.solution!)).toBe(false);
  });
});
