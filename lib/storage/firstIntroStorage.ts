import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  FIRST_INTRO_STORAGE_KEY,
  FIRST_INTRO_STORAGE_VERSION,
} from '../../constants/config';
import type { GameType } from '../puzzles/types';

export type FirstIntroState = {
  seenByType: Record<GameType, boolean>;
};

type PersistedFirstIntroPayload = FirstIntroState & {
  version: number;
};

const GAME_TYPES: GameType[] = [
  'sudoku',
  'binary',
  'nonogram',
  'slitherlink',
];

export const DEFAULT_FIRST_INTRO_STATE: FirstIntroState = {
  seenByType: {
    sudoku: false,
    binary: false,
    nonogram: false,
    slitherlink: false,
  },
};

function emptySeen(): Record<GameType, boolean> {
  return { ...DEFAULT_FIRST_INTRO_STATE.seenByType };
}

export function normalizePersistedFirstIntro(raw: unknown): FirstIntroState {
  if (raw == null || typeof raw !== 'object') {
    return { seenByType: emptySeen() };
  }

  const row = raw as Record<string, unknown>;
  const version = typeof row.version === 'number' ? row.version : 1;

  if (version > FIRST_INTRO_STORAGE_VERSION) {
    console.warn(
      '[firstIntroStorage] version newer than app',
      version,
      '>',
      FIRST_INTRO_STORAGE_VERSION,
    );
    return { seenByType: emptySeen() };
  }

  const seenRaw = row.seenByType;
  const seenByType = emptySeen();
  if (seenRaw != null && typeof seenRaw === 'object') {
    const map = seenRaw as Record<string, unknown>;
    for (const gameType of GAME_TYPES) {
      seenByType[gameType] = map[gameType] === true;
    }
  }

  return { seenByType };
}

export async function loadFirstIntroState(): Promise<FirstIntroState> {
  try {
    const raw = await AsyncStorage.getItem(FIRST_INTRO_STORAGE_KEY);
    if (raw == null) return { seenByType: emptySeen() };
    const parsed: unknown = JSON.parse(raw);
    return normalizePersistedFirstIntro(parsed);
  } catch (error) {
    console.warn('[firstIntroStorage] failed to load', error);
    return { seenByType: emptySeen() };
  }
}

/** @returns false when persistence failed */
export async function saveFirstIntroState(
  state: FirstIntroState,
): Promise<boolean> {
  try {
    const payload: PersistedFirstIntroPayload = {
      ...state,
      version: FIRST_INTRO_STORAGE_VERSION,
    };
    await AsyncStorage.setItem(
      FIRST_INTRO_STORAGE_KEY,
      JSON.stringify(payload),
    );
    return true;
  } catch (error) {
    console.warn('[firstIntroStorage] failed to save', error);
    return false;
  }
}

export async function clearFirstIntroState(): Promise<void> {
  await AsyncStorage.removeItem(FIRST_INTRO_STORAGE_KEY);
}

export async function markFirstIntroSeen(
  gameType: GameType,
): Promise<FirstIntroState> {
  const current = await loadFirstIntroState();
  const next: FirstIntroState = {
    seenByType: { ...current.seenByType, [gameType]: true },
  };
  await saveFirstIntroState(next);
  return next;
}
