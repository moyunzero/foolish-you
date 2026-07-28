import {
  peakToTier,
  TECHNIQUE_ORDER,
  type SudokuTechnique,
} from '../../../../lib/puzzles/sudoku/techniqueIds';
import { initCandidates, initTechniqueBoard } from '../../../../lib/puzzles/sudoku/candidates';
import { applyNextTechnique, isGridFull } from '../../../../lib/puzzles/sudoku/techniques';
import { rateSudoku } from '../../../../lib/puzzles/sudoku/rater';
import {
  ALL_FIXTURES,
  EASY_FIXTURE,
  HARD_FIXTURE,
  MEDIUM_FIXTURE,
  TIER_FIXTURES,
} from './fixtures/techniqueBoards';

describe('peakToTier', () => {
  it('maps technique ladder to shared DifficultyTier bands (D-02)', () => {
    const cases: Array<[SudokuTechnique, string]> = [
      ['full_house', 'easy'],
      ['naked_single', 'easy'],
      ['hidden_single', 'easy'],
      ['pointing', 'medium'],
      ['claiming', 'medium'],
      ['naked_pair', 'medium'],
      ['hidden_pair', 'medium'],
      ['naked_triple', 'hard'],
      ['hidden_triple', 'hard'],
      ['x_wing', 'hard'],
      ['swordfish', 'hard'],
      ['xy_wing', 'expert'],
      ['short_chain', 'expert'],
    ];
    for (const [tech, tier] of cases) {
      expect(peakToTier(tech)).toBe(tier);
    }
  });

  it('TECHNIQUE_ORDER lists every technique once ascending', () => {
    expect(TECHNIQUE_ORDER).toHaveLength(13);
    expect(new Set(TECHNIQUE_ORDER).size).toBe(13);
  });
});

describe('candidates + singles path', () => {
  it('initCandidates + singles empty the Easy full-house fixture', () => {
    const board = initTechniqueBoard(EASY_FIXTURE.givens);
    expect(initCandidates(EASY_FIXTURE.givens)).toHaveLength(81);
    let steps = 0;
    while (!isGridFull(board) && steps < 10) {
      const hit = applyNextTechnique(board);
      expect(hit.applied).toBe(true);
      if (hit.applied) {
        expect(['full_house', 'naked_single', 'hidden_single']).toContain(
          hit.technique,
        );
      }
      steps += 1;
    }
    expect(isGridFull(board)).toBe(true);
  });
});

describe('rateSudoku fixtures (TDD)', () => {
  it.each(TIER_FIXTURES)(
    '$id rates to expectedTier $expectedTier',
    (fixture) => {
      const result = rateSudoku(fixture.givens);
      expect(result.status).toBe('solved');
      if (result.status === 'solved') {
        expect(result.tier).toBe(fixture.expectedTier);
        expect(peakToTier(result.peak)).toBe(fixture.expectedTier);
      }
    },
  );

  it('Easy fixture is solved easy', () => {
    const result = rateSudoku(EASY_FIXTURE.givens);
    expect(result).toMatchObject({
      status: 'solved',
      tier: 'easy',
    });
  });

  it('Medium fixture is solved medium', () => {
    const result = rateSudoku(MEDIUM_FIXTURE.givens);
    expect(result.status).toBe('solved');
    if (result.status === 'solved') {
      expect(result.tier).toBe('medium');
    }
  });

  it('Hard fixture is solved hard', () => {
    const result = rateSudoku(HARD_FIXTURE.givens);
    expect(result.status).toBe('solved');
    if (result.status === 'solved') {
      expect(result.tier).toBe('hard');
    }
  });

  it('covers easy/medium/hard expectedTier in fixture module', () => {
    const tiers = new Set(TIER_FIXTURES.map((f) => f.expectedTier));
    expect(tiers.has('easy')).toBe(true);
    expect(tiers.has('medium')).toBe(true);
    expect(tiers.has('hard')).toBe(true);
    expect(ALL_FIXTURES.some((f) => f.expectedTier === 'expert')).toBe(true);
  });
});
