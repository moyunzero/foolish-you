import {
  peakToTier,
  TECHNIQUE_ORDER,
  type BinaryTechnique,
} from '../../../../lib/puzzles/binary/techniqueIds';
import {
  BINARY_MAX_TECHNIQUE_STEPS,
  rateBinary,
} from '../../../../lib/puzzles/binary/rater';
import {
  ALL_FIXTURES,
  EASY_FIXTURE,
  EXPERT_FIXTURE,
  HARD_FIXTURE,
  MEDIUM_FIXTURE,
  TIER_FIXTURES,
} from './fixtures/techniqueBoards';

describe('peakToTier', () => {
  it('maps BinaryTechnique ladder to shared DifficultyTier bands (D-23)', () => {
    const cases: Array<[BinaryTechnique, string]> = [
      ['adjacent_pair', 'easy'],
      ['gap_fill', 'easy'],
      ['balance', 'medium'],
      ['uniqueness', 'hard'],
      ['look_ahead', 'expert'],
    ];
    for (const [tech, tier] of cases) {
      expect(peakToTier(tech)).toBe(tier);
    }
  });

  it('TECHNIQUE_ORDER lists every technique once ascending', () => {
    expect(TECHNIQUE_ORDER).toEqual([
      'adjacent_pair',
      'gap_fill',
      'balance',
      'uniqueness',
      'look_ahead',
    ]);
    expect(new Set(TECHNIQUE_ORDER).size).toBe(5);
  });
});

describe('rateBinary fixtures', () => {
  it.each(TIER_FIXTURES)(
    '$id rates to expectedTier $expectedTier peak $expectedPeak',
    (fixture) => {
      const result = rateBinary(fixture.givens);
      expect(result.status).toBe('solved');
      if (result.status === 'solved') {
        expect(result.tier).toBe(fixture.expectedTier);
        expect(result.peak).toBe(fixture.expectedPeak);
        expect(peakToTier(result.peak)).toBe(fixture.expectedTier);
      }
    },
  );

  it('covers all four expected tiers', () => {
    const tiers = new Set(ALL_FIXTURES.map((f) => f.expectedTier));
    expect(tiers.has('easy')).toBe(true);
    expect(tiers.has('medium')).toBe(true);
    expect(tiers.has('hard')).toBe(true);
    expect(tiers.has('expert')).toBe(true);
  });

  it('Easy fixture is solved easy', () => {
    expect(rateBinary(EASY_FIXTURE.givens)).toMatchObject({
      status: 'solved',
      tier: 'easy',
      peak: EASY_FIXTURE.expectedPeak,
    });
  });

  it('Medium fixture is solved medium', () => {
    expect(rateBinary(MEDIUM_FIXTURE.givens)).toMatchObject({
      status: 'solved',
      tier: 'medium',
      peak: MEDIUM_FIXTURE.expectedPeak,
    });
  });

  it('Hard fixture is solved hard', () => {
    expect(rateBinary(HARD_FIXTURE.givens)).toMatchObject({
      status: 'solved',
      tier: 'hard',
      peak: HARD_FIXTURE.expectedPeak,
    });
  });

  it('Expert fixture is solved expert', () => {
    expect(rateBinary(EXPERT_FIXTURE.givens)).toMatchObject({
      status: 'solved',
      tier: 'expert',
      peak: EXPERT_FIXTURE.expectedPeak,
    });
  });

  it('is deterministic for the same givens', () => {
    const a = rateBinary(MEDIUM_FIXTURE.givens);
    const b = rateBinary(MEDIUM_FIXTURE.givens);
    expect(b).toEqual(a);
  });

  it('exports BINARY_MAX_TECHNIQUE_STEPS = 500', () => {
    expect(BINARY_MAX_TECHNIQUE_STEPS).toBe(500);
  });

  it('rejects malformed grids as incomplete', () => {
    expect(rateBinary([[1]])).toEqual({ status: 'incomplete', peak: null });
  });
});
