import {
  RESEARCH_EASY_GUIDE,
  SL_TIER_MAX_ATTEMPTS,
  SL_TIER_MAX_SOFTENS,
  generateSlitherlinkPuzzleForTier,
  guideForTier,
  softenTowardEasier,
} from '../../../../lib/puzzles/slitherlink/generateForTier';
import { tierIndex } from '../../../../lib/puzzles/difficulty/tiers';
import { countSolutionsUpTo } from '../../../../lib/puzzles/slitherlink/solver';
import { createEmptyPlayState } from '../../../../lib/puzzles/slitherlink/edges';
import { rateSlitherlink } from '../../../../lib/puzzles/slitherlink/rater';
import * as fs from 'fs';
import * as path from 'path';

describe('guideForTier', () => {
  it('maps easy/medium/hard/expert to carve guides (Easy–Hard empirical insides)', () => {
    expect(guideForTier('easy').minClues).toBe(45);
    expect(guideForTier('easy').inside.max).toBeLessThanOrEqual(5);
    expect(guideForTier('medium').minClues).toBe(35);
    expect(guideForTier('hard').minClues).toBe(30);
    expect(guideForTier('expert')).toEqual({
      minClues: 10,
      inside: { min: 8, max: 18 },
    });
  });

  it('includes Expert guide values minClues 10 and inside 8–18', () => {
    const expert = guideForTier('expert');
    expect(expert.minClues).toBe(10);
    expect(expert.inside.min).toBe(8);
    expect(expert.inside.max).toBe(18);
  });

  it('retains RESEARCH Easy guide literals 26 / 32–44', () => {
    expect(RESEARCH_EASY_GUIDE.minClues).toBe(26);
    expect(RESEARCH_EASY_GUIDE.inside).toEqual({ min: 32, max: 44 });
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

describe('generateSlitherlinkPuzzleForTier', () => {
  it('exports bounded attempt/soften constants', () => {
    expect(SL_TIER_MAX_ATTEMPTS).toBe(40);
    expect(SL_TIER_MAX_SOFTENS).toBe(3);
  });

  it('is deterministic for the same seed + targetTier', () => {
    const seed = 42_100;
    const first = generateSlitherlinkPuzzleForTier(seed, 'easy');
    const second = generateSlitherlinkPuzzleForTier(seed, 'easy');
    expect(second.puzzle.puzzleHash).toBe(first.puzzle.puzzleHash);
    expect(second.puzzle.clues).toEqual(first.puzzle.clues);
    expect(second.ratedTier).toBe(first.ratedTier);
    expect(second.peakTechnique).toBe(first.peakTechnique);
    expect(second.softened).toBe(first.softened);
  }, 120000);

  it('returns a unique-solution puzzle', () => {
    const result = generateSlitherlinkPuzzleForTier(42_101, 'easy');
    expect(
      countSolutionsUpTo(result.puzzle.clues, createEmptyPlayState(), 2),
    ).toBe(1);
  }, 120000);

  it('never produces ratedTier harder than the original request', () => {
    for (const target of ['easy', 'medium'] as const) {
      const result = generateSlitherlinkPuzzleForTier(
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
  }, 180000);

  it('when softened===false, ratedTier equals requested targetTier', () => {
    const result = generateSlitherlinkPuzzleForTier(42_100, 'easy');
    if (!result.softened) {
      expect(result.ratedTier).toBe('easy');
    }
    expect(tierIndex(result.ratedTier)).toBeLessThanOrEqual(tierIndex('easy'));
  }, 120000);

  it('does not accept incomplete or budget_exhausted rates', () => {
    const result = generateSlitherlinkPuzzleForTier(42_100, 'easy');
    const rated = rateSlitherlink(result.puzzle.clues);
    expect(rated.status).toBe('solved');
    if (rated.status === 'solved') {
      expect(rated.tier).toBe(result.ratedTier);
    }
  }, 120000);

  it('completes an Expert target without hanging', () => {
    const result = generateSlitherlinkPuzzleForTier(42_500, 'expert');
    expect(
      countSolutionsUpTo(result.puzzle.clues, createEmptyPlayState(), 2),
    ).toBe(1);
    expect(tierIndex(result.ratedTier)).toBeLessThanOrEqual(
      tierIndex('expert'),
    );
    if (!result.softened) {
      expect(result.ratedTier).toBe('expert');
    }
  }, 180000);

  it('never references builtinPuzzle (source gate)', () => {
    const src = fs.readFileSync(
      path.join(
        __dirname,
        '../../../../lib/puzzles/slitherlink/generateForTier.ts',
      ),
      'utf8',
    );
    expect(src.includes('builtinPuzzle')).toBe(false);
    expect(src.includes('getSlitherlinkBuiltinPuzzle')).toBe(false);
  });
});
