import { clearDailySnapshot, loadDailySnapshot, saveDailySnapshot } from '../../../lib/storage/dailyStorage';
import type { DailySnapshot } from '../../../lib/puzzles/types';

const sample: DailySnapshot = {
  version: 1,
  dateKey: '2026-05-16',
  gameType: 'binary',
  seed: 12345,
  status: 'playing',
  puzzle: { kind: 'binary', placeholder: true },
  puzzleHash: 'binary-stub-v1',
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
      dateKey: sample.dateKey,
      gameType: sample.gameType,
      seed: sample.seed,
      status: sample.status,
      puzzleHash: sample.puzzleHash,
    });
  });
});
