import type { Locale } from '../i18n/types';
import type { DailyStatus } from '../puzzles/types';
import {
  loadReminderState,
  recordFirstOpenSample,
} from '../storage/reminderStorage';
import {
  resolvePermissionGranted,
  syncReminderSchedule,
} from './syncReminderSchedule';

export type RunReminderSyncParams = {
  todayKey: string;
  todayStatus: DailyStatus | 'loading';
  seed: number | null;
  locale: Locale;
  localHour: number;
};

/** Hydrate / complete / toggle / AppState active — idempotent pipeline. */
export async function runReminderSync(
  params: RunReminderSyncParams,
): Promise<void> {
  await recordFirstOpenSample(params.todayKey, params.localHour);
  const reminder = await loadReminderState();
  const permissionGranted = await resolvePermissionGranted();

  await syncReminderSchedule({
    enabled: reminder.enabled,
    hour: reminder.hour,
    minute: reminder.minute,
    permissionGranted,
    todayStatus: params.todayStatus,
    todayKey: params.todayKey,
    locale: params.locale,
    seed: params.seed,
  });
}

/** After user changes reminder prefs in ReminderSheet. */
export async function runReminderSyncWithState(
  params: RunReminderSyncParams & {
    enabled: boolean;
    hour: number;
    minute: number;
  },
): Promise<void> {
  const permissionGranted = await resolvePermissionGranted();
  await syncReminderSchedule({
    enabled: params.enabled,
    hour: params.hour,
    minute: params.minute,
    permissionGranted,
    todayStatus: params.todayStatus,
    todayKey: params.todayKey,
    locale: params.locale,
    seed: params.seed,
  });
}
