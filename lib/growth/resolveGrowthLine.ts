import {
  GROWTH_COMEBACK_MIN_DAYS,
  GROWTH_HOT_MIN_DAYS,
  GROWTH_STEADY_MIN_DAYS,
  GROWTH_WINDOW_DAYS,
} from '../../constants/config';
import {
  countCompletedInLastDays,
  daysSincePreviousCompletion,
} from '../completion/completionHistoryQueries';
import type { CompletionEntry } from '../storage/completionHistoryStorage';

export type GrowthTone = 'comeback' | 'hot' | 'steady';

export type ResolveGrowthInput = {
  entries: CompletionEntry[];
  today: string;
  outcome: 'completed' | 'abandoned';
};

/**
 * Ordered early-return gates (D-07): ③ comeback → ②a hot → ②b steady → ④ null.
 * Never-negative: ordinary days and abandoned days stay silent, the only
 * abandoned exception being ③ comeback (D-10). Pure — no storage I/O.
 */
export function resolveGrowthTone(input: ResolveGrowthInput): GrowthTone | null {
  const gap = daysSincePreviousCompletion(input.entries, input.today);
  if (gap != null && gap >= GROWTH_COMEBACK_MIN_DAYS) {
    return 'comeback';
  }

  if (input.outcome !== 'completed') return null;

  const last7 = countCompletedInLastDays(
    input.entries,
    input.today,
    GROWTH_WINDOW_DAYS,
  );
  if (last7 >= GROWTH_HOT_MIN_DAYS) return 'hot';
  if (last7 >= GROWTH_STEADY_MIN_DAYS) return 'steady';
  return null;
}
