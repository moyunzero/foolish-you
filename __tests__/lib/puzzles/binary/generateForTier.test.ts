import {
  BINARY_TIER_MAX_ATTEMPTS,
  BINARY_TIER_MAX_SOFTENS,
  generateBinaryPuzzleForTier,
  givenGuideForTier,
  softenTowardEasier,
} from '../../../../lib/puzzles/binary/generateForTier';
import { tierIndex } from '../../../../lib/puzzles/difficulty/tiers';
import { countSolutionsUpTo } from '../../../../lib/puzzles/binary/solver';
import { rateBinary } from '../../../../lib/puzzles/binary/rater';

describe('givenGuideForTier', () => {
  it('maps easy/medium/hard/expert to carve guides (Easy denser than RESEARCH 30)', () => {
    expect(givenGuideForTier('easy')).toBe(56);
    expect(givenGuideForTier('medium')).toBe(26);
    expect(givenGuideForTier('hard')).toBe(22);
    expect(givenGuideForTier('expert')).toBe(18);
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

describe('generateBinaryPuzzleForTier', () => {
  it('exports bounded attempt/soften constants', () => {
    expect(BINARY_TIER_MAX_ATTEMPTS).toBe(40);
    expect(BINARY_TIER_MAX_SOFTENS).toBe(3);
  });

  it('is deterministic for the same seed + targetTier', () => {
    const seed = 42_100;
    const first = generateBinaryPuzzleForTier(seed, 'easy');
    const second = generateBinaryPuzzleForTier(seed, 'easy');
    expect(second.puzzle.puzzleHash).toBe(first.puzzle.puzzleHash);
    expect(second.puzzle.givens).toEqual(first.puzzle.givens);
    expect(second.ratedTier).toBe(first.ratedTier);
    expect(second.peakTechnique).toBe(first.peakTechnique);
    expect(second.softened).toBe(first.softened);
  });

  it('returns a unique-solution puzzle', () => {
    const result = generateBinaryPuzzleForTier(42_101, 'easy');
    expect(countSolutionsUpTo(result.puzzle.givens, 2)).toBe(1);
  });

  it('when softened===false, ratedTier equals requested targetTier', () => {
    const result = generateBinaryPuzzleForTier(42_102, 'easy');
    if (!result.softened) {
      expect(result.ratedTier).toBe('easy');
    }
    expect(tierIndex(result.ratedTier)).toBeLessThanOrEqual(tierIndex('easy'));
  });

  it('never produces ratedTier harder than the original request', () => {
    for (const target of ['easy', 'medium'] as const) {
      const result = generateBinaryPuzzleForTier(
        50_000 + tierIndex(target),
        target,
      );
      expect(tierIndex(result.ratedTier)).toBeLessThanOrEqual(
        tierIndex(target),
      );
      if (result.softened) {
        expect(tierIndex(result.ratedTier)).toBeLessThan(tierIndex(target));
      } else {
        expect(result.ratedTier).toBe(target);
      }
    }
  });

  it('completes an Easy target with unique solution', () => {
    const result = generateBinaryPuzzleForTier(42_200, 'easy');
    expect(countSolutionsUpTo(result.puzzle.givens, 2)).toBe(1);
    expect(tierIndex(result.ratedTier)).toBeLessThanOrEqual(tierIndex('easy'));
  });

  it('completes a non-Easy (medium) target', () => {
    const result = generateBinaryPuzzleForTier(42_300, 'medium');
    expect(countSolutionsUpTo(result.puzzle.givens, 2)).toBe(1);
    expect(tierIndex(result.ratedTier)).toBeLessThanOrEqual(
      tierIndex('medium'),
    );
    if (!result.softened) {
      expect(result.ratedTier).toBe('medium');
    }
  });

  it('does not accept incomplete or budget_exhausted rates', () => {
    const result = generateBinaryPuzzleForTier(42_400, 'easy');
    const rated = rateBinary(result.puzzle.givens);
    expect(rated.status).toBe('solved');
    if (rated.status === 'solved') {
      expect(rated.tier).toBe(result.ratedTier);
    }
  });

  it('completes Expert target within budget without hang', () => {
    const result = generateBinaryPuzzleForTier(800_001, 'expert');
    expect(countSolutionsUpTo(result.puzzle.givens, 2)).toBe(1);
    expect(tierIndex(result.ratedTier)).toBeLessThanOrEqual(
      tierIndex('expert'),
    );
    const rated = rateBinary(result.puzzle.givens);
    expect(rated.status).toBe('solved');
    if (!result.softened) {
      expect(result.ratedTier).toBe('expert');
    }
  });

  it('sets softened=true and easier ratedTier when soft path taken', () => {
    // Prefer a seed that exhausts exact Hard and softens (parity with Sudoku pitfall 5).
    // If this seed happens to hit exact Hard, still assert never-harder + unique.
    const result = generateBinaryPuzzleForTier(1, 'hard');
    expect(countSolutionsUpTo(result.puzzle.givens, 2)).toBe(1);
    expect(tierIndex(result.ratedTier)).toBeLessThanOrEqual(tierIndex('hard'));
    if (result.softened) {
      expect(tierIndex(result.ratedTier)).toBeLessThan(tierIndex('hard'));
    } else {
      expect(result.ratedTier).toBe('hard');
    }
    const rated = rateBinary(result.puzzle.givens);
    expect(rated.status).toBe('solved');
    if (rated.status === 'solved') {
      expect(rated.tier).toBe(result.ratedTier);
    }
  });
});
