import { shouldShowEveningReminderBanner } from '../../../lib/reminder/eveningBanner';

const BASE = {
  todayKey: '2026-06-08',
  status: 'playing' as const,
  localHour: 20,
  freezeConsumedToday: false,
  showMissedYesterday: false,
};

describe('shouldShowEveningReminderBanner', () => {
  it('shows at 20:00 while playing', () => {
    expect(shouldShowEveningReminderBanner(BASE)).toBe(true);
  });

  it('hides before 20:00', () => {
    expect(
      shouldShowEveningReminderBanner({ ...BASE, localHour: 19 }),
    ).toBe(false);
  });

  it('hides when not playing', () => {
    expect(
      shouldShowEveningReminderBanner({ ...BASE, status: 'completed' }),
    ).toBe(false);
  });

  it('defers when freeze consumed today', () => {
    expect(
      shouldShowEveningReminderBanner({ ...BASE, freezeConsumedToday: true }),
    ).toBe(false);
  });

  it('defers when missed-yesterday subline is active', () => {
    expect(
      shouldShowEveningReminderBanner({ ...BASE, showMissedYesterday: true }),
    ).toBe(false);
  });
});
