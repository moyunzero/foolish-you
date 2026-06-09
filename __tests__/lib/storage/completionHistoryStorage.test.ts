import AsyncStorage from '@react-native-async-storage/async-storage';

import { COMPLETION_HISTORY_STORAGE_KEY } from '../../../constants/config';
import {
  clearCompletionHistory,
  loadCompletionHistory,
  normalizeCompletionHistory,
  recordAbandon,
  recordCompletion,
} from '../../../lib/storage/completionHistoryStorage';

describe('completionHistoryStorage', () => {
  beforeEach(async () => {
    await clearCompletionHistory();
  });

  it('recordCompletion writes completed outcome', async () => {
    await recordCompletion('2026-05-20', 90_000);
    const raw = await AsyncStorage.getItem(COMPLETION_HISTORY_STORAGE_KEY);
    expect(raw).toContain('"outcome":"completed"');
  });

  it('recordAbandon writes abandoned outcome', async () => {
    await recordAbandon('2026-05-21', 45_000);
    const { entries } = await loadCompletionHistory();
    expect(entries).toEqual([
      { dateKey: '2026-05-21', elapsedMs: 45_000, outcome: 'abandoned' },
    ]);
  });

  it('overwrites same dateKey on abandon after completion', async () => {
    await recordCompletion('2026-05-22', 10_000);
    await recordAbandon('2026-05-22', 20_000);
    const { entries } = await loadCompletionHistory();
    expect(entries).toEqual([
      { dateKey: '2026-05-22', elapsedMs: 20_000, outcome: 'abandoned' },
    ]);
  });

  it('normalize treats missing outcome as completed', () => {
    const normalized = normalizeCompletionHistory({
      version: 1,
      entries: [{ dateKey: '2026-05-18', elapsedMs: 1000 }],
    });
    expect(normalized?.entries[0]).toEqual({
      dateKey: '2026-05-18',
      elapsedMs: 1000,
    });
  });
});
