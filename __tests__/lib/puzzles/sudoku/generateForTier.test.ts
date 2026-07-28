import {
  givenGuideForTier,
  generateSudokuPuzzleForTier,
  softenTowardEasier,
  SUDOKU_TIER_MAX_ATTEMPTS,
  SUDOKU_TIER_MAX_SOFTENS,
} from '../../../../lib/puzzles/sudoku/generateForTier';
import { tierIndex } from '../../../../lib/puzzles/difficulty/tiers';
import { countSolutionsUpTo } from '../../../../lib/puzzles/sudoku/solver';
import { rateSudoku } from '../../../../lib/puzzles/sudoku/rater';

describe('givenGuideForTier', () => {
  it('maps easy/medium/hard/expert to 36/33/29/25', () => {
    expect(givenGuideForTier('easy')).toBe(36);
    expect(givenGuideForTier('medium')).toBe(33);
    expect(givenGuideForTier('hard')).toBe(29);
    expect(givenGuideForTier('expert')).toBe(25);
  });
});

describe('softenTowardEasier', () => {
  it('steps toward easier and stops at easy', () => {
    expect(softenTowardEasier('expert')).toBe('hard');
    expect(softenTowardEasier('hard')).toBe('medium');
    expect(softenTowardEasier('medium')).toBe('easy');
    expect(softenTowardEasier('easy')).toBe('easy');
  });
});

describe('generateSudokuPuzzleForTier', () => {
  it('is deterministic for the same seed + targetTier', () => {
    const seed = 42_100;
    const first = generateSudokuPuzzleForTier(seed, 'easy');
    const second = generateSudokuPuzzleForTier(seed, 'easy');
    expect(second.puzzle.puzzleHash).toBe(first.puzzle.puzzleHash);
    expect(second.puzzle.givens).toEqual(first.puzzle.givens);
    expect(second.ratedTier).toBe(first.ratedTier);
    expect(second.peakTechnique).toBe(first.peakTechnique);
    expect(second.softened).toBe(first.softened);
  });

  it('returns a unique-solution puzzle', () => {
    const result = generateSudokuPuzzleForTier(42_101, 'easy');
    expect(countSolutionsUpTo(result.puzzle.givens, 2)).toBe(1);
  });

  it('when softened===false, ratedTier equals requested targetTier', () => {
    const result = generateSudokuPuzzleForTier(42_102, 'easy');
    if (!result.softened) {
      expect(result.ratedTier).toBe('easy');
    }
    expect(tierIndex(result.ratedTier)).toBeLessThanOrEqual(tierIndex('easy'));
  });

  it('never produces ratedTier harder than the original request', () => {
    for (const target of ['easy', 'medium'] as const) {
      const result = generateSudokuPuzzleForTier(50_000 + tierIndex(target), target);
      expect(tierIndex(result.ratedTier)).toBeLessThanOrEqual(tierIndex(target));
      if (result.softened) {
        expect(tierIndex(result.ratedTier)).toBeLessThan(tierIndex(target));
      } else {
        expect(result.ratedTier).toBe(target);
      }
    }
  });

  it('completes an Easy target with unique solution', () => {
    const result = generateSudokuPuzzleForTier(42_200, 'easy');
    expect(countSolutionsUpTo(result.puzzle.givens, 2)).toBe(1);
    expect(tierIndex(result.ratedTier)).toBeLessThanOrEqual(tierIndex('easy'));
  });

  it('completes a non-Easy (medium) target', () => {
    const result = generateSudokuPuzzleForTier(42_300, 'medium');
    expect(countSolutionsUpTo(result.puzzle.givens, 2)).toBe(1);
    expect(tierIndex(result.ratedTier)).toBeLessThanOrEqual(tierIndex('medium'));
    if (!result.softened) {
      expect(result.ratedTier).toBe('medium');
    }
  });

  it('exports bounded attempt/soften constants', () => {
    expect(SUDOKU_TIER_MAX_ATTEMPTS).toBe(40);
    expect(SUDOKU_TIER_MAX_SOFTENS).toBe(3);
  });

  it('does not accept incomplete or budget_exhausted rates', () => {
    // Public accept path: only solved + exact tier. Probe via a successful Easy
    // result and re-rate — status must be solved (discard path never returns).
    const result = generateSudokuPuzzleForTier(42_400, 'easy');
    const rated = rateSudoku(result.puzzle.givens);
    expect(rated.status).toBe('solved');
    if (rated.status === 'solved') {
      expect(rated.tier).toBe(result.ratedTier);
    }
  });
});
