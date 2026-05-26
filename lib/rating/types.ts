export type RatingState = {
  lastPromptAt: string | null;
  completedCountAtLastPrompt: number;
  hasRated: boolean;
  completedCount: number;
};

export const DEFAULT_RATING_STATE: RatingState = {
  lastPromptAt: null,
  completedCountAtLastPrompt: 0,
  hasRated: false,
  completedCount: 0,
};
