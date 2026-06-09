import { shouldShowReminderSoftAsk } from '../../../lib/reminder/shouldShowSoftAsk';

describe('shouldShowReminderSoftAsk', () => {
  it('shows on first completed when not dismissed', () => {
    expect(
      shouldShowReminderSoftAsk({
        outcome: 'completed',
        completedCount: 1,
        softAskDismissed: false,
      }),
    ).toBe(true);
  });

  it('never shows on abandoned', () => {
    expect(
      shouldShowReminderSoftAsk({
        outcome: 'abandoned',
        completedCount: 1,
        softAskDismissed: false,
      }),
    ).toBe(false);
  });

  it('hides after second completion', () => {
    expect(
      shouldShowReminderSoftAsk({
        outcome: 'completed',
        completedCount: 2,
        softAskDismissed: false,
      }),
    ).toBe(false);
  });

  it('hides when soft ask already dismissed', () => {
    expect(
      shouldShowReminderSoftAsk({
        outcome: 'completed',
        completedCount: 1,
        softAskDismissed: true,
      }),
    ).toBe(false);
  });
});
