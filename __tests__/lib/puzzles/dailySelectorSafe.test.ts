import { selectDailyGame } from '../../../lib/puzzles/dailySelector';
import { getFallbackDailySelection } from '../../../lib/puzzles/fallbackPuzzles';
import { selectDailyGameSafe } from '../../../lib/puzzles/dailySelectorSafe';
import { isPuzzleSolvable } from '../../../lib/puzzles/isSolvable';
import type { GameType } from '../../../lib/puzzles/types';

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

  it('returns solvable slitherlink when forced', () => {
    const result = selectDailyGameSafe({
      dateKey: '2026-05-19',
      forceGameType: 'slitherlink',
    });
    expect(result.gameType).toBe('slitherlink');
    expect(isPuzzleSolvable('slitherlink', result.puzzle)).toBe(true);
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

  it('never returns fallback puzzleHash on canonical date corpus', () => {
    const byType: Record<GameType, string[]> = {
      sudoku: [],
      binary: [],
      nonogram: [],
      slitherlink: [],
    };

    for (let month = 1; month <= 8; month += 1) {
      const daysInMonth = month === 2 ? 28 : month === 4 || month === 6 ? 30 : 31;
      for (let day = 1; day <= daysInMonth; day += 1) {
        const dateKey = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const picked = selectDailyGame({ dateKey });
        if (byType[picked.gameType].length < 20) {
          byType[picked.gameType].push(dateKey);
        }
      }
    }

    const corpus = [
      ...byType.sudoku,
      ...byType.binary,
      ...byType.nonogram,
      ...byType.slitherlink,
    ];
    expect(corpus.length).toBeGreaterThanOrEqual(60);
    for (const gameType of Object.keys(byType) as GameType[]) {
      expect(byType[gameType].length).toBeGreaterThanOrEqual(15);
    }

    for (const dateKey of corpus) {
      const result = selectDailyGameSafe({ dateKey });
      const fallback = getFallbackDailySelection(result.gameType);
      expect(result.puzzleHash).not.toBe(fallback.puzzleHash);
      expect(isPuzzleSolvable(result.gameType, result.puzzle)).toBe(true);
    }
  });
});
