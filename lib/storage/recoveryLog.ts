import AsyncStorage from '@react-native-async-storage/async-storage';

import { RECOVERY_LOG_STORAGE_KEY, RECOVERY_LOG_MAX_ENTRIES } from '../../constants/config';

export type RecoveryLogKind =
  | 'structural'
  | 'play_state_contradiction'
  | 'puzzle_repaired';

export type RecoveryLogEntry = {
  at: number;
  kind: RecoveryLogKind;
  dateKey?: string;
  detail?: string;
};

type PersistedRecoveryLog = {
  entries: RecoveryLogEntry[];
};

export async function loadRecoveryLog(): Promise<RecoveryLogEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(RECOVERY_LOG_STORAGE_KEY);
    if (raw == null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (parsed == null || typeof parsed !== 'object') return [];
    const row = parsed as PersistedRecoveryLog;
    if (!Array.isArray(row.entries)) return [];
    return row.entries.slice(-RECOVERY_LOG_MAX_ENTRIES);
  } catch {
    return [];
  }
}

export async function appendRecoveryLog(
  entry: Omit<RecoveryLogEntry, 'at'> & { at?: number },
): Promise<void> {
  try {
    const existing = await loadRecoveryLog();
    const next: RecoveryLogEntry = {
      at: entry.at ?? Date.now(),
      kind: entry.kind,
      ...(entry.dateKey != null ? { dateKey: entry.dateKey } : {}),
      ...(entry.detail != null ? { detail: entry.detail } : {}),
    };
    const entries = [...existing, next].slice(-RECOVERY_LOG_MAX_ENTRIES);
    await AsyncStorage.setItem(
      RECOVERY_LOG_STORAGE_KEY,
      JSON.stringify({ entries } satisfies PersistedRecoveryLog),
    );
  } catch (error) {
    if (__DEV__) {
      console.warn('[recoveryLog] failed to append', error);
    }
  }
}

export async function clearRecoveryLog(): Promise<void> {
  await AsyncStorage.removeItem(RECOVERY_LOG_STORAGE_KEY);
}
