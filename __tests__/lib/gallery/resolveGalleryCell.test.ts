jest.mock('../../../lib/puzzles/dailySelectorSafe', () => ({
  selectDailyGameSafe: jest.fn(),
}));

import { generateNonogramPuzzle } from '../../../lib/puzzles/nonogram/generator';
import { generateSudokuPuzzle } from '../../../lib/puzzles/sudoku/generator';
import { selectDailyGameSafe } from '../../../lib/puzzles/dailySelectorSafe';
import { resolveGalleryCell } from '../../../lib/gallery/resolveGalleryCell';

const mockedSelect = selectDailyGameSafe as jest.MockedFunction<
  typeof selectDailyGameSafe
>;

describe('resolveGalleryCell', () => {
  beforeEach(() => {
    mockedSelect.mockReset();
  });

  it('returns nonogram reveal cell for nonogram days (D-31)', () => {
    const puzzle = generateNonogramPuzzle(4242);
    mockedSelect.mockReturnValue({
      gameType: 'nonogram',
      seed: 4242,
      puzzle,
      puzzleHash: puzzle.puzzleHash,
    });

    const cell = resolveGalleryCell({
      dateKey: '2026-05-10',
      outcome: 'completed',
    });

    expect(cell.kind).toBe('nonogram');
    if (cell.kind === 'nonogram') {
      expect(cell.puzzle.puzzleHash).toBe(puzzle.puzzleHash);
      expect(cell.dateKey).toBe('2026-05-10');
    }
  });

  it('returns emoji grid for sudoku days', () => {
    const puzzle = generateSudokuPuzzle(9001);
    mockedSelect.mockReturnValue({
      gameType: 'sudoku',
      seed: 9001,
      puzzle,
      puzzleHash: puzzle.puzzleHash,
    });

    const cell = resolveGalleryCell({
      dateKey: '2026-05-11',
      outcome: 'completed',
    });

    expect(cell.kind).toBe('emoji');
    if (cell.kind === 'emoji') {
      expect(cell.emojiGrid).toMatch(/[🟩🟨⬛]/);
      expect(cell.emojiGrid.split('\n').length).toBeGreaterThan(0);
    }
  });

  it('softens emoji tone for abandoned outcomes', () => {
    const puzzle = generateSudokuPuzzle(9001);
    mockedSelect.mockReturnValue({
      gameType: 'sudoku',
      seed: 9001,
      puzzle,
      puzzleHash: puzzle.puzzleHash,
    });

    const completed = resolveGalleryCell({
      dateKey: '2026-05-12',
      outcome: 'completed',
    });
    const abandoned = resolveGalleryCell({
      dateKey: '2026-05-12',
      outcome: 'abandoned',
    });

    expect(completed.kind).toBe('emoji');
    expect(abandoned.kind).toBe('emoji');
    if (completed.kind === 'emoji' && abandoned.kind === 'emoji') {
      expect(abandoned.emojiGrid).not.toEqual(completed.emojiGrid);
    }
  });
});
