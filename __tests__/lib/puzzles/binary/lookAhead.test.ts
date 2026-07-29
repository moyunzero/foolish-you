import { clonePlayGrid } from '../../../../lib/puzzles/binary/techniques';
import {
  BINARY_LOOKAHEAD_MAX_DEPTH,
  tryLookAhead,
} from '../../../../lib/puzzles/binary/lookAhead';
import {
  BINARY_EMPTY,
  BINARY_ONE,
  BINARY_ZERO,
} from '../../../../lib/puzzles/binary/grid';

describe('tryLookAhead soundness (CR-01)', () => {
  it('does not force a victim cell from an illegal premise', () => {
    // Board where both hypotheses for a cell are locally OK after Easy–Hard
    // prop (neither branch contradicts). look_ahead must not place the victim.
    const grid = Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => BINARY_EMPTY),
    );
    // Sparse legal seeds — not enough structure for a unique force.
    grid[0]![0] = BINARY_ZERO;
    grid[0]![1] = BINARY_ONE;
    grid[1]![0] = BINARY_ONE;
    grid[1]![1] = BINARY_ZERO;

    const victimRow = 7;
    const victimCol = 7;
    expect(grid[victimRow]![victimCol]).toBe(BINARY_EMPTY);

    const play = clonePlayGrid(grid);
    const result = tryLookAhead(play);

    // If applied, must not have filled the far victim via unsound reasoning
    // on this sparse board (no contradiction available for either digit).
    if (result.applied) {
      // Any force must be on a cell where one branch truly contradicts.
      // Victim corner must remain empty on this illegal/weak premise board.
      expect(play[victimRow]![victimCol]).toBe(BINARY_EMPTY);
    } else {
      expect(play[victimRow]![victimCol]).toBe(BINARY_EMPTY);
    }
  });

  it('forces only when exactly one branch contradicts', () => {
    // Row with adjacent pair almost forcing via look-ahead on a cell that
    // immediately triples under one hypothesis.
    const grid = Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => BINARY_EMPTY),
    );
    // XX at cols 0,1 both ZERO → placing ZERO at col 2 triples (contradiction);
    // placing ONE is locally OK. Sound look_ahead may force ONE at (0,2).
    grid[0]![0] = BINARY_ZERO;
    grid[0]![1] = BINARY_ZERO;

    const play = clonePlayGrid(grid);
    const result = tryLookAhead(play);

    // adjacent_pair would normally place this; look_ahead is only consulted
    // when Easy–Hard miss. Here we call look_ahead directly: sound force OK.
    if (result.applied) {
      expect(play[0]![2]).toBe(BINARY_ONE);
    } else {
      // If missed, victim must still be empty (never illegal ZERO force).
      expect(play[0]![2]).not.toBe(BINARY_ZERO);
    }
  });

  it('respects max depth without applying at the depth guard', () => {
    const grid = Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => BINARY_EMPTY),
    );
    grid[0]![0] = BINARY_ZERO;
    grid[0]![1] = BINARY_ZERO;
    const play = clonePlayGrid(grid);
    const result = tryLookAhead(play, BINARY_LOOKAHEAD_MAX_DEPTH);
    expect(result).toEqual({ applied: false, budgetExceeded: false });
    expect(play[0]![2]).toBe(BINARY_EMPTY);
  });
});
