import { getFallbackDailySelection } from '../../../lib/puzzles/fallbackPuzzles';
import { selectDailyGameSafe } from '../../../lib/puzzles/dailySelectorSafe';
import { isPuzzleSolvable } from '../../../lib/puzzles/isSolvable';

jest.mock('../../../lib/puzzles/isSolvable', () => ({
  isPuzzleSolvable: jest.fn(),
}));

const mockIsPuzzleSolvable = jest.mocked(isPuzzleSolvable);

const { isPuzzleSolvable: realIsPuzzleSolvable } = jest.requireActual<
  typeof import('../../../lib/puzzles/isSolvable')
>('../../../lib/puzzles/isSolvable');

describe('selectDailyGameSafe', () => {
  beforeEach(() => {
    mockIsPuzzleSolvable.mockReset();
    mockIsPuzzleSolvable.mockImplementation(realIsPuzzleSolvable);
  });
  it('returns a solvable puzzle for a fixed date', () => {
    const result = selectDailyGameSafe({ dateKey: '2026-05-19' });
    expect(isPuzzleSolvable(result.gameType, result.puzzle)).toBe(true);
    expect(result.puzzleHash.length).toBeGreaterThan(0);
  });

  it('respects forceGameType with solvable output', () => {
    const result = selectDailyGameSafe({
      dateKey: '2026-05-19',
      forceGameType: 'binary',
    });
    expect(result.gameType).toBe('binary');
    expect(isPuzzleSolvable('binary', result.puzzle)).toBe(true);
  });

  it('uses static fallback when both attempts are unsolvable', () => {
    const expected = getFallbackDailySelection('sudoku');
    mockIsPuzzleSolvable.mockImplementation((gameType, puzzle) => {
      if (
        gameType === expected.gameType &&
        puzzle.puzzleHash === expected.puzzleHash
      ) {
        return true;
      }
      return false;
    });
    const result = selectDailyGameSafe({
      dateKey: '2026-05-19',
      forceGameType: 'sudoku',
    });
    expect(result.puzzleHash).toBe(expected.puzzleHash);
    expect(result.seed).toBe(expected.seed);
    expect(mockIsPuzzleSolvable).toHaveBeenCalled();
  });
});
