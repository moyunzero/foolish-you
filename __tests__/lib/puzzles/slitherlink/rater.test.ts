import {
  peakToTier,
  TECHNIQUE_ORDER,
  type SlitherlinkTechnique,
} from '../../../../lib/puzzles/slitherlink/techniqueIds';
import {
  ALL_FIXTURES,
  EASY_FIXTURE,
  HARD_FIXTURE,
  MEDIUM_FIXTURE,
  TIER_FIXTURES,
} from './fixtures/techniqueBoards';

describe('peakToTier', () => {
  it('maps SlitherlinkTechnique ladder to shared DifficultyTier bands (D-24)', () => {
    const cases: Array<[SlitherlinkTechnique, string]> = [
      ['zero_elim', 'easy'],
      ['corner_three', 'easy'],
      ['adjacent_three_three', 'medium'],
      ['adjacent_three_zero', 'medium'],
      ['diagonal_three_three', 'medium'],
      ['edge_count', 'medium'],
      ['vertex_degree', 'hard'],
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

describe('technique board fixtures (scaffold)', () => {
  it('covers easy, medium, and hard expectedTier with expectedPeak', () => {
    const tiers = new Set(TIER_FIXTURES.map((f) => f.expectedTier));
    expect(tiers.has('easy')).toBe(true);
    expect(tiers.has('medium')).toBe(true);
    expect(tiers.has('hard')).toBe(true);

    for (const fixture of TIER_FIXTURES) {
      expect(fixture.expectedPeak).toBeTruthy();
      expect(peakToTier(fixture.expectedPeak)).toBe(fixture.expectedTier);
      expect(fixture.clues).toHaveLength(7);
      expect(fixture.clues.every((row) => row.length === 7)).toBe(true);
    }
  });

  it('Easy fixture declares easy tier and easy-band peak', () => {
    expect(EASY_FIXTURE.expectedTier).toBe('easy');
    expect(peakToTier(EASY_FIXTURE.expectedPeak)).toBe('easy');
  });

  it('Medium fixture declares medium tier and medium-band peak', () => {
    expect(MEDIUM_FIXTURE.expectedTier).toBe('medium');
    expect(peakToTier(MEDIUM_FIXTURE.expectedPeak)).toBe('medium');
  });

  it('Hard fixture declares hard tier and hard-band peak (not bifurcation)', () => {
    expect(HARD_FIXTURE.expectedTier).toBe('hard');
    expect(peakToTier(HARD_FIXTURE.expectedPeak)).toBe('hard');
    expect(HARD_FIXTURE.expectedPeak).not.toBe('bifurcation');
  });

  it('ALL_FIXTURES includes expert stub metadata', () => {
    const tiers = new Set(ALL_FIXTURES.map((f) => f.expectedTier));
    expect(tiers.has('expert')).toBe(true);
  });
});
