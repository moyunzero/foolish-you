import {
  peakToTier,
  TECHNIQUE_ORDER,
  type SlitherlinkTechnique,
} from '../../../../lib/puzzles/slitherlink/techniqueIds';
import {
  SL_MAX_TECHNIQUE_STEPS,
  rateSlitherlink,
} from '../../../../lib/puzzles/slitherlink/rater';
import {
  ALL_FIXTURES,
  EASY_FIXTURE,
  EXPERT_FIXTURE,
  HARD_FIXTURE,
  MEDIUM_FIXTURE,
  TIER_FIXTURES,
} from './fixtures/techniqueBoards';

describe('peakToTier', () => {
  it('maps SlitherlinkTechnique ladder to shared DifficultyTier bands (D-24 compressed)', () => {
    const cases: Array<[SlitherlinkTechnique, string]> = [
      ['zero_elim', 'easy'],
      ['corner_three', 'easy'],
      ['edge_count', 'easy'],
      ['adjacent_three_three', 'medium'],
      ['adjacent_three_zero', 'medium'],
      ['diagonal_three_three', 'medium'],
      ['vertex_degree', 'medium'],
      ['local_loop', 'hard'],
      ['bifurcation', 'expert'],
    ];
    for (const [tech, tier] of cases) {
      expect(peakToTier(tech)).toBe(tier);
    }
  });

  it('TECHNIQUE_ORDER lists every technique once ascending', () => {
    expect(TECHNIQUE_ORDER).toEqual([
      'zero_elim',
      'corner_three',
      'adjacent_three_three',
      'adjacent_three_zero',
      'diagonal_three_three',
      'edge_count',
      'vertex_degree',
      'local_loop',
      'bifurcation',
    ]);
    expect(new Set(TECHNIQUE_ORDER).size).toBe(9);
  });
});

describe('rateSlitherlink fixtures', () => {
  it.each(TIER_FIXTURES)(
    '$id rates to expectedTier $expectedTier peak $expectedPeak',
    (fixture) => {
      const result = rateSlitherlink(fixture.clues);
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
    expect(rateSlitherlink(EASY_FIXTURE.clues)).toMatchObject({
      status: 'solved',
      tier: 'easy',
      peak: EASY_FIXTURE.expectedPeak,
    });
  });

  it('Medium fixture is solved medium', () => {
    expect(rateSlitherlink(MEDIUM_FIXTURE.clues)).toMatchObject({
      status: 'solved',
      tier: 'medium',
      peak: MEDIUM_FIXTURE.expectedPeak,
    });
  });

  it('Hard fixture is solved hard without bifurcation', () => {
    const result = rateSlitherlink(HARD_FIXTURE.clues);
    expect(result).toMatchObject({
      status: 'solved',
      tier: 'hard',
      peak: HARD_FIXTURE.expectedPeak,
    });
    expect(HARD_FIXTURE.expectedPeak).not.toBe('bifurcation');
    if (result.status === 'solved') {
      expect(result.peak).not.toBe('bifurcation');
    }
  });

  it('Expert fixture is solved expert', () => {
    expect(rateSlitherlink(EXPERT_FIXTURE.clues)).toMatchObject({
      status: 'solved',
      tier: 'expert',
      peak: EXPERT_FIXTURE.expectedPeak,
    });
  });

  it('is deterministic for the same clues', () => {
    const a = rateSlitherlink(MEDIUM_FIXTURE.clues);
    const b = rateSlitherlink(MEDIUM_FIXTURE.clues);
    expect(b).toEqual(a);
  });

  it('exports SL_MAX_TECHNIQUE_STEPS = 500', () => {
    expect(SL_MAX_TECHNIQUE_STEPS).toBe(500);
  });

  it('rejects malformed grids as incomplete', () => {
    expect(rateSlitherlink([[1]])).toEqual({ status: 'incomplete', peak: null });
  });
});
