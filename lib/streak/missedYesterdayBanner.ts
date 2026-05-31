import { addDaysToDateKey } from '../date/dateKeyMath';
import { hasRealCompletionForDateKey } from '../completion/completionHistoryQueries';
import type { CompletionEntry } from '../storage/completionHistoryStorage';
import type { DailyStatus } from '../puzzles/types';
import { daysBetweenDateKeys } from './streakLogic';

export type MissedYesterdayBannerInput = {
  todayKey: string;
  status: DailyStatus | 'loading';
  lastCheckInDateKey: string | null;
  historyEntries: CompletionEntry[];
};

export function shouldShowMissedYesterdayBanner(
  input: MissedYesterdayBannerInput,
): boolean {
  if (input.status !== 'playing') {
    return false;
  }

  if (input.lastCheckInDateKey == null) {
    return false;
  }

  const yesterdayKey = addDaysToDateKey(input.todayKey, -1);
  if (hasRealCompletionForDateKey(input.historyEntries, yesterdayKey)) {
    return false;
  }

  // Recall only when yesterday is strictly missed (last check-in before yesterday).
  return daysBetweenDateKeys(input.lastCheckInDateKey, input.todayKey) >= 2;
}
