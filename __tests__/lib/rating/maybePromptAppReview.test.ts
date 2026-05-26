import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

import { maybePromptAppReview } from '../../../lib/rating/maybePromptAppReview';
import { saveRatingState } from '../../../lib/storage/ratingStorage';
import { DEFAULT_RATING_STATE } from '../../../lib/rating/types';

jest.mock('expo-store-review', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  requestReview: jest.fn(() => Promise.resolve()),
}));

describe('maybePromptAppReview', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('calls requestReview when gates pass', async () => {
    await saveRatingState({ ...DEFAULT_RATING_STATE, completedCount: 3 });

    const prompted = await maybePromptAppReview({
      outcome: 'completed',
      streak: 2,
      dateKey: '2026-05-26',
    });

    expect(prompted).toBe(true);
    expect(StoreReview.requestReview).toHaveBeenCalledTimes(1);
  });

  it('does not call requestReview when completedCount too low', async () => {
    await saveRatingState({ ...DEFAULT_RATING_STATE, completedCount: 1 });

    const prompted = await maybePromptAppReview({
      outcome: 'completed',
      streak: 5,
      dateKey: '2026-05-26',
    });

    expect(prompted).toBe(false);
    expect(StoreReview.requestReview).not.toHaveBeenCalled();
  });
});
