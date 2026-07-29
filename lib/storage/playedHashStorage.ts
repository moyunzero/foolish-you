import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  PLAYED_HASH_RING_CAPACITY,
  PLAYED_HASH_STORAGE_KEY,
  PLAYED_HASH_STORAGE_VERSION,
} from '../../constants/config';
import type { GameType } from '../puzzles/types';

const GAME_TYPES: GameType[] = [
  'sudoku',
  'binary',
  'nonogram',
  'slitherlink',
];

export type PlayedHashesState = {
  /** FIFO oldest → newest; max PLAYED_HASH_RING_CAPACITY per type. */
  byType: Record<GameType, string[]>;
};

type PersistedPlayedHashesPayload = PlayedHashesState & {
  version: number;
};

function emptyPlayedHashes(): PlayedHashesState {
  return {
    byType: {
      sudoku: [],
      binary: [],
      nonogram: [],
      slitherlink: [],
    },
  };
}

function coerceHashRing(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const hashes: string[] = [];
  for (const item of raw) {
    if (typeof item === 'string') {
      hashes.push(item);
    }
  }
  return hashes.slice(-PLAYED_HASH_RING_CAPACITY);
}

function normalizePersistedPlayedHashes(raw: unknown): PlayedHashesState {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return emptyPlayedHashes();
  }

  const row = raw as Record<string, unknown>;
  const version = typeof row.version === 'number' ? row.version : 1;

  if (version > PLAYED_HASH_STORAGE_VERSION) {
    console.warn(
      '[playedHashStorage] played-hash version newer than app',
      version,
      '>',
      PLAYED_HASH_STORAGE_VERSION,
    );
    return emptyPlayedHashes();
  }

  const byTypeRaw =
    row.byType != null && typeof row.byType === 'object' && !Array.isArray(row.byType)
      ? (row.byType as Record<string, unknown>)
      : null;

  if (byTypeRaw == null) {
    console.warn('[playedHashStorage] invalid played-hash payload');
    return emptyPlayedHashes();
  }

  const byType = {} as Record<GameType, string[]>;
  for (const gameType of GAME_TYPES) {
    byType[gameType] = coerceHashRing(byTypeRaw[gameType]);
  }

  return { byType };
}

export async function loadPlayedHashes(): Promise<PlayedHashesState> {
  try {
    const raw = await AsyncStorage.getItem(PLAYED_HASH_STORAGE_KEY);
    if (raw == null) {
      return emptyPlayedHashes();
    }
    const parsed: unknown = JSON.parse(raw);
    return normalizePersistedPlayedHashes(parsed);
  } catch (error) {
    console.warn('[playedHashStorage] failed to load', error);
    return emptyPlayedHashes();
  }
}

/** @returns false when persistence failed */
export async function savePlayedHashes(
  state: PlayedHashesState,
): Promise<boolean> {
  try {
    const byType = {} as Record<GameType, string[]>;
    for (const gameType of GAME_TYPES) {
      byType[gameType] = coerceHashRing(state.byType[gameType]);
    }
    const payload: PersistedPlayedHashesPayload = {
      byType,
      version: PLAYED_HASH_STORAGE_VERSION,
    };
    await AsyncStorage.setItem(
      PLAYED_HASH_STORAGE_KEY,
      JSON.stringify(payload),
    );
    return true;
  } catch (error) {
    console.warn('[playedHashStorage] failed to save', error);
    return false;
  }
}

/**
 * Append a completed puzzle hash to the per-type FIFO ring.
 * No-op (still success) when the newest entry already equals `puzzleHash`.
 */
export async function appendPlayedHash(
  gameType: GameType,
  puzzleHash: string,
): Promise<boolean> {
  const state = await loadPlayedHashes();
  const prev = state.byType[gameType];
  if (prev.at(-1) === puzzleHash) {
    return true;
  }
  const next = [...prev, puzzleHash].slice(-PLAYED_HASH_RING_CAPACITY);
  return savePlayedHashes({
    byType: { ...state.byType, [gameType]: next },
  });
}

export async function clearPlayedHashes(): Promise<void> {
  await AsyncStorage.removeItem(PLAYED_HASH_STORAGE_KEY);
}

/** Exported for migration / unit tests. */
export { normalizePersistedPlayedHashes, emptyPlayedHashes };
