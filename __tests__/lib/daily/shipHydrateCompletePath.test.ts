jest.mock('../../../constants/dev', () => ({
  getDevForceGameType: () => null,
}));

jest.mock('../../../lib/platform/runAfterInteractions', () => ({
  runAfterInteractions: <T,>(fn: () => T | Promise<T>) => Promise.resolve(fn()),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

import { buildNewDailySnapshot } from '../../../lib/daily/dailyHydrate';
import { applyMasteryOutcome } from '../../../lib/mastery';
import {
  DEFAULT_MASTERY_STATE,
  defaultGameTypeMastery,
} from '../../../lib/mastery/defaults';
import {
  loadMasteryState,
  saveMasteryState,
} from '../../../lib/storage/masteryStorage';
import {
  appendPlayedHash,
  loadPlayedHashes,
  savePlayedHashes,
} from '../../../lib/storage/playedHashStorage';
import type { GameType } from '../../../lib/puzzles/types';

/** Fixed dateKey — ship path must not depend on wall clock. */
const DATE_KEY = '2026-08-01';
const FORCE_TYPE: GameType = 'sudoku';
const AVOID_SEED_HASH = 'ship-d09-avoid-seed-hash';
const SEED_NOW_MS = 1_700_000_000_000;

describe('shipHydrateCompletePath (SHIP-02 / D-09)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('hydrate create with mastery+avoid then complete appends puzzleHash', async () => {
    const seededMastery = {
      byType: {
        ...DEFAULT_MASTERY_STATE.byType,
        [FORCE_TYPE]: {
          ...defaultGameTypeMastery(),
          stabilityDays: 8,
          tier: 'medium' as const,
          lastPracticedAtMs: SEED_NOW_MS - 86_400_000,
          lastOutcome: 'abandoned' as const,
          consecutiveUp: 1,
          consecutiveDown: 0,
        },
      },
    };
    expect(await saveMasteryState(seededMastery)).toBe(true);
    expect(
      await savePlayedHashes({
        byType: {
          sudoku: [AVOID_SEED_HASH],
          binary: [],
          nonogram: [],
          slitherlink: [],
        },
      }),
    ).toBe(true);

    const snap = await buildNewDailySnapshot({
      today: DATE_KEY,
      previous: null,
      forceGameType: FORCE_TYPE,
    });

    expect(snap.status).toBe('playing');
    expect(snap.gameType).toBe(FORCE_TYPE);
    expect(snap.puzzleHash.length).toBeGreaterThan(0);
    expect(snap.puzzleHash).not.toBe(AVOID_SEED_HASH);

    const finishedAt = SEED_NOW_MS + 60_000;
    expect(
      await saveMasteryState(
        applyMasteryOutcome(await loadMasteryState(), {
          gameType: snap.gameType,
          outcome: 'completed',
          elapsedMs: 60_000,
          nowMs: finishedAt,
        }),
      ),
    ).toBe(true);
    expect(await appendPlayedHash(snap.gameType, snap.puzzleHash)).toBe(true);

    const mastery = await loadMasteryState();
    expect(mastery.byType[snap.gameType].lastOutcome).toBe('completed');
    expect(mastery.byType[snap.gameType].lastPracticedAtMs).toBe(finishedAt);

    const ring = (await loadPlayedHashes()).byType[snap.gameType];
    expect(ring.at(-1)).toBe(snap.puzzleHash);
    expect(ring).toContain(AVOID_SEED_HASH);
  });
});
