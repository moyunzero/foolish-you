import { shouldPromptRating } from '../../../lib/rating/shouldPromptRating';
import { DEFAULT_RATING_STATE } from '../../../lib/rating/types';

const TODAY = '2026-05-26';
const COOLDOWN_START = '2026-02-20';

describe('shouldPromptRating', () => {
  it('returns true when all gates pass on first completion', () => {
    expect(
      shouldPromptRating({
        outcome: 'completed',
        completedCount: 1,
        streak: 1,
        ratingState: DEFAULT_RATING_STATE,
        todayDateKey: TODAY,
      }),
    ).toBe(true);
  });

  it('returns false when outcome is abandoned', () => {
    expect(
      shouldPromptRating({
        outcome: 'abandoned',
        completedCount: 10,
        streak: 10,
        ratingState: DEFAULT_RATING_STATE,
        todayDateKey: TODAY,
      }),
    ).toBe(false);
  });

  it('returns false when completedCount below 1', () => {
    expect(
      shouldPromptRating({
        outcome: 'completed',
        completedCount: 0,
        streak: 5,
        ratingState: DEFAULT_RATING_STATE,
        todayDateKey: TODAY,
      }),
    ).toBe(false);
  });

  it('returns false when streak below 1', () => {
    expect(
      shouldPromptRating({
        outcome: 'completed',
        completedCount: 5,
        streak: 0,
        ratingState: DEFAULT_RATING_STATE,
        todayDateKey: TODAY,
      }),
    ).toBe(false);
  });

  it('returns false when user marked hasRated', () => {
    expect(
      shouldPromptRating({
        outcome: 'completed',
        completedCount: 5,
        streak: 5,
        ratingState: { ...DEFAULT_RATING_STATE, hasRated: true },
        todayDateKey: TODAY,
      }),
    ).toBe(false);
  });

  it('returns false within 90-day cooldown', () => {
    expect(
      shouldPromptRating({
        outcome: 'completed',
        completedCount: 5,
        streak: 5,
        ratingState: {
          ...DEFAULT_RATING_STATE,
          lastPromptAt: '2026-05-01',
        },
        todayDateKey: TODAY,
      }),
    ).toBe(false);
  });

  it('returns true when last prompt was 90+ days ago', () => {
    expect(
      shouldPromptRating({
        outcome: 'completed',
        completedCount: 1,
        streak: 1,
        ratingState: {
          ...DEFAULT_RATING_STATE,
          lastPromptAt: COOLDOWN_START,
        },
        todayDateKey: TODAY,
      }),
    ).toBe(true);
  });

  it('returns false on exact boundary day 89 after last prompt', () => {
    expect(
      shouldPromptRating({
        outcome: 'completed',
        completedCount: 1,
        streak: 1,
        ratingState: {
          ...DEFAULT_RATING_STATE,
          lastPromptAt: '2026-02-27',
        },
        todayDateKey: TODAY,
      }),
    ).toBe(false);
  });
});
