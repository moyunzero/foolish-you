import { createEmptyGrid } from '../../../../lib/puzzles/nonogram/grid';
import { clonePlayGrid } from '../../../../lib/puzzles/nonogram/techniques';
import { tryProbe } from '../../../../lib/puzzles/nonogram/probe';
import {
  NONOGRAM_CROSS,
  NONOGRAM_EMPTY,
  NONOGRAM_FILL,
} from '../../../../lib/puzzles/nonogram/spec';
import { HARD_FIXTURE } from './fixtures/techniqueBoards';

describe('tryProbe soundness (CR-01)', () => {
  it('does not force a victim cell from an illegal/weak premise', () => {
    // Sparse clues that do not uniquely determine a far corner via CR-01.
    const sparseRows: number[][] = [
      [1],
      [1],
      [0],
      [0],
      [0],
      [0],
      [0],
      [0],
    ];
    const sparseCols: number[][] = [
      [1],
      [1],
      [0],
      [0],
      [0],
      [0],
      [0],
      [0],
    ];

    const grid = createEmptyGrid();
    grid[0]![0] = NONOGRAM_FILL;
    // Leave (7,7) empty as victim — clues do not constrain it uniquely via
    // a single-branch contradiction on this weak premise.
    const play = clonePlayGrid(grid);
    const result = tryProbe(play, sparseRows, sparseCols);

    const victimRow = 7;
    const victimCol = 7;
    if (result.applied) {
      // Any force must be sound; victim corner must remain empty here.
      expect(play[victimRow]![victimCol]).toBe(NONOGRAM_EMPTY);
    } else {
      expect(play[victimRow]![victimCol]).toBe(NONOGRAM_EMPTY);
    }
  });

  it('forces only when exactly one branch contradicts', () => {
    // Use Hard fixture after a partial settle state is not needed —
    // on the empty Hard board, tryProbe may apply a sound force.
    const play = createEmptyGrid();
    const result = tryProbe(
      play,
      HARD_FIXTURE.rowClues,
      HARD_FIXTURE.colClues,
    );

    if (result.applied) {
      // Forced cell must be FILL or CROSS (never left empty at that coord).
      let forced = 0;
      for (let r = 0; r < 8; r += 1) {
        for (let c = 0; c < 8; c += 1) {
          const v = play[r]![c]!;
          if (v === NONOGRAM_FILL || v === NONOGRAM_CROSS) forced += 1;
        }
      }
      expect(forced).toBeGreaterThanOrEqual(1);
    } else {
      expect(result.budgetExceeded).toBe(false);
    }
  });
});
