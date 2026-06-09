jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import {
  shouldScheduleDailyReminder,
  syncReminderSchedule,
  type ReminderScheduleDeps,
} from '../../../lib/notifications/syncReminderSchedule';

const baseInput = {
  enabled: true,
  hour: 9,
  minute: 0,
  permissionGranted: true,
  todayKey: '2026-06-08',
  locale: 'en' as const,
  seed: 42,
};

function makeDeps(): ReminderScheduleDeps & {
  cancel: jest.Mock;
  schedule: jest.Mock;
} {
  const cancel = jest.fn().mockResolvedValue(undefined);
  const schedule = jest.fn().mockResolvedValue(undefined);
  return {
    cancel,
    schedule,
    cancelDailyReminder: cancel,
    scheduleDailyReminder: schedule,
    getNotificationPermissionStatus: jest.fn(),
  };
}

describe('shouldScheduleDailyReminder', () => {
  it('schedules for playing even when streak is zero (no streak gate)', () => {
    expect(
      shouldScheduleDailyReminder({
        ...baseInput,
        todayStatus: 'playing',
      }),
    ).toBe(true);
  });

  it('does not schedule when today is completed', () => {
    expect(
      shouldScheduleDailyReminder({
        ...baseInput,
        todayStatus: 'completed',
      }),
    ).toBe(false);
  });

  it('does not schedule without permission', () => {
    expect(
      shouldScheduleDailyReminder({
        ...baseInput,
        permissionGranted: false,
        todayStatus: 'playing',
      }),
    ).toBe(false);
  });

  it('does not schedule when disabled', () => {
    expect(
      shouldScheduleDailyReminder({
        ...baseInput,
        enabled: false,
        todayStatus: 'playing',
      }),
    ).toBe(false);
  });
});

describe('syncReminderSchedule', () => {
  it('cancels when today is completed', async () => {
    const deps = makeDeps();
    await syncReminderSchedule(
      { ...baseInput, todayStatus: 'completed' },
      deps,
    );
    expect(deps.cancel).toHaveBeenCalledTimes(1);
    expect(deps.schedule).not.toHaveBeenCalled();
  });

  it('schedules one routine when enabled and playing', async () => {
    const deps = makeDeps();
    await syncReminderSchedule(
      { ...baseInput, todayStatus: 'playing' },
      deps,
    );
    expect(deps.schedule).toHaveBeenCalledTimes(1);
    expect(deps.schedule.mock.calls[0][0]).toBe(9);
    expect(deps.schedule.mock.calls[0][1]).toBe(0);
  });

  it('cancels when gate fails', async () => {
    const deps = makeDeps();
    await syncReminderSchedule(
      { ...baseInput, enabled: false, todayStatus: 'playing' },
      deps,
    );
    expect(deps.cancel).toHaveBeenCalledTimes(1);
    expect(deps.schedule).not.toHaveBeenCalled();
  });
});
