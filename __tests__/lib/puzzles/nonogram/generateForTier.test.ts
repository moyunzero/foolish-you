import {
  generateNonogramPuzzleForTier,
  NONOGRAM_TIER_MAX_SOFTENS,
  softenTowardEasier,
} from '../../../../lib/puzzles/nonogram/generateForTier';
import { tierIndex } from '../../../../lib/puzzles/difficulty/tiers';
import {
  NONOGRAM_PATTERNS,
  type NonogramPattern,
} from '../../../../lib/puzzles/nonogram/patterns';
import { isNonogramPuzzle } from '../../../../lib/puzzles/types';

describe('softenTowardEasier', () => {
  it('steps expert→hard→medium→easy and stops at easy', () => {
    expect(softenTowardEasier('expert')).toBe('hard');
    expect(softenTowardEasier('hard')).toBe('medium');
    expect(softenTowardEasier('medium')).toBe('easy');
    expect(softenTowardEasier('easy')).toBe('easy');
  });
});

describe('generateNonogramPuzzleForTier', () => {
  it('exports NONOGRAM_TIER_MAX_SOFTENS === 3', () => {
    expect(NONOGRAM_TIER_MAX_SOFTENS).toBe(3);
  });

  it('is deterministic for the same seed + targetTier', () => {
    const seed = 42_100;
    const first = generateNonogramPuzzleForTier(seed, 'easy');
    const second = generateNonogramPuzzleForTier(seed, 'easy');
    expect(second.puzzle.puzzleHash).toBe(first.puzzle.puzzleHash);
    expect(second.ratedTier).toBe(first.ratedTier);
    expect(second.peakTechnique).toBe(first.peakTechnique);
    expect(second.softened).toBe(first.softened);
  });

  it('returns a valid nonogram puzzle', () => {
    const result = generateNonogramPuzzleForTier(42_101, 'medium');
    expect(isNonogramPuzzle(result.puzzle)).toBe(true);
    expect(result.puzzle.rows).toBe(8);
    expect(result.peakTechnique).toBeTruthy();
  });

  it('when softened===false, ratedTier equals targetTier', () => {
    const result = generateNonogramPuzzleForTier(42_102, 'easy');
    expect(result.softened).toBe(false);
    expect(result.ratedTier).toBe('easy');
  });

  it('never produces ratedTier harder than the original request', () => {
    for (const target of ['easy', 'medium', 'hard', 'expert'] as const) {
      const result = generateNonogramPuzzleForTier(
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

  it('SC-2: Expert-empty synthetic pool softens with softened=true', () => {
    const synthetic: NonogramPattern[] = NONOGRAM_PATTERNS.map((p) => ({
      ...p,
      difficultyTier: 'easy' as const,
    }));
    const result = generateNonogramPuzzleForTier(77_001, 'expert', {
      patterns: synthetic,
    });
    expect(result.softened).toBe(true);
    expect(tierIndex(result.ratedTier)).toBeLessThan(tierIndex('expert'));
    expect(result.ratedTier).toBe('easy');
  });

  it('Easy-empty synthetic pool throws Failed to generate nonogram', () => {
    const synthetic: NonogramPattern[] = NONOGRAM_PATTERNS.map((p) => ({
      ...p,
      difficultyTier: 'expert' as const,
    }));
    expect(() =>
      generateNonogramPuzzleForTier(88_001, 'easy', { patterns: synthetic }),
    ).toThrow(/Failed to generate nonogram/);
  });
});
