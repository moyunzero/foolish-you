jest.mock('../../../constants/dev', () => ({
  getDevForceGameType: () => null,
}));

jest.mock('../../../lib/platform/runAfterInteractions', () => ({
  runAfterInteractions: <T,>(fn: () => T | Promise<T>) => Promise.resolve(fn()),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

import { hydrateDailyGame } from '../../../lib/daily/dailyHydrate';
import { applyMasteryOutcome } from '../../../lib/mastery';
import { defaultGameTypeMastery } from '../../../lib/mastery/defaults';
import {
  loadMasteryState,
  saveMasteryState,
} from '../../../lib/storage/masteryStorage';
import { appendPlayedHash } from '../../../lib/storage/playedHashStorage';

/** Fixed dateKey — freeze assertion must not depend on wall clock. */
const DATE_KEY = '2026-07-15';

describe('freezeMastery (MAST-04)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('keeps puzzleHash after heavy mastery mutate + same-day rehydrate', async () => {
    const created = await hydrateDailyGame({ today: DATE_KEY });
    const hashH = created.puzzleHash;
    const { gameType } = created;
    expect(hashH.length).toBeGreaterThan(0);

    let mastery = await loadMasteryState();
    const baseNow = 1_700_000_000_000;
    for (let i = 0; i < 8; i += 1) {
      mastery = applyMasteryOutcome(mastery, {
        gameType,
        outcome: 'abandoned',
        elapsedMs: 1,
        nowMs: baseNow + i * 86_400_000,
      });
    }
    expect(await saveMasteryState(mastery)).toBe(true);

    const mutated = (await loadMasteryState()).byType[gameType];
    expect(mutated.lastOutcome).toBe('abandoned');
    expect(mutated.lastPracticedAtMs).not.toBeNull();
    expect(mutated.stabilityDays).not.toBe(defaultGameTypeMastery().stabilityDays);

    const rehydrated = await hydrateDailyGame({ today: DATE_KEY });
    expect(rehydrated.dateKey).toBe(DATE_KEY);
    expect(rehydrated.puzzleHash).toBe(hashH);
  });

  it('keeps puzzleHash after appendPlayedHash of unrelated hash + same-day rehydrate', async () => {
    const created = await hydrateDailyGame({ today: DATE_KEY });
    const hashH = created.puzzleHash;
    const { gameType } = created;
    expect(hashH.length).toBeGreaterThan(0);

    expect(await appendPlayedHash(gameType, 'fake-other-hash')).toBe(true);

    const rehydrated = await hydrateDailyGame({ today: DATE_KEY });
    expect(rehydrated.dateKey).toBe(DATE_KEY);
    expect(rehydrated.puzzleHash).toBe(hashH);
  });
});
