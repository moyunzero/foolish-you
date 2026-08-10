import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  FIRST_INTRO_STORAGE_KEY,
  FIRST_INTRO_STORAGE_VERSION,
  STORAGE_VERSION,
} from '../../../constants/config';
import {
  clearFirstIntroState,
  loadFirstIntroState,
  markFirstIntroSeen,
  saveFirstIntroState,
  type FirstIntroState,
} from '../../../lib/storage/firstIntroStorage';

const EMPTY: FirstIntroState = {
  seenByType: {
    sudoku: false,
    binary: false,
    nonogram: false,
    slitherlink: false,
  },
};

describe('firstIntroStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns empty seen when key is missing', async () => {
    expect(await loadFirstIntroState()).toEqual(EMPTY);
  });

  it('markSeen round-trips per gameType and stamps version', async () => {
    expect(await markFirstIntroSeen('sudoku')).toMatchObject({
      seenByType: { ...EMPTY.seenByType, sudoku: true },
    });
    expect(await loadFirstIntroState().then((s) => s.seenByType.sudoku)).toBe(
      true,
    );
    expect(await loadFirstIntroState().then((s) => s.seenByType.binary)).toBe(
      false,
    );

    const raw = await AsyncStorage.getItem(FIRST_INTRO_STORAGE_KEY);
    expect(raw).toContain(`"version":${FIRST_INTRO_STORAGE_VERSION}`);
  });

  it('returns empty seen when version is newer than app', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await AsyncStorage.setItem(
      FIRST_INTRO_STORAGE_KEY,
      JSON.stringify({
        version: FIRST_INTRO_STORAGE_VERSION + 1,
        seenByType: { sudoku: true },
      }),
    );
    expect(await loadFirstIntroState()).toEqual(EMPTY);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('returns empty seen on corrupt JSON', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await AsyncStorage.setItem(FIRST_INTRO_STORAGE_KEY, '{not-json');
    expect(await loadFirstIntroState()).toEqual(EMPTY);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('save/load round-trip', async () => {
    const state: FirstIntroState = {
      seenByType: {
        sudoku: true,
        binary: true,
        nonogram: false,
        slitherlink: false,
      },
    };
    expect(await saveFirstIntroState(state)).toBe(true);
    expect(await loadFirstIntroState()).toEqual(state);
  });

  it('does not change daily STORAGE_VERSION', () => {
    expect(STORAGE_VERSION).toBe(3);
    expect(FIRST_INTRO_STORAGE_KEY).toBe('@foolish-you/first-intro-v1');
    expect(FIRST_INTRO_STORAGE_VERSION).toBe(1);
  });

  it('clearFirstIntroState removes key', async () => {
    await markFirstIntroSeen('binary');
    await clearFirstIntroState();
    expect(await AsyncStorage.getItem(FIRST_INTRO_STORAGE_KEY)).toBeNull();
    expect(await loadFirstIntroState()).toEqual(EMPTY);
  });
});
