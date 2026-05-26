import { daysBetweenDateKeys } from '../streak/streakLogic';
import {
  RATING_COOLDOWN_DAYS,
  RATING_MIN_COMPLETED_COUNT,
  RATING_MIN_STREAK,
} from './constants';
import type { RatingState } from './types';

export type RatingOutcome = 'completed' | 'abandoned';

export type ShouldPromptRatingInput = {
  outcome: RatingOutcome;
  completedCount: number;
  streak: number;
  ratingState: RatingState;
  todayDateKey: string;
};

function isCooldownSatisfied(
  lastPromptAt: string | null,
  todayDateKey: string,
): boolean {
  if (lastPromptAt == null) return true;
  const days = daysBetweenDateKeys(lastPromptAt, todayDateKey);
  return days >= RATING_COOLDOWN_DAYS;
}

export function shouldPromptRating(input: ShouldPromptRatingInput): boolean {
  if (input.outcome !== 'completed') return false;
  if (input.ratingState.hasRated) return false;
  if (input.completedCount < RATING_MIN_COMPLETED_COUNT) return false;
  if (input.streak < RATING_MIN_STREAK) return false;
  if (!isCooldownSatisfied(input.ratingState.lastPromptAt, input.todayDateKey)) {
    return false;
  }
  return true;
}
