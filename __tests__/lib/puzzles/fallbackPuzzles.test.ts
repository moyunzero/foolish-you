import { FALLBACK_DATE_KEYS, getFallbackDailySelection } from '../../../lib/puzzles/fallbackPuzzles';
import { isPuzzleSolvable } from '../../../lib/puzzles/isSolvable';

describe('fallbackPuzzles', () => {
  it('each game type fallback is solvable', () => {
    for (const gameType of ['sudoku', 'binary', 'nonogram'] as const) {
      const selected = getFallbackDailySelection(gameType);
      expect(selected.gameType).toBe(gameType);
      expect(isPuzzleSolvable(gameType, selected.puzzle)).toBe(true);
      expect(FALLBACK_DATE_KEYS[gameType]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
