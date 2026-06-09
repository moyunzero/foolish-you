import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  REMINDER_STORAGE_KEY,
  REMINDER_STORAGE_VERSION,
} from '../../../constants/config';
import {
  clearReminderState,
  loadReminderState,
  markSoftAskDismissed,
  recordFirstOpenSample,
  saveReminderState,
} from '../../../lib/storage/reminderStorage';
import { DEFAULT_REMINDER_STATE } from '../../../lib/reminder/types';

describe('reminderStorage', () => {
  beforeEach(async () => {
    await clearReminderState();
  });

  it('returns defaults when empty', async () => {
    await expect(loadReminderState()).resolves.toEqual(DEFAULT_REMINDER_STATE);
  });

  it('round-trips reminder state with version metadata', async () => {
    const state = {
      ...DEFAULT_REMINDER_STATE,
      enabled: true,
      hour: 20,
      minute: 30,
      firstOpenHour: 8,
      firstOpenSampledForDateKey: '2026-06-08',
    };
    await expect(saveReminderState(state)).resolves.toBe(true);
    await expect(loadReminderState()).resolves.toEqual(state);
    const raw = await AsyncStorage.getItem(REMINDER_STORAGE_KEY);
    expect(raw).toContain(`"version":${REMINDER_STORAGE_VERSION}`);
    expect(raw).toContain('"enabled":true');
  });

  it('records first-open sample once per dateKey and suggests hour+30', async () => {
    const first = await recordFirstOpenSample('2026-06-08', 8);
    expect(first.firstOpenHour).toBe(8);
    expect(first.firstOpenSampledForDateKey).toBe('2026-06-08');
    expect(first.hour).toBe(8);
    expect(first.minute).toBe(30);

    const second = await recordFirstOpenSample('2026-06-08', 14);
    expect(second.firstOpenHour).toBe(8);
    expect(second.hour).toBe(8);
    expect(second.minute).toBe(30);
  });

  it('markSoftAskDismissed is idempotent', async () => {
    const once = await markSoftAskDismissed();
    expect(once.softAskDismissed).toBe(true);
    const twice = await markSoftAskDismissed();
    expect(twice.softAskDismissed).toBe(true);
  });

  it('rejects invalid time on save', async () => {
    await expect(
      saveReminderState({ ...DEFAULT_REMINDER_STATE, hour: 99, minute: 0 }),
    ).resolves.toBe(false);
  });
});
