import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  MASTERY_STORAGE_KEY,
  MASTERY_STORAGE_VERSION,
  PLAYED_HASH_RING_CAPACITY,
  PLAYED_HASH_STORAGE_KEY,
  PLAYED_HASH_STORAGE_VERSION,
  STORAGE_VERSION,
} from '../../../constants/config';
import {
  appendPlayedHash,
  clearPlayedHashes,
  loadPlayedHashes,
  normalizePersistedPlayedHashes,
  savePlayedHashes,
  type PlayedHashesState,
} from '../../../lib/storage/playedHashStorage';

const EMPTY: PlayedHashesState = {
  byType: {
    sudoku: [],
    binary: [],
    nonogram: [],
    slitherlink: [],
  },
};

describe('playedHashStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns empty rings when key is missing', async () => {
    expect(await loadPlayedHashes()).toEqual(EMPTY);
  });

  it('round-trips save/load and writes PLAYED_HASH_STORAGE_VERSION', async () => {
    const state: PlayedHashesState = {
      byType: {
        sudoku: ['h1', 'h2'],
        binary: ['b1'],
        nonogram: [],
        slitherlink: ['s1'],
      },
    };
    expect(await savePlayedHashes(state)).toBe(true);
    expect(await loadPlayedHashes()).toEqual(state);

    const raw = await AsyncStorage.getItem(PLAYED_HASH_STORAGE_KEY);
    expect(raw).toContain(`"version":${PLAYED_HASH_STORAGE_VERSION}`);
  });

  it('returns empty rings when version is newer than app', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await AsyncStorage.setItem(
      PLAYED_HASH_STORAGE_KEY,
      JSON.stringify({
        version: PLAYED_HASH_STORAGE_VERSION + 1,
        byType: {
          sudoku: ['keep'],
          binary: [],
          nonogram: [],
          slitherlink: [],
        },
      }),
    );
    expect(await loadPlayedHashes()).toEqual(EMPTY);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('returns empty rings on invalid JSON without mutating mastery key', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await AsyncStorage.setItem(
      MASTERY_STORAGE_KEY,
      JSON.stringify({ version: 1, byType: {} }),
    );
    await AsyncStorage.setItem(PLAYED_HASH_STORAGE_KEY, '{not-json');
    expect(await loadPlayedHashes()).toEqual(EMPTY);
    expect(await AsyncStorage.getItem(MASTERY_STORAGE_KEY)).toContain(
      '"version":1',
    );
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('returns empty rings for non-object payload', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await AsyncStorage.setItem(PLAYED_HASH_STORAGE_KEY, JSON.stringify([1, 2]));
    expect(await loadPlayedHashes()).toEqual(EMPTY);
    expect(
      normalizePersistedPlayedHashes([1, 2]),
    ).toEqual(EMPTY);
    warn.mockRestore();
  });

  it('appends FIFO and drops oldest beyond capacity 200', async () => {
    const first = 'hash-0';
    await appendPlayedHash('sudoku', first);
    for (let i = 1; i < PLAYED_HASH_RING_CAPACITY; i += 1) {
      await appendPlayedHash('sudoku', `hash-${i}`);
    }
    expect((await loadPlayedHashes()).byType.sudoku).toHaveLength(
      PLAYED_HASH_RING_CAPACITY,
    );

    await appendPlayedHash('sudoku', 'hash-new');
    const ring = (await loadPlayedHashes()).byType.sudoku;
    expect(ring).toHaveLength(PLAYED_HASH_RING_CAPACITY);
    expect(ring[0]).toBe('hash-1');
    expect(ring[ring.length - 1]).toBe('hash-new');
    expect(ring).not.toContain(first);
  });

  it('no-ops append when last entry equals new hash', async () => {
    await appendPlayedHash('binary', 'same');
    await appendPlayedHash('binary', 'same');
    expect((await loadPlayedHashes()).byType.binary).toEqual(['same']);
  });

  it('coerces away non-string hash entries on normalize', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const normalized = normalizePersistedPlayedHashes({
      version: 1,
      byType: {
        sudoku: ['ok', 42, null, 'keep', { x: 1 }],
        binary: 'not-array',
        nonogram: ['n1'],
        slitherlink: undefined,
      },
    });
    expect(normalized.byType.sudoku).toEqual(['ok', 'keep']);
    expect(normalized.byType.binary).toEqual([]);
    expect(normalized.byType.nonogram).toEqual(['n1']);
    expect(normalized.byType.slitherlink).toEqual([]);
    warn.mockRestore();
  });

  it('clears played-hash key only', async () => {
    await savePlayedHashes({
      byType: {
        sudoku: ['x'],
        binary: [],
        nonogram: [],
        slitherlink: [],
      },
    });
    await AsyncStorage.setItem(
      MASTERY_STORAGE_KEY,
      JSON.stringify({ version: 1, byType: {} }),
    );
    await clearPlayedHashes();
    expect(await AsyncStorage.getItem(PLAYED_HASH_STORAGE_KEY)).toBeNull();
    expect(await loadPlayedHashes()).toEqual(EMPTY);
    expect(await AsyncStorage.getItem(MASTERY_STORAGE_KEY)).not.toBeNull();
  });

  it('does not change STORAGE_VERSION or MASTERY_STORAGE_VERSION', () => {
    expect(STORAGE_VERSION).toBe(2);
    expect(MASTERY_STORAGE_VERSION).toBe(1);
    expect(PLAYED_HASH_STORAGE_KEY).toBe('@foolish-you/played-hash-v1');
    expect(PLAYED_HASH_STORAGE_VERSION).toBe(1);
    expect(PLAYED_HASH_RING_CAPACITY).toBe(200);
  });
});
