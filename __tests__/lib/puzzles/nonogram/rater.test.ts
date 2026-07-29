import {
  peakToTier,
  TECHNIQUE_ORDER,
  type NonogramTechnique,
} from '../../../../lib/puzzles/nonogram/techniqueIds';
import {
  NONOGRAM_EASY_MAX_SWEEPS,
  NONOGRAM_MAX_PRODUCTIVE_PROBES,
  NONOGRAM_MAX_TECHNIQUE_STEPS,
  rateNonogram,
} from '../../../../lib/puzzles/nonogram/rater';
import {
  ALL_FIXTURES,
  EASY_FIXTURE,
  EXPERT_FIXTURE,
  HARD_FIXTURE,
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

describe('rateNonogram fixtures', () => {
  it.each(TIER_FIXTURES)(
    '$id rates to expectedTier $expectedTier peak $expectedPeak',
    (fixture) => {
      const result = rateNonogram(fixture.rowClues, fixture.colClues);
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
    expect(rateNonogram(EASY_FIXTURE.rowClues, EASY_FIXTURE.colClues)).toMatchObject({
      status: 'solved',
      tier: 'easy',
      peak: EASY_FIXTURE.expectedPeak,
    });
  });

  it('Medium fixture is solved medium', () => {
    expect(
      rateNonogram(MEDIUM_FIXTURE.rowClues, MEDIUM_FIXTURE.colClues),
    ).toMatchObject({
      status: 'solved',
      tier: 'medium',
      peak: MEDIUM_FIXTURE.expectedPeak,
    });
  });

  it('Hard fixture is solved hard', () => {
    expect(rateNonogram(HARD_FIXTURE.rowClues, HARD_FIXTURE.colClues)).toMatchObject({
      status: 'solved',
      tier: 'hard',
      peak: HARD_FIXTURE.expectedPeak,
    });
  });

  it('Expert fixture is solved expert', () => {
    expect(
      rateNonogram(EXPERT_FIXTURE.rowClues, EXPERT_FIXTURE.colClues),
    ).toMatchObject({
      status: 'solved',
      tier: 'expert',
      peak: EXPERT_FIXTURE.expectedPeak,
    });
  });

  it('is deterministic for the same clues', () => {
    const a = rateNonogram(MEDIUM_FIXTURE.rowClues, MEDIUM_FIXTURE.colClues);
    const b = rateNonogram(MEDIUM_FIXTURE.rowClues, MEDIUM_FIXTURE.colClues);
    expect(b).toEqual(a);
  });

  it('exports locked sweep/step/probe constants', () => {
    expect(NONOGRAM_EASY_MAX_SWEEPS).toBe(3);
    expect(NONOGRAM_MAX_TECHNIQUE_STEPS).toBe(500);
    expect(NONOGRAM_MAX_PRODUCTIVE_PROBES).toBe(8);
  });

  it('rejects malformed clues as incomplete', () => {
    expect(rateNonogram([[1]], [[1]])).toEqual({
      status: 'incomplete',
      peak: null,
    });
  });
});
