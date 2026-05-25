import { createEmptyGrid } from '../../../../lib/puzzles/nonogram/grid';
import { NONOGRAM_FILL } from '../../../../lib/puzzles/nonogram/spec';
import {
  cycleCellValue,
  isCompleteAndValid,
} from '../../../../lib/puzzles/nonogram/validate';
import { generateNonogramPuzzle } from '../../../../lib/puzzles/nonogram/generator';

describe('nonogram validate', () => {
  const puzzle = generateNonogramPuzzle(7);

  it('cycles cell values empty → fill → cross → empty', () => {
    expect(cycleCellValue(-1)).toBe(1);
    expect(cycleCellValue(1)).toBe(0);
    expect(cycleCellValue(0)).toBe(-1);
  });

  it('detects completion when play matches solution', () => {
    const play = createEmptyGrid();
    for (let row = 0; row < puzzle.rows; row += 1) {
      for (let col = 0; col < puzzle.cols; col += 1) {
        if (puzzle.solution[row]![col]) {
          play[row]![col] = NONOGRAM_FILL;
        }
      }
    }
    expect(isCompleteAndValid(play, puzzle.solution)).toBe(true);
  });

  it('is not complete when a fill cell is wrong', () => {
    const play = createEmptyGrid();
    play[0]![0] = NONOGRAM_FILL;
    expect(isCompleteAndValid(play, puzzle.solution)).toBe(false);
  });
});
