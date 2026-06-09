import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  REMINDER_STORAGE_KEY,
  REMINDER_STORAGE_VERSION,
} from '../../constants/config';
import {
  DEFAULT_REMINDER_STATE,
  type ReminderState,
} from '../reminder/types';
import { normalizeHourMinute, suggestedReminderTime } from '../reminder/suggestedReminderTime';

type PersistedReminderPayload = ReminderState & {
  version: number;
};

function isReminderState(value: unknown): value is ReminderState {
  if (value == null || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  const time = normalizeHourMinute(row.hour, row.minute);
  if (time == null) return false;

  const firstOpenHour =
    row.firstOpenHour === null
      ? null
      : typeof row.firstOpenHour === 'number' &&
          Number.isFinite(row.firstOpenHour) &&
          row.firstOpenHour >= 0 &&
          row.firstOpenHour <= 23
        ? Math.floor(row.firstOpenHour)
        : null;

  const sampledKey = row.firstOpenSampledForDateKey;
  if (
    sampledKey !== null &&
    (typeof sampledKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(sampledKey))
  ) {
    return false;
  }

  return (
    typeof row.enabled === 'boolean' &&
    typeof row.softAskDismissed === 'boolean' &&
    typeof row.permissionDenied === 'boolean'
  );
}

function normalizePersistedReminder(raw: unknown): ReminderState {
  if (raw == null || typeof raw !== 'object') {
    return { ...DEFAULT_REMINDER_STATE };
  }

  const row = raw as Record<string, unknown>;
  const version = typeof row.version === 'number' ? row.version : 1;

  if (version > REMINDER_STORAGE_VERSION) {
    console.warn(
      '[reminderStorage] reminder version newer than app',
      version,
      '>',
      REMINDER_STORAGE_VERSION,
    );
    return { ...DEFAULT_REMINDER_STATE };
  }

  if (!isReminderState(row)) {
    console.warn('[reminderStorage] invalid reminder payload');
    return { ...DEFAULT_REMINDER_STATE };
  }

  const time = normalizeHourMinute(row.hour, row.minute)!;
  return {
    enabled: row.enabled,
    hour: time.hour,
    minute: time.minute,
    softAskDismissed: row.softAskDismissed,
    permissionDenied: row.permissionDenied,
    firstOpenHour: row.firstOpenHour,
    firstOpenSampledForDateKey: row.firstOpenSampledForDateKey,
  };
}

export async function loadReminderState(): Promise<ReminderState> {
  try {
    const raw = await AsyncStorage.getItem(REMINDER_STORAGE_KEY);
    if (raw == null) return { ...DEFAULT_REMINDER_STATE };
    const parsed: unknown = JSON.parse(raw);
    return normalizePersistedReminder(parsed);
  } catch (error) {
    console.warn('[reminderStorage] failed to load reminder', error);
    return { ...DEFAULT_REMINDER_STATE };
  }
}

/** @returns false when persistence failed */
export async function saveReminderState(state: ReminderState): Promise<boolean> {
  const time = normalizeHourMinute(state.hour, state.minute);
  if (time == null) {
    console.warn('[reminderStorage] refused to save invalid time');
    return false;
  }

  try {
    const payload: PersistedReminderPayload = {
      ...state,
      hour: time.hour,
      minute: time.minute,
      version: REMINDER_STORAGE_VERSION,
    };
    await AsyncStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.warn('[reminderStorage] failed to save reminder', error);
    return false;
  }
}

export async function clearReminderState(): Promise<void> {
  await AsyncStorage.removeItem(REMINDER_STORAGE_KEY);
}

/** Record first-open hour once per dateKey (D-11). */
export async function recordFirstOpenSample(
  dateKey: string,
  localHour: number,
): Promise<ReminderState> {
  const current = await loadReminderState();
  if (current.firstOpenSampledForDateKey === dateKey) {
    return current;
  }

  const hour = Math.floor(localHour);
  if (hour < 0 || hour > 23) {
    return current;
  }

  const suggested = suggestedReminderTime(hour);
  const hasCustomTime =
    current.hour !== DEFAULT_REMINDER_STATE.hour ||
    current.minute !== DEFAULT_REMINDER_STATE.minute;

  const next: ReminderState = {
    ...current,
    firstOpenHour: current.firstOpenHour ?? hour,
    firstOpenSampledForDateKey: dateKey,
    hour: hasCustomTime ? current.hour : suggested.hour,
    minute: hasCustomTime ? current.minute : suggested.minute,
  };
  await saveReminderState(next);
  return next;
}

export async function markSoftAskDismissed(): Promise<ReminderState> {
  const current = await loadReminderState();
  if (current.softAskDismissed) return current;
  const next: ReminderState = { ...current, softAskDismissed: true };
  await saveReminderState(next);
  return next;
}
