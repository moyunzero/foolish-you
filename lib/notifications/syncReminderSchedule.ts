import type { DailyStatus } from '../puzzles/types';
import type { Locale } from '../i18n/types';
import {
  cancelDailyReminder,
  getNotificationPermissionStatus,
  scheduleDailyReminder,
} from './reminderScheduler';
import { pickNotificationCopy } from './pickNotificationCopy';

export type SyncReminderScheduleInput = {
  enabled: boolean;
  hour: number;
  minute: number;
  permissionGranted: boolean;
  todayStatus: DailyStatus | 'loading';
  todayKey: string;
  locale: Locale;
  seed: number | null;
};

export type ReminderScheduleDeps = {
  cancelDailyReminder: typeof cancelDailyReminder;
  scheduleDailyReminder: typeof scheduleDailyReminder;
  getNotificationPermissionStatus: typeof getNotificationPermissionStatus;
};

const defaultDeps: ReminderScheduleDeps = {
  cancelDailyReminder,
  scheduleDailyReminder,
  getNotificationPermissionStatus,
};

/** Pure gate — streak is intentionally NOT checked (D-10). */
export function shouldScheduleDailyReminder(
  input: SyncReminderScheduleInput,
): boolean {
  if (!input.enabled) return false;
  if (!input.permissionGranted) return false;
  if (input.todayStatus === 'completed') return false;
  if (input.todayStatus !== 'playing' && input.todayStatus !== 'abandoned') {
    return false;
  }
  return true;
}

export async function syncReminderSchedule(
  input: SyncReminderScheduleInput,
  deps: ReminderScheduleDeps = defaultDeps,
): Promise<void> {
  if (input.todayStatus === 'completed' || !input.enabled) {
    await deps.cancelDailyReminder();
    return;
  }

  if (!shouldScheduleDailyReminder(input)) {
    await deps.cancelDailyReminder();
    return;
  }

  const { title, body } = pickNotificationCopy(
    input.todayKey,
    input.seed,
    input.locale,
  );
  await deps.scheduleDailyReminder(input.hour, input.minute, title, body);
}

export async function resolvePermissionGranted(): Promise<boolean> {
  const status = await getNotificationPermissionStatus();
  return status === 'granted';
}
