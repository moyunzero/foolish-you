import AsyncStorage from '@react-native-async-storage/async-storage';

import { RATING_STORAGE_KEY } from '../../../constants/config';
import {
  clearRatingState,
  incrementRatingCompletedCount,
  loadRatingState,
  recordRatingPromptAttempt,
  saveRatingState,
} from '../../../lib/storage/ratingStorage';
import { DEFAULT_RATING_STATE } from '../../../lib/rating/types';

describe('ratingStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns defaults when missing', async () => {
    expect(await loadRatingState()).toEqual(DEFAULT_RATING_STATE);
  });

  it('persists and reloads rating state', async () => {
    const state = {
      ...DEFAULT_RATING_STATE,
      completedCount: 4,
      lastPromptAt: '2026-01-01',
    };
    expect(await saveRatingState(state)).toBe(true);
    expect(await loadRatingState()).toEqual(state);
  });

  it('increments completedCount', async () => {
    await saveRatingState({ ...DEFAULT_RATING_STATE, completedCount: 2 });
    const next = await incrementRatingCompletedCount();
    expect(next.completedCount).toBe(3);
    expect((await loadRatingState()).completedCount).toBe(3);
  });

  it('records prompt attempt metadata', async () => {
    await saveRatingState({ ...DEFAULT_RATING_STATE, completedCount: 3 });
    const next = await recordRatingPromptAttempt(3, '2026-05-26');
    expect(next.lastPromptAt).toBe('2026-05-26');
    expect(next.completedCountAtLastPrompt).toBe(3);
  });

  it('clears storage', async () => {
    await saveRatingState({ ...DEFAULT_RATING_STATE, completedCount: 9 });
    await clearRatingState();
    expect(await AsyncStorage.getItem(RATING_STORAGE_KEY)).toBeNull();
    expect(await loadRatingState()).toEqual(DEFAULT_RATING_STATE);
  });
});
