import * as fs from 'node:fs';
import * as path from 'node:path';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { COMPLETION_HISTORY_STORAGE_KEY } from '../../../../constants/config';
import {
  clearCompletionHistory,
  loadCompletionHistory,
  normalizeCompletionHistory,
  recordCompletion,
} from '../../../../lib/storage/completionHistoryStorage';

const FIXTURE_DIR = path.join(__dirname, 'fixtures');

function loadFixture(name: string): unknown {
  const raw = fs.readFileSync(path.join(FIXTURE_DIR, name), 'utf8');
  return JSON.parse(raw);
}

describe('completion history v2 → v3 gameType migration', () => {
  it('keeps v2 entries with gameType undefined (no backfill)', () => {
    const normalized = normalizeCompletionHistory(loadFixture('completion-history-v2.json'));
    expect(normalized).not.toBeNull();
    expect(normalized!.entries).toHaveLength(2);
    expect(normalized!.entries[0]).toEqual({
      dateKey: '2026-05-18',
      elapsedMs: 120_000,
    });
    expect(normalized!.entries[0]!.gameType).toBeUndefined();
    expect(normalized!.entries[1]).toEqual({
      dateKey: '2026-05-19',
      elapsedMs: 45_000,
      outcome: 'abandoned',
    });
    expect(normalized!.entries[1]!.gameType).toBeUndefined();
  });

  it('preserves a valid v3 gameType and drops an unknown one to undefined', () => {
    const normalized = normalizeCompletionHistory(loadFixture('completion-history-v3.json'));
    expect(normalized).not.toBeNull();
    expect(normalized!.entries).toHaveLength(2);
    expect(normalized!.entries[0]).toEqual({
      dateKey: '2026-05-20',
      elapsedMs: 60_000,
      gameType: 'sudoku',
    });
    // Unknown gameType ("chess") is dropped to undefined; entry is kept, no throw.
    expect(normalized!.entries[1]).toEqual({
      dateKey: '2026-05-21',
      elapsedMs: 70_000,
    });
    expect(normalized!.entries[1]!.gameType).toBeUndefined();
  });

  it('rejects a version newer than the current schema', () => {
    const normalized = normalizeCompletionHistory({
      version: 4,
      entries: [{ dateKey: '2026-05-22', elapsedMs: 1 }],
    });
    expect(normalized).toBeNull();
  });

  describe('recordCompletion round-trip', () => {
    beforeEach(async () => {
      await clearCompletionHistory();
    });

    it('round-trips a passed gameType', async () => {
      await recordCompletion('2026-05-23', 30_000, 'binary');
      // load → normalize omits the default 'completed' outcome but keeps gameType.
      const { entries } = await loadCompletionHistory();
      expect(entries).toEqual([
        { dateKey: '2026-05-23', elapsedMs: 30_000, gameType: 'binary' },
      ]);
    });

    it('omits gameType when no argument is provided', async () => {
      await recordCompletion('2026-05-24', 30_000);
      const raw = await AsyncStorage.getItem(COMPLETION_HISTORY_STORAGE_KEY);
      expect(raw).not.toContain('gameType');
      const { entries } = await loadCompletionHistory();
      expect(entries[0]!.gameType).toBeUndefined();
    });
  });
});
