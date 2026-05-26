import { getLocalDateKey } from '../date/localDay';
import {
  loadRatingState,
  recordRatingPromptAttempt,
} from '../storage/ratingStorage';
import { requestAppStoreReview } from './requestReview';
import { shouldPromptRating } from './shouldPromptRating';

export type MaybePromptAppReviewInput = {
  outcome: 'completed' | 'abandoned';
  streak: number;
  completedCount?: number;
  dateKey?: string;
};

/**
 * 在结果页通关态延迟调用。满足门控时尝试系统评分并写入 lastPromptAt
 * （系统可能静默不展示，属平台行为）。
 */
export async function maybePromptAppReview(
  input: MaybePromptAppReviewInput,
): Promise<boolean> {
  const todayDateKey = input.dateKey ?? getLocalDateKey();
  const ratingState = await loadRatingState();
  const completedCount = input.completedCount ?? ratingState.completedCount;

  if (
    !shouldPromptRating({
      outcome: input.outcome,
      completedCount,
      streak: input.streak,
      ratingState,
      todayDateKey,
    })
  ) {
    return false;
  }

  await requestAppStoreReview();
  await recordRatingPromptAttempt(completedCount, todayDateKey);
  return true;
}
