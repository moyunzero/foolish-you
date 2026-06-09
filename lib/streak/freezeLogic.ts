import { hasRealCompletionForDateKey } from '../completion/completionHistoryQueries';
import { addDaysToDateKey, getIsoWeekKey } from '../date/dateKeyMath';
import type { CompletionEntry } from '../storage/completionHistoryStorage';
import { COMPLETION_HISTORY_MAX_ENTRIES } from '../../constants/config';
import { applyCheckIn, daysBetweenDateKeys } from './streakLogic';
import type { StreakState } from './types';
import { EMPTY_STREAK_STATE } from './types';

const MAX_FREEZE_COUNT = 2;

export function trimFreezeConsumedDateKeys(
  keys: string[],
  maxEntries: number = COMPLETION_HISTORY_MAX_ENTRIES,
): string[] {
  const unique = [...new Set(keys.filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k)))];
  unique.sort((a, b) => a.localeCompare(b));
  return unique.slice(-maxEntries);
}

export function grantWeeklyFreeze(
  state: StreakState,
  todayKey: string,
): StreakState {
  const weekKey = getIsoWeekKey(todayKey);
  if (state.lastFreezeGrantWeekKey === weekKey) {
    return state;
  }

  if (state.lastFreezeGrantWeekKey == null) {
    return { ...state, lastFreezeGrantWeekKey: weekKey };
  }

  if (state.freezeCount >= MAX_FREEZE_COUNT) {
    return { ...state, lastFreezeGrantWeekKey: weekKey };
  }

  return {
    ...state,
    freezeCount: state.freezeCount + 1,
    lastFreezeGrantWeekKey: weekKey,
  };
}

export type ConsumeFreezeResult = {
  state: StreakState;
  consumed: boolean;
};

export function consumeFreezeForMissedDay(
  state: StreakState,
  todayKey: string,
  historyEntries: CompletionEntry[] = [],
): ConsumeFreezeResult {
  if (state.lastCheckInDateKey == null) {
    return { state, consumed: false };
  }

  const gap = daysBetweenDateKeys(state.lastCheckInDateKey, todayKey);
  if (gap !== 2 || state.freezeCount <= 0) {
    return { state, consumed: false };
  }

  const yesterdayKey = addDaysToDateKey(todayKey, -1);
  if (hasRealCompletionForDateKey(historyEntries, yesterdayKey)) {
    return { state, consumed: false };
  }

  return {
    state: {
      ...state,
      freezeCount: state.freezeCount - 1,
      lastCheckInDateKey: yesterdayKey,
      freezeConsumedSessionKey: todayKey,
      freezeConsumedDateKeys: trimFreezeConsumedDateKeys([
        ...state.freezeConsumedDateKeys,
        yesterdayKey,
      ]),
    },
    consumed: true,
  };
}

export function reconcileStreakOnOpen(
  state: StreakState | null,
  todayKey: string,
  options?: { historyEntries?: CompletionEntry[] },
): StreakState {
  const base = state ?? EMPTY_STREAK_STATE;
  const afterGrant = grantWeeklyFreeze(base, todayKey);
  return consumeFreezeForMissedDay(
    afterGrant,
    todayKey,
    options?.historyEntries ?? [],
  ).state;
}

/** Backfill yesterday check-in when history proves real play (before freeze consume). */
export function repairStreakFromYesterdayCompletion(
  state: StreakState | null,
  todayKey: string,
  historyEntries: CompletionEntry[],
): StreakState | null {
  const base = state ?? EMPTY_STREAK_STATE;
  if (base.lastCheckInDateKey == null) {
    return null;
  }

  const gap = daysBetweenDateKeys(base.lastCheckInDateKey, todayKey);
  if (gap !== 2) {
    return null;
  }

  const yesterdayKey = addDaysToDateKey(todayKey, -1);
  if (!hasRealCompletionForDateKey(historyEntries, yesterdayKey)) {
    return null;
  }

  return applyCheckIn(base, yesterdayKey);
}
