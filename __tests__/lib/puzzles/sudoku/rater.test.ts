import {
  peakToTier,
  TECHNIQUE_ORDER,
  type SudokuTechnique,
} from '../../../../lib/puzzles/sudoku/techniqueIds';
import {
  initCandidates,
  initTechniqueBoard,
} from '../../../../lib/puzzles/sudoku/candidates';
import {
  applyNextTechnique,
  isGridFull,
} from '../../../../lib/puzzles/sudoku/techniques';
import {
  EXPERT_CHAIN_MAX_NODES,
  EXPERT_MAX_TECHNIQUE_STEPS,
  rateSudoku,
} from '../../../../lib/puzzles/sudoku/rater';
import {
  ALL_FIXTURES,
  EASY_FIXTURE,
  EXPERT_FIXTURE,
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

describe('rateSudoku fixtures', () => {
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

  it('covers all four expected tiers', () => {
    const tiers = new Set(ALL_FIXTURES.map((f) => f.expectedTier));
    expect(tiers.has('easy')).toBe(true);
    expect(tiers.has('medium')).toBe(true);
    expect(tiers.has('hard')).toBe(true);
    expect(tiers.has('expert')).toBe(true);
  });

  it('Easy fixture is solved easy', () => {
    expect(rateSudoku(EASY_FIXTURE.givens)).toMatchObject({
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

  it('Expert fixture is solved expert', () => {
    const result = rateSudoku(EXPERT_FIXTURE.givens);
    expect(result.status).toBe('solved');
    if (result.status === 'solved') {
      expect(result.tier).toBe('expert');
    }
  });
});

describe('rateSudoku determinism + budgets', () => {
  it('same givens → identical RateSudokuResult', () => {
    const a = rateSudoku(HARD_FIXTURE.givens);
    const b = rateSudoku(HARD_FIXTURE.givens);
    expect(a).toEqual(b);
  });

  it('exports named Expert step/node caps', () => {
    expect(EXPERT_MAX_TECHNIQUE_STEPS).toBe(500);
    expect(EXPERT_CHAIN_MAX_NODES).toBe(2000);
  });

  it('rejects malformed grids as incomplete', () => {
    expect(rateSudoku([[1]] as unknown as number[][])).toEqual({
      status: 'incomplete',
      peak: null,
    });
  });

  it('does not import solve for placement (source contract)', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const src = fs.readFileSync(
      path.join(__dirname, '../../../../lib/puzzles/sudoku/rater.ts'),
      'utf8',
    );
    expect(src).not.toMatch(/from ['"]\.\/solver['"]/);
    expect(src).not.toMatch(/[^a-zA-Z]solve\s*\(/);
    expect(src).not.toMatch(/Date\.now/);
  });
});
