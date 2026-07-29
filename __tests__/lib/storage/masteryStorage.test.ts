import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  MASTERY_STORAGE_KEY,
  MASTERY_STORAGE_VERSION,
  STORAGE_VERSION,
} from '../../../constants/config';
import { DEFAULT_MASTERY_STATE, defaultGameTypeMastery } from '../../../lib/mastery/defaults';
import {
  clearMasteryState,
  loadMasteryState,
  saveMasteryState,
} from '../../../lib/storage/masteryStorage';

describe('masteryStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns DEFAULT when missing', async () => {
    expect(await loadMasteryState()).toEqual(DEFAULT_MASTERY_STATE);
  });

  it('persists and reloads byType fields with current version', async () => {
    const state = {
      byType: {
        ...DEFAULT_MASTERY_STATE.byType,
        sudoku: {
          ...defaultGameTypeMastery(),
          tier: 'medium' as const,
          stabilityDays: 4,
          consecutiveUp: 1,
          lastPracticedAtMs: 1_700_000_000_000,
          lastOutcome: 'completed' as const,
        },
      },
    };
    expect(await saveMasteryState(state)).toBe(true);
    expect(await loadMasteryState()).toEqual(state);

    const raw = await AsyncStorage.getItem(MASTERY_STORAGE_KEY);
    expect(raw).toContain(`"version":${MASTERY_STORAGE_VERSION}`);
  });

  it('returns DEFAULT when version is newer than app', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await AsyncStorage.setItem(
      MASTERY_STORAGE_KEY,
      JSON.stringify({
        version: MASTERY_STORAGE_VERSION + 1,
        byType: DEFAULT_MASTERY_STATE.byType,
      }),
    );
    expect(await loadMasteryState()).toEqual(DEFAULT_MASTERY_STATE);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('returns DEFAULT on invalid JSON', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await AsyncStorage.setItem(MASTERY_STORAGE_KEY, '{not-json');
    expect(await loadMasteryState()).toEqual(DEFAULT_MASTERY_STATE);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('repairs invalid type rows to default while keeping valid siblings', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await AsyncStorage.setItem(
      MASTERY_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        byType: {
          sudoku: {
            stabilityDays: 3,
            tier: 'hard',
            lastPracticedAtMs: null,
            lastOutcome: null,
            consecutiveUp: 0,
            consecutiveDown: 0,
          },
          binary: { tier: 'nightmare', stabilityDays: -1 },
          nonogram: defaultGameTypeMastery(),
          slitherlink: defaultGameTypeMastery(),
        },
      }),
    );
    const loaded = await loadMasteryState();
    expect(loaded.byType.sudoku.tier).toBe('hard');
    expect(loaded.byType.sudoku.stabilityDays).toBe(3);
    expect(loaded.byType.binary).toEqual(defaultGameTypeMastery());
    warn.mockRestore();
  });

  it('clears storage', async () => {
    await saveMasteryState(DEFAULT_MASTERY_STATE);
    await clearMasteryState();
    expect(await AsyncStorage.getItem(MASTERY_STORAGE_KEY)).toBeNull();
    expect(await loadMasteryState()).toEqual(DEFAULT_MASTERY_STATE);
  });

  it('does not change daily STORAGE_VERSION constant', () => {
    expect(STORAGE_VERSION).toBe(2);
    expect(MASTERY_STORAGE_KEY).toBe('@foolish-you/mastery-v1');
    expect(MASTERY_STORAGE_VERSION).toBe(1);
  });
});
