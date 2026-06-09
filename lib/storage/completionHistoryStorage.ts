import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  COMPLETION_HISTORY_MAX_ENTRIES,
  COMPLETION_HISTORY_STORAGE_KEY,
  COMPLETION_HISTORY_STORAGE_VERSION,
} from '../../constants/config';
import { mergeBackfillFromStreak } from './backfillCompletionHistory';
import { loadStreakState } from './streakStorage';

export type CompletionOutcome = 'completed' | 'abandoned';

export type CompletionEntry = {
  dateKey: string;
  elapsedMs: number;
  /** Upgrade backfill from streak; excluded from elapsed comparisons. */
  inferred?: boolean;
  /** Defaults to completed when absent (legacy v1 entries). */
  outcome?: CompletionOutcome;
};

export type CompletionHistoryState = {
  entries: CompletionEntry[];
};

type PersistedCompletionHistory = CompletionHistoryState & {
  version: number;
};

function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeOutcome(value: unknown): CompletionOutcome {
  return value === 'abandoned' ? 'abandoned' : 'completed';
}

function normalizeCompletionHistory(raw: unknown): CompletionHistoryState | null {
  if (raw == null || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const version =
    typeof row.version === 'number' ? row.version : COMPLETION_HISTORY_STORAGE_VERSION;

  if (version > COMPLETION_HISTORY_STORAGE_VERSION) {
    console.warn(
      '[completionHistory] version newer than app',
      version,
      '>',
      COMPLETION_HISTORY_STORAGE_VERSION,
    );
    return null;
  }

  if (!Array.isArray(row.entries)) return { entries: [] };

  const entries: CompletionEntry[] = [];
  for (const item of row.entries) {
    if (item == null || typeof item !== 'object') continue;
    const entry = item as Record<string, unknown>;
    if (!isDateKey(entry.dateKey)) continue;
    const elapsedMs =
      typeof entry.elapsedMs === 'number' && Number.isFinite(entry.elapsedMs)
        ? Math.max(0, Math.floor(entry.elapsedMs))
        : 0;
    const inferred = entry.inferred === true;
    const outcome = normalizeOutcome(entry.outcome);
    entries.push({
      dateKey: entry.dateKey,
      elapsedMs,
      ...(inferred ? { inferred: true } : {}),
      ...(outcome === 'abandoned' ? { outcome: 'abandoned' as const } : {}),
    });
  }

  entries.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  return { entries };
}

async function readCompletionHistoryFromStorage(): Promise<CompletionHistoryState> {
  try {
    const raw = await AsyncStorage.getItem(COMPLETION_HISTORY_STORAGE_KEY);
    const parsed: unknown = raw == null ? null : JSON.parse(raw);
    return normalizeCompletionHistory(parsed) ?? { entries: [] };
  } catch (error) {
    console.warn('[completionHistory] failed to read', error);
    return { entries: [] };
  }
}

export async function loadCompletionHistory(): Promise<CompletionHistoryState> {
  const base = await readCompletionHistoryFromStorage();
  const streak = await loadStreakState();
  const { state: merged, added } = mergeBackfillFromStreak(base, streak);
  if (added > 0) {
    await saveCompletionHistory(merged);
    return merged;
  }
  return base;
}

export async function saveCompletionHistory(
  state: CompletionHistoryState,
): Promise<boolean> {
  try {
    const payload: PersistedCompletionHistory = {
      entries: state.entries.slice(-COMPLETION_HISTORY_MAX_ENTRIES),
      version: COMPLETION_HISTORY_STORAGE_VERSION,
    };
    await AsyncStorage.setItem(
      COMPLETION_HISTORY_STORAGE_KEY,
      JSON.stringify(payload),
    );
    return true;
  } catch (error) {
    console.warn('[completionHistory] failed to save', error);
    return false;
  }
}

/** 通关日写入/更新（同 dateKey 覆盖 elapsed） */
export async function recordCompletion(
  dateKey: string,
  elapsedMs: number,
): Promise<void> {
  const current = await readCompletionHistoryFromStorage();
  const without = current.entries.filter((e) => e.dateKey !== dateKey);
  const next: CompletionHistoryState = {
    entries: [...without, { dateKey, elapsedMs: Math.max(0, elapsedMs), outcome: 'completed' }],
  };
  await saveCompletionHistory(next);
}

/** 认怂日写入/更新（同 dateKey 覆盖 elapsed） */
export async function recordAbandon(
  dateKey: string,
  elapsedMs: number,
): Promise<void> {
  const current = await readCompletionHistoryFromStorage();
  const without = current.entries.filter((e) => e.dateKey !== dateKey);
  const next: CompletionHistoryState = {
    entries: [
      ...without,
      { dateKey, elapsedMs: Math.max(0, elapsedMs), outcome: 'abandoned' },
    ],
  };
  await saveCompletionHistory(next);
}

export async function clearCompletionHistory(): Promise<void> {
  await AsyncStorage.removeItem(COMPLETION_HISTORY_STORAGE_KEY);
}

export { normalizeCompletionHistory };
