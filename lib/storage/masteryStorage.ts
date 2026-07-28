import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  MASTERY_STORAGE_KEY,
  MASTERY_STORAGE_VERSION,
} from '../../constants/config';
import {
  DEFAULT_MASTERY_STATE,
  defaultGameTypeMastery,
} from '../mastery/defaults';
import { S_MIN } from '../mastery/fsrsLite';
import type { GameTypeMastery, MasteryState } from '../mastery/types';
import { isDifficultyTier } from '../puzzles/difficulty/tiers';
import type { GameType } from '../puzzles/types';

const GAME_TYPES: GameType[] = [
  'sudoku',
  'binary',
  'nonogram',
  'slitherlink',
];

type PersistedMasteryPayload = MasteryState & {
  version: number;
};

function isNonNegInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isGameTypeMastery(value: unknown): value is GameTypeMastery {
  if (value == null || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.stabilityDays === 'number' &&
    Number.isFinite(row.stabilityDays) &&
    row.stabilityDays >= S_MIN &&
    isDifficultyTier(row.tier) &&
    (row.lastPracticedAtMs === null ||
      (typeof row.lastPracticedAtMs === 'number' &&
        Number.isFinite(row.lastPracticedAtMs))) &&
    (row.lastOutcome === null ||
      row.lastOutcome === 'completed' ||
      row.lastOutcome === 'abandoned') &&
    isNonNegInt(row.consecutiveUp) &&
    isNonNegInt(row.consecutiveDown)
  );
}

function coerceGameTypeMastery(row: GameTypeMastery): GameTypeMastery {
  return {
    stabilityDays: row.stabilityDays,
    tier: row.tier,
    lastPracticedAtMs: row.lastPracticedAtMs,
    lastOutcome: row.lastOutcome,
    consecutiveUp: Math.floor(row.consecutiveUp),
    consecutiveDown: Math.floor(row.consecutiveDown),
  };
}

function normalizePersistedMastery(raw: unknown): MasteryState {
  if (raw == null || typeof raw !== 'object') {
    return {
      byType: {
        sudoku: defaultGameTypeMastery(),
        binary: defaultGameTypeMastery(),
        nonogram: defaultGameTypeMastery(),
        slitherlink: defaultGameTypeMastery(),
      },
    };
  }

  const row = raw as Record<string, unknown>;
  const version = typeof row.version === 'number' ? row.version : 1;

  if (version > MASTERY_STORAGE_VERSION) {
    console.warn(
      '[masteryStorage] mastery version newer than app',
      version,
      '>',
      MASTERY_STORAGE_VERSION,
    );
    return {
      byType: {
        sudoku: defaultGameTypeMastery(),
        binary: defaultGameTypeMastery(),
        nonogram: defaultGameTypeMastery(),
        slitherlink: defaultGameTypeMastery(),
      },
    };
  }

  const byTypeRaw =
    row.byType != null && typeof row.byType === 'object'
      ? (row.byType as Record<string, unknown>)
      : null;

  if (byTypeRaw == null) {
    console.warn('[masteryStorage] invalid mastery payload');
    return {
      byType: {
        sudoku: defaultGameTypeMastery(),
        binary: defaultGameTypeMastery(),
        nonogram: defaultGameTypeMastery(),
        slitherlink: defaultGameTypeMastery(),
      },
    };
  }

  const byType = {} as Record<GameType, GameTypeMastery>;
  let repaired = false;
  for (const gameType of GAME_TYPES) {
    const candidate = byTypeRaw[gameType];
    if (isGameTypeMastery(candidate)) {
      byType[gameType] = coerceGameTypeMastery(candidate);
    } else {
      repaired = true;
      byType[gameType] = defaultGameTypeMastery();
    }
  }

  if (repaired) {
    console.warn('[masteryStorage] repaired invalid mastery type row(s)');
  }

  return { byType };
}

export async function loadMasteryState(): Promise<MasteryState> {
  try {
    const raw = await AsyncStorage.getItem(MASTERY_STORAGE_KEY);
    if (raw == null) {
      return {
        byType: {
          sudoku: defaultGameTypeMastery(),
          binary: defaultGameTypeMastery(),
          nonogram: defaultGameTypeMastery(),
          slitherlink: defaultGameTypeMastery(),
        },
      };
    }
    const parsed: unknown = JSON.parse(raw);
    return normalizePersistedMastery(parsed);
  } catch (error) {
    console.warn('[masteryStorage] failed to load mastery', error);
    return {
      byType: {
        sudoku: defaultGameTypeMastery(),
        binary: defaultGameTypeMastery(),
        nonogram: defaultGameTypeMastery(),
        slitherlink: defaultGameTypeMastery(),
      },
    };
  }
}

/** @returns false when persistence failed */
export async function saveMasteryState(state: MasteryState): Promise<boolean> {
  try {
    const payload: PersistedMasteryPayload = {
      ...state,
      version: MASTERY_STORAGE_VERSION,
    };
    await AsyncStorage.setItem(MASTERY_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.warn('[masteryStorage] failed to save mastery', error);
    return false;
  }
}

export async function clearMasteryState(): Promise<void> {
  await AsyncStorage.removeItem(MASTERY_STORAGE_KEY);
}

/** Exported for migration / unit tests. */
export { normalizePersistedMastery, DEFAULT_MASTERY_STATE };
