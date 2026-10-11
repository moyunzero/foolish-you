import type { DailyStatus } from '../puzzles/types';

export type EveningReminderBannerInput = {
  /**
   * Wall calendar day (YYYY-MM-DD from `getLocalDateKey`), not the opening
   * snapshot `dateKey`. Callers must pass wall today so a prior-day opening
   * dismiss cannot suppress the banner on a new wall day (D-11).
   */
  todayKey: string;
  status: DailyStatus | 'loading';
  /** Local hour 0–23 from device clock. */
  localHour: number;
  freezeConsumedToday: boolean;
  showMissedYesterday: boolean;
  /** Same wall-day dismiss — hide when equal to wall `todayKey` only. */
  eveningBannerDismissedForDateKey?: string | null;
};

/** D-13: ≥20:00, playing, not completed; defers to freeze/missed sublines. */
export function shouldShowEveningReminderBanner(
  input: EveningReminderBannerInput,
): boolean {
  if (input.status !== 'playing') return false;
  if (input.localHour < 20) return false;
  if (input.freezeConsumedToday) return false;
  if (input.showMissedYesterday) return false;
  if (input.eveningBannerDismissedForDateKey === input.todayKey) return false;
  return true;
}
