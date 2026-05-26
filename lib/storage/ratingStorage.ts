import AsyncStorage from '@react-native-async-storage/async-storage';

import { RATING_STORAGE_KEY, RATING_STORAGE_VERSION } from '../../constants/config';
import { DEFAULT_RATING_STATE, type RatingState } from '../rating/types';

type PersistedRatingPayload = RatingState & {
  version: number;
};

function isRatingState(value: unknown): value is RatingState {
  if (value == null || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return (
    (row.lastPromptAt === null ||
      (typeof row.lastPromptAt === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(row.lastPromptAt))) &&
    typeof row.completedCountAtLastPrompt === 'number' &&
    Number.isFinite(row.completedCountAtLastPrompt) &&
    row.completedCountAtLastPrompt >= 0 &&
    typeof row.hasRated === 'boolean' &&
    typeof row.completedCount === 'number' &&
    Number.isFinite(row.completedCount) &&
    row.completedCount >= 0
  );
}

function normalizePersistedRating(raw: unknown): RatingState {
  if (raw == null || typeof raw !== 'object') {
    return { ...DEFAULT_RATING_STATE };
  }

  const row = raw as Record<string, unknown>;
  const version = typeof row.version === 'number' ? row.version : 1;

  if (version > RATING_STORAGE_VERSION) {
    console.warn(
      '[ratingStorage] rating version newer than app',
      version,
      '>',
      RATING_STORAGE_VERSION,
    );
    return { ...DEFAULT_RATING_STATE };
  }

  if (!isRatingState(row)) {
    console.warn('[ratingStorage] invalid rating payload');
    return { ...DEFAULT_RATING_STATE };
  }

  return {
    lastPromptAt: row.lastPromptAt,
    completedCountAtLastPrompt: Math.floor(row.completedCountAtLastPrompt),
    hasRated: row.hasRated,
    completedCount: Math.floor(row.completedCount),
  };
}

export async function loadRatingState(): Promise<RatingState> {
  try {
    const raw = await AsyncStorage.getItem(RATING_STORAGE_KEY);
    if (raw == null) return { ...DEFAULT_RATING_STATE };
    const parsed: unknown = JSON.parse(raw);
    return normalizePersistedRating(parsed);
  } catch (error) {
    console.warn('[ratingStorage] failed to load rating', error);
    return { ...DEFAULT_RATING_STATE };
  }
}

/** @returns false when persistence failed */
export async function saveRatingState(state: RatingState): Promise<boolean> {
  try {
    const payload: PersistedRatingPayload = {
      ...state,
      version: RATING_STORAGE_VERSION,
    };
    await AsyncStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.warn('[ratingStorage] failed to save rating', error);
    return false;
  }
}

export async function clearRatingState(): Promise<void> {
  await AsyncStorage.removeItem(RATING_STORAGE_KEY);
}

export async function incrementRatingCompletedCount(): Promise<RatingState> {
  const current = await loadRatingState();
  const next: RatingState = {
    ...current,
    completedCount: current.completedCount + 1,
  };
  await saveRatingState(next);
  return next;
}

export async function recordRatingPromptAttempt(
  completedCount: number,
  promptDateKey: string,
): Promise<RatingState> {
  const current = await loadRatingState();
  const next: RatingState = {
    ...current,
    lastPromptAt: promptDateKey,
    completedCountAtLastPrompt: completedCount,
  };
  await saveRatingState(next);
  return next;
}
