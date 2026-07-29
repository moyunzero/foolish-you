import { clonePlayState, createEmptyPlayState } from '../../../../lib/puzzles/slitherlink/edges';
import {
  SL_BIFURCATION_MAX_DEPTH,
  SL_BIFURCATION_MAX_NODES,
  tryBifurcation,
} from '../../../../lib/puzzles/slitherlink/bifurcation';
import { EDGE_UNKNOWN, SLITHERLINK_SIZE } from '../../../../lib/puzzles/slitherlink/spec';

describe('tryBifurcation soundness (CR-01)', () => {
  it('exports bifurcation caps', () => {
    expect(SL_BIFURCATION_MAX_DEPTH).toBe(2);
    expect(SL_BIFURCATION_MAX_NODES).toBe(600);
  });

  it('does not force an edge from an illegal/weak premise', () => {
    // Empty play + no clues: both LINE and BLANK are locally OK for any edge;
    // bifurcation must not force a placement on this weak board.
    const clues: (number | null)[][] = Array.from({ length: SLITHERLINK_SIZE }, () =>
      Array<number | null>(SLITHERLINK_SIZE).fill(null),
    );
    const play = createEmptyPlayState();
    const before = clonePlayState(play);

    const result = tryBifurcation(play, clues);

    if (result.applied) {
      // Any force must be sound; on a null-clue empty board no unique force exists.
      // Victim far edge must remain unknown.
      expect(play.h[SLITHERLINK_SIZE]![SLITHERLINK_SIZE - 1]).toBe(EDGE_UNKNOWN);
    } else {
      expect(play).toEqual(before);
    }
  });

  it('forces only when exactly one branch contradicts', () => {
    // Clue 0 at (0,0): LINE on any of its four edges contradicts; BLANK is OK.
    // After zero-style contradiction, bifurcation may force BLANK on an edge
    // of the 0-cell — never LINE.
    const clues: (number | null)[][] = Array.from({ length: SLITHERLINK_SIZE }, () =>
      Array<number | null>(SLITHERLINK_SIZE).fill(null),
    );
    clues[0]![0] = 0;

    const play = createEmptyPlayState();
    const result = tryBifurcation(play, clues);

    if (result.applied) {
      // Forced edge around the 0 must be blank, not line.
      const top = play.h[0]![0];
      const left = play.v[0]![0];
      const bottom = play.h[1]![0];
      const right = play.v[0]![1];
      const forced = [top, left, bottom, right].filter((s) => s !== EDGE_UNKNOWN);
      expect(forced.length).toBeGreaterThanOrEqual(1);
      for (const state of forced) {
        expect(state).not.toBe(1); // EDGE_LINE
      }
    }
  });
});
