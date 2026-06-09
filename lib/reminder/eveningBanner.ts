import type { DailyStatus } from '../puzzles/types';

export type EveningReminderBannerInput = {
  todayKey: string;
  status: DailyStatus | 'loading';
  /** Local hour 0–23 from device clock. */
  localHour: number;
  freezeConsumedToday: boolean;
  showMissedYesterday: boolean;
};

/** D-13: ≥20:00, playing, not completed; defers to freeze/missed sublines. */
export function shouldShowEveningReminderBanner(
  input: EveningReminderBannerInput,
): boolean {
  if (input.status !== 'playing') return false;
  if (input.localHour < 20) return false;
  if (input.freezeConsumedToday) return false;
  if (input.showMissedYesterday) return false;
  return true;
}
