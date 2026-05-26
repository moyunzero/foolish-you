import { getRollingDateKeysEnding } from '../date/dateKeyMath';
import type { CompletionEntry } from '../storage/completionHistoryStorage';
import { loadCompletionHistory } from '../storage/completionHistoryStorage';

/** 滚动最近 7 个自然日（含 today）内通关天数（已加载的 entries） */
export function countWeeklyCompletedFromEntries(
  entries: CompletionEntry[],
  today: string,
): number {
  const windowKeys = new Set(getRollingDateKeysEnding(today, 7));
  return entries.filter((e) => windowKeys.has(e.dateKey)).length;
}

/** 滚动最近 7 个自然日（含 today）内通关天数 */
export async function countWeeklyCompleted(today: string): Promise<number> {
  const { entries } = await loadCompletionHistory();
  return countWeeklyCompletedFromEntries(entries, today);
}
