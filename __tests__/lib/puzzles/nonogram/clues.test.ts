import { computeClues, computeLineClues } from '../../../../lib/puzzles/nonogram/clues';

describe('nonogram clues', () => {
  it('computes line clues for filled segments', () => {
    expect(computeLineClues([true, true, false, true])).toEqual([2, 1]);
  });

  it('returns [0] for empty line', () => {
    expect(computeLineClues([false, false])).toEqual([0]);
  });

  it('computes row and column clues from solution', () => {
    const solution = [
      [true, true, false],
      [false, true, true],
      [false, false, false],
    ];
    const { rowClues, colClues } = computeClues(solution);
    expect(rowClues).toEqual([[2], [2], [0]]);
    expect(colClues).toEqual([[1], [2], [1]]);
  });
});
