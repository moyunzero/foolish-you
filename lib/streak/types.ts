export type StreakState = {
  currentStreak: number;
  lastCheckInDateKey: string | null;
};

export type StreakDisplay = {
  displayStreak: number;
  checkedInToday: boolean;
  streakBroken: boolean;
};
