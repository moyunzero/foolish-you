import AsyncStorage from '@react-native-async-storage/async-storage';

import { applyMasteryOutcome } from '../../../lib/mastery';
import { DEFAULT_MASTERY_STATE } from '../../../lib/mastery/defaults';
import {
  loadMasteryState,
  saveMasteryState,
} from '../../../lib/storage/masteryStorage';
import {
  appendPlayedHash,
  loadPlayedHashes,
} from '../../../lib/storage/playedHashStorage';
import type { GameType } from '../../../lib/puzzles/types';

const GAME_TYPE: GameType = 'sudoku';
const PUZZLE_HASH = 'complete-path-hash-abc';
const NOW_MS = 1_700_000_000_000;

describe('playedHashCompletePath (SC-2 / D-02)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('sequential mastery then append leaves both stores updated (SC-2)', async () => {
    const masteryNext = applyMasteryOutcome(DEFAULT_MASTERY_STATE, {
      gameType: GAME_TYPE,
      outcome: 'completed',
      elapsedMs: 60_000,
      nowMs: NOW_MS,
    });
    expect(await saveMasteryState(masteryNext)).toBe(true);
    expect(await appendPlayedHash(GAME_TYPE, PUZZLE_HASH)).toBe(true);

    const mastery = await loadMasteryState();
    expect(mastery.byType[GAME_TYPE].lastOutcome).toBe('completed');
    expect(mastery.byType[GAME_TYPE].lastPracticedAtMs).toBe(NOW_MS);

    const ring = (await loadPlayedHashes()).byType[GAME_TYPE];
    expect(ring.at(-1)).toBe(PUZZLE_HASH);
  });

  it('abandon-style mastery save without append leaves ring without puzzle hash (D-02)', async () => {
    const masteryNext = applyMasteryOutcome(DEFAULT_MASTERY_STATE, {
      gameType: GAME_TYPE,
      outcome: 'abandoned',
      elapsedMs: 10_000,
      nowMs: NOW_MS,
    });
    expect(await saveMasteryState(masteryNext)).toBe(true);

    const ring = (await loadPlayedHashes()).byType[GAME_TYPE];
    expect(ring).not.toContain(PUZZLE_HASH);
    expect(ring).toEqual([]);

    const mastery = await loadMasteryState();
    expect(mastery.byType[GAME_TYPE].lastOutcome).toBe('abandoned');
  });
});
