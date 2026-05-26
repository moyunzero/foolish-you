import { STORAGE_KEY } from '../../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateSudokuPuzzle } from '../../../lib/puzzles/sudoku/generator';
import { createEmptyGrid as createEmptySudokuGrid } from '../../../lib/puzzles/sudoku/grid';
import { clearRecoveryLog, loadRecoveryLog } from '../../../lib/storage/recoveryLog';
import { loadDailySnapshot } from '../../../lib/storage/dailyStorage';

describe('dailyStorage recovery on load', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await clearRecoveryLog();
  });

  it('recovers completed snapshot with empty playState and logs event', async () => {
    const puzzle = generateSudokuPuzzle(4242);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 2,
        dateKey: '2026-05-20',
        gameType: 'sudoku',
        seed: 4242,
        status: 'completed',
        puzzle,
        puzzleHash: puzzle.puzzleHash,
        playState: createEmptySudokuGrid(),
        startedAt: Date.now() - 60_000,
        finishedAt: Date.now(),
      }),
    );

    const loaded = await loadDailySnapshot();
    expect(loaded?.status).toBe('completed');
    expect(loaded?.playState).toBeUndefined();

    const log = await loadRecoveryLog();
    expect(log.some((e) => e.kind === 'play_state_contradiction')).toBe(true);
  });
});
