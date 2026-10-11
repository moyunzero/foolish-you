import { DEV_TOOLS_ENABLED } from '../../constants/dev';
import { addDaysToDateKey, getIsoWeekKey } from '../date/dateKeyMath';
import { getLocalDateKey } from '../date/localDay';
import type { StreakState } from '../streak/types';
import {
  saveCompletionHistory,
  type CompletionHistoryState,
} from '../storage/completionHistoryStorage';
import {
  clearStreakState,
  saveStreakState,
} from '../storage/streakStorage';

export type StreakDevScenarioId =
  | 'clear'
  | 'gap2-recall'
  | 'gap2-freeze-ready'
  | 'gap2-yesterday-real'
  | 'freeze-consumed-ui'
  | 'shields-full'
  | 'weekly-grant-pending';

export type StreakDevScenarioMeta = {
  id: StreakDevScenarioId;
};

/** Scenarios that expect streak subline on the game screen while playing. */
export const STREAK_GAME_BANNER_SCENARIOS: ReadonlySet<StreakDevScenarioId> =
  new Set([
    'gap2-recall',
    'gap2-freeze-ready',
    'gap2-yesterday-real',
    'freeze-consumed-ui',
  ]);

// Scenario ids only; labels and hints live in locales zh and en devTools.
export const STREAK_DEV_SCENARIOS: StreakDevScenarioMeta[] = [
  { id: 'clear' },
  { id: 'gap2-recall' },
  { id: 'gap2-freeze-ready' },
  { id: 'gap2-yesterday-real' },
  { id: 'freeze-consumed-ui' },
  { id: 'shields-full' },
  { id: 'weekly-grant-pending' },
];

function streakBase(today: string, overrides: Partial<StreakState>): StreakState {
  return {
    currentStreak: 4,
    lastCheckInDateKey: addDaysToDateKey(today, -2),
    historicalMax: 4,
    freezeCount: 0,
    lastFreezeGrantWeekKey: getIsoWeekKey(today),
    freezeConsumedSessionKey: null,
    freezeConsumedDateKeys: [],
    ...overrides,
  };
}

async function persistHistory(entries: CompletionHistoryState['entries']): Promise<void> {
  await saveCompletionHistory({ entries });
}

/** __DEV__: seed streak (+ optional history) for manual QA. Caller should refresh hydrate after. */
export async function applyStreakDevScenario(
  scenario: StreakDevScenarioId,
): Promise<boolean> {
  if (!DEV_TOOLS_ENABLED) {
    return false;
  }

  const today = getLocalDateKey();
  const yesterday = addDaysToDateKey(today, -1);
  const twoDaysAgo = addDaysToDateKey(today, -2);
  const priorWeekKey = getIsoWeekKey(addDaysToDateKey(today, -7));

  switch (scenario) {
    case 'clear':
      await clearStreakState();
      return true;

    case 'gap2-recall': {
      await persistHistory([]);
      return saveStreakState(
        streakBase(today, {
          lastCheckInDateKey: twoDaysAgo,
          freezeCount: 0,
        }),
      );
    }

    case 'gap2-freeze-ready': {
      await persistHistory([]);
      return saveStreakState(
        streakBase(today, {
          lastCheckInDateKey: twoDaysAgo,
          freezeCount: 1,
        }),
      );
    }

    case 'gap2-yesterday-real': {
      await persistHistory([
        { dateKey: yesterday, elapsedMs: 120_000 },
      ]);
      return saveStreakState(
        streakBase(today, {
          lastCheckInDateKey: twoDaysAgo,
          freezeCount: 1,
        }),
      );
    }

    case 'freeze-consumed-ui': {
      await persistHistory([]);
      return saveStreakState(
        streakBase(today, {
          lastCheckInDateKey: yesterday,
          freezeCount: 0,
          freezeConsumedSessionKey: today,
        }),
      );
    }

    case 'shields-full': {
      return saveStreakState(
        streakBase(today, {
          lastCheckInDateKey: yesterday,
          freezeCount: 2,
          lastFreezeGrantWeekKey: getIsoWeekKey(today),
        }),
      );
    }

    case 'weekly-grant-pending': {
      await persistHistory([]);
      return saveStreakState(
        streakBase(today, {
          lastCheckInDateKey: yesterday,
          freezeCount: 1,
          lastFreezeGrantWeekKey: priorWeekKey,
        }),
      );
    }

    default:
      return false;
  }
}

export function formatStreakDevSummary(state: StreakState | null): string {
  if (state == null) {
    return 'streak: (null)';
  }
  return [
    `streak ${state.currentStreak}`,
    `last ${state.lastCheckInDateKey ?? '—'}`,
    `shield ${state.freezeCount}`,
    `week ${state.lastFreezeGrantWeekKey ?? '—'}`,
    state.freezeConsumedSessionKey
      ? `used ${state.freezeConsumedSessionKey}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');
}
