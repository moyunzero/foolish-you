import {
  cycleEdgeState,
  createBlankSolution,
  createEmptyPlayState,
  cluesFromSolutionEdges,
} from '../../../../lib/puzzles/slitherlink/edges';
import {
  EDGE_BLANK,
  EDGE_LINE,
  EDGE_UNKNOWN,
  SLITHERLINK_SIZE,
} from '../../../../lib/puzzles/slitherlink/spec';

describe('slitherlink edges', () => {
  it('creates empty play state with correct dimensions', () => {
    const play = createEmptyPlayState();
    expect(play.h.length).toBe(SLITHERLINK_SIZE + 1);
    expect(play.h[0].length).toBe(SLITHERLINK_SIZE);
    expect(play.v.length).toBe(SLITHERLINK_SIZE);
    expect(play.v[0].length).toBe(SLITHERLINK_SIZE + 1);
    expect(play.h.flat().every((value) => value === EDGE_UNKNOWN)).toBe(true);
    expect(play.v.flat().every((value) => value === EDGE_UNKNOWN)).toBe(true);
  });

  it('cycles edge states 空→连线→×→无 on tap', () => {
    expect(cycleEdgeState(EDGE_UNKNOWN)).toBe(EDGE_LINE);
    expect(cycleEdgeState(EDGE_LINE)).toBe(EDGE_BLANK);
    expect(cycleEdgeState(EDGE_BLANK)).toBe(EDGE_UNKNOWN);
  });

  it('derives clues from a perimeter solution', () => {
    const solution = createBlankSolution();
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      solution.h[0][col] = EDGE_LINE;
      solution.h[SLITHERLINK_SIZE][col] = EDGE_LINE;
    }
    for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
      solution.v[row][0] = EDGE_LINE;
      solution.v[row][SLITHERLINK_SIZE] = EDGE_LINE;
    }

    const clues = cluesFromSolutionEdges(solution);
    expect(clues[0][0]).toBe(2);
    expect(clues[0][SLITHERLINK_SIZE - 1]).toBe(2);
    expect(clues[SLITHERLINK_SIZE - 1][0]).toBe(2);
    expect(clues[3][3]).toBe(0);
  });
});
