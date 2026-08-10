jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
  },
  ImpactFeedbackStyle: {
    Light: 'light',
  },
}));

import * as Haptics from 'expo-haptics';

import { feelSuccess } from '../../../lib/feel/haptics';

describe('feelSuccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exports and fires Success notification via safe wrapper', async () => {
    feelSuccess();
    // safe() is async void — flush microtask
    await Promise.resolve();
    await Promise.resolve();

    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success,
    );
  });
});
