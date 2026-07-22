import { hasPlayProgress } from '../../../lib/daily/hasPlayProgress';
import { createEmptyGrid as createEmptyBinaryGrid } from '../../../lib/puzzles/binary/grid';
import { BINARY_ONE } from '../../../lib/puzzles/binary/grid';
import { createEmptyGrid as createEmptyNonogramGrid } from '../../../lib/puzzles/nonogram/grid';
import { NONOGRAM_CROSS, NONOGRAM_FILL } from '../../../lib/puzzles/nonogram/spec';
import {
  createEmptyPlayState as createEmptySlitherlinkPlayState,
} from '../../../lib/puzzles/slitherlink/edges';
import { EDGE_BLANK, EDGE_LINE } from '../../../lib/puzzles/slitherlink/spec';
import { createEmptyGrid as createEmptySudokuGrid } from '../../../lib/puzzles/sudoku/grid';

describe('hasPlayProgress', () => {
  it('is false for empty factory playState of each type (D-06)', () => {
    expect(hasPlayProgress('sudoku', createEmptySudokuGrid())).toBe(false);
    expect(hasPlayProgress('binary', createEmptyBinaryGrid())).toBe(false);
    expect(hasPlayProgress('nonogram', createEmptyNonogramGrid())).toBe(false);
    expect(hasPlayProgress('slitherlink', createEmptySlitherlinkPlayState())).toBe(
      false,
    );
  });

  it('is false when playState is null or undefined', () => {
    expect(hasPlayProgress('sudoku', null)).toBe(false);
    expect(hasPlayProgress('sudoku', undefined)).toBe(false);
  });

  it('is true after any sudoku cell fill', () => {
    const play = createEmptySudokuGrid();
    play[0][0] = 5;
    expect(hasPlayProgress('sudoku', play)).toBe(true);
  });

  it('is true after any binary cell fill', () => {
    const play = createEmptyBinaryGrid();
    play[1][1] = BINARY_ONE;
    expect(hasPlayProgress('binary', play)).toBe(true);
  });

  it('is true after nonogram fill or mark (×)', () => {
    const filled = createEmptyNonogramGrid();
    filled[0][0] = NONOGRAM_FILL;
    expect(hasPlayProgress('nonogram', filled)).toBe(true);

    const marked = createEmptyNonogramGrid();
    marked[2][3] = NONOGRAM_CROSS;
    expect(hasPlayProgress('nonogram', marked)).toBe(true);
  });

  it('is true after slitherlink line or × mark', () => {
    const lined = createEmptySlitherlinkPlayState();
    lined.h[0][0] = EDGE_LINE;
    expect(hasPlayProgress('slitherlink', lined)).toBe(true);

    const crossed = createEmptySlitherlinkPlayState();
    crossed.v[0][0] = EDGE_BLANK;
    expect(hasPlayProgress('slitherlink', crossed)).toBe(true);
  });
});
