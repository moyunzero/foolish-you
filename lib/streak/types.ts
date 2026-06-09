export type StreakState = {
  currentStreak: number;
  lastCheckInDateKey: string | null;
  /** 历史最高连签（含当前 streak 曾达到的值） */
  historicalMax: number;
  /** Streak freeze shields (0..2) */
  freezeCount: number;
  /** ISO week key when freeze was last granted (`YYYY-Www`) */
  lastFreezeGrantWeekKey: string | null;
  /** Equals todayKey when freeze was consumed this session/day */
  freezeConsumedSessionKey?: string | null;
  /** dateKeys when a freeze shield was consumed (calendar 🛡), trimmed to 90 days */
  freezeConsumedDateKeys: string[];
};

export const EMPTY_STREAK_STATE: StreakState = {
  currentStreak: 0,
  lastCheckInDateKey: null,
  historicalMax: 0,
  freezeCount: 0,
  lastFreezeGrantWeekKey: null,
  freezeConsumedSessionKey: null,
  freezeConsumedDateKeys: [],
};

export type StreakDisplay = {
  displayStreak: number;
  checkedInToday: boolean;
  streakBroken: boolean;
};
