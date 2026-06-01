import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEY, STORAGE_VERSION } from '../../../constants/config';
import { generateBinaryPuzzle } from '../../../lib/puzzles/binary/generator';
import { createEmptyGrid as createEmptyBinaryGrid } from '../../../lib/puzzles/binary/grid';
import { createEmptyGrid as createEmptySudokuGrid } from '../../../lib/puzzles/sudoku/grid';
import { clearDailySnapshot, loadDailySnapshot, saveDailySnapshot } from '../../../lib/storage/dailyStorage';
import type { DailySnapshot } from '../../../lib/puzzles/types';

const binaryPuzzle = generateBinaryPuzzle(12345);
const sample: DailySnapshot = {
  version: STORAGE_VERSION,
  dateKey: '2026-05-16',
  gameType: 'binary',
  seed: 12345,
  status: 'playing',
  puzzle: binaryPuzzle,
  puzzleHash: binaryPuzzle.puzzleHash,
  playState: createEmptyBinaryGrid(),
};

describe('dailyStorage', () => {
  beforeEach(async () => {
    await clearDailySnapshot();
  });

  it('returns null when empty', async () => {
    await expect(loadDailySnapshot()).resolves.toBeNull();
  });

  it('round-trips snapshot fields', async () => {
    await saveDailySnapshot(sample);
    const loaded = await loadDailySnapshot();
    expect(loaded).toMatchObject({
      version: STORAGE_VERSION,
      dateKey: sample.dateKey,
      gameType: sample.gameType,
      seed: sample.seed,
      status: sample.status,
      puzzleHash: sample.puzzleHash,
    });
    expect(loaded).not.toHaveProperty('puzzleStub');
  });

  it('upgrades v1 blob on load and persists v2', async () => {
    const v1 = {
      version: 1,
      dateKey: '2026-05-16',
      gameType: 'binary',
      seed: 99,
      status: 'playing',
      puzzle: { kind: 'binary', placeholder: true },
      puzzleHash: 'old',
      puzzleStub: { kind: 'binary', placeholder: true },
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(v1));
    const loaded = await loadDailySnapshot();
    expect(loaded?.version).toBe(2);
    expect(loaded).not.toHaveProperty('puzzleStub');
    expect(loaded?.puzzle.kind).toBe('binary');
    expect('givens' in (loaded?.puzzle ?? {})).toBe(true);
  });

  it('returns false when AsyncStorage write fails', async () => {
    const setItem = jest
      .spyOn(AsyncStorage, 'setItem')
      .mockRejectedValueOnce(new Error('disk full'));

    const ok = await saveDailySnapshot(sample);
    expect(ok).toBe(false);

    setItem.mockRestore();
  });

  it('returns false when puzzle shape is inconsistent', async () => {
    const broken = {
      ...sample,
      puzzle: {
        kind: 'sudoku',
        givens: createEmptySudokuGrid(),
        puzzleHash: 'wrong',
      },
      puzzleHash: 'wrong',
    } as DailySnapshot;

    const ok = await saveDailySnapshot(broken);
    expect(ok).toBe(false);
    await expect(AsyncStorage.getItem(STORAGE_KEY)).resolves.toBeNull();
  });
});
