import {
  peakToTier,
  TECHNIQUE_ORDER,
  type NonogramTechnique,
} from '../../../../lib/puzzles/nonogram/techniqueIds';
import {
  ALL_FIXTURES,
  EASY_FIXTURE,
  MEDIUM_FIXTURE,
  TIER_FIXTURES,
} from './fixtures/techniqueBoards';

describe('peakToTier', () => {
  it('maps NonogramTechnique ladder to shared DifficultyTier bands (D-26)', () => {
    const cases: Array<[NonogramTechnique, string]> = [
      ['simple_few', 'easy'],
      ['simple_many', 'medium'],
      ['probe', 'hard'],
      ['nested_probe', 'expert'],
    ];
    for (const [tech, tier] of cases) {
      expect(peakToTier(tech)).toBe(tier);
    }
  });

  it('TECHNIQUE_ORDER lists every technique once ascending', () => {
    expect(TECHNIQUE_ORDER).toEqual([
      'simple_few',
      'simple_many',
      'probe',
      'nested_probe',
    ]);
    expect(new Set(TECHNIQUE_ORDER).size).toBe(4);
  });
});

describe('technique fixtures scaffold (TDD RED until rateNonogram)', () => {
  it('covers easy and medium expectedTier/peaks', () => {
    expect(EASY_FIXTURE.expectedTier).toBe('easy');
    expect(EASY_FIXTURE.expectedPeak).toBe('simple_few');
    expect(MEDIUM_FIXTURE.expectedTier).toBe('medium');
    expect(MEDIUM_FIXTURE.expectedPeak).toBe('simple_many');
  });

  it('TIER_FIXTURES list all four expectedTier', () => {
    const tiers = new Set(TIER_FIXTURES.map((f) => f.expectedTier));
    expect(tiers.has('easy')).toBe(true);
    expect(tiers.has('medium')).toBe(true);
    expect(tiers.has('hard')).toBe(true);
    expect(tiers.has('expert')).toBe(true);
    expect(ALL_FIXTURES).toHaveLength(4);
  });
});
