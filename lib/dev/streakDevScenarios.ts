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
  label: string;
  hint: string;
};

/** Scenarios that expect streak subline on the game screen while playing. */
export const STREAK_GAME_BANNER_SCENARIOS: ReadonlySet<StreakDevScenarioId> =
  new Set([
    'gap2-recall',
    'gap2-freeze-ready',
    'gap2-yesterday-real',
    'freeze-consumed-ui',
  ]);

export const STREAK_DEV_SCENARIOS: StreakDevScenarioMeta[] = [
  {
    id: 'clear',
    label: '清空连签',
    hint: '删除 streak 存储；hydrate 后等同新装',
  },
  {
    id: 'gap2-recall',
    label: '漏签召回',
    hint: '上次入账 = 前天，无护盾；刷新后应见 recall banner',
  },
  {
    id: 'gap2-freeze-ready',
    label: '待耗护盾',
    hint: '上次入账 = 前天，护盾×1；刷新后自动消耗并显示 freeze 一行',
  },
  {
    id: 'gap2-yesterday-real',
    label: '昨日真通',
    hint: '前天入账 + 昨日 real 通关；刷新后 repair，不耗护盾',
  },
  {
    id: 'freeze-consumed-ui',
    label: '护盾已垫',
    hint: '已消耗态：仅 freeze 一行，无 recall banner',
  },
  {
    id: 'shields-full',
    label: '护盾×2',
    hint: '结果页第三卡 subline 应含 护盾×2',
  },
  {
    id: 'weekly-grant-pending',
    label: '跨周+1',
    hint: '上周已发过；刷新后 freezeCount +1（上限 2）',
  },
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
