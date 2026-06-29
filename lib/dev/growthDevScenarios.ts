import { DEV_TOOLS_ENABLED } from '../../constants/dev';
import { getPreviousMonthKey } from '../calendar/buildMonthGrid';
import { addDaysToDateKey } from '../date/dateKeyMath';
import { getLocalDateKey } from '../date/localDay';
import { getMonthKeyForDateKey } from '../calendar/monthSummary';
import type { GameType } from '../puzzles/types';
import {
  saveCompletionHistory,
  type CompletionEntry,
} from '../storage/completionHistoryStorage';

export type GrowthDevScenarioId =
  | 'growth-silent'
  | 'growth-hot'
  | 'growth-steady'
  | 'growth-comeback'
  | 'growth-calendar'
  | 'growth-smoother';

export type GrowthDevScenarioMeta = {
  id: GrowthDevScenarioId;
  label: string;
  hint: string;
};

export const GROWTH_DEV_SCENARIOS: GrowthDevScenarioMeta[] = [
  {
    id: 'growth-silent',
    label: '近况·平常',
    hint: '仅昨日通关；今日 win 后结果页无成长行',
  },
  {
    id: 'growth-hot',
    label: '近况·火热',
    hint: '近 7 天含今日 ≥6 次通关 → 火热口吻',
  },
  {
    id: 'growth-steady',
    label: '近况·稳定',
    hint: '近 7 天含今日 4–5 次 → 稳定口吻',
  },
  {
    id: 'growth-comeback',
    label: '近况·召回',
    hint: '上次通关 ≥3 天前 → 好久不见',
  },
  {
    id: 'growth-calendar',
    label: '月历·比上月多',
    hint: '上月 2 天 + 本月若干天；Sheet 应追加正向 delta',
  },
  {
    id: 'growth-smoother',
    label: '彩蛋·同类更顺',
    hint: '同玩法三周同星期几较慢历史；今日通关更快 → smoother 行',
  },
];

function completedEntry(
  dateKey: string,
  gameType: GameType = 'sudoku',
  elapsedMs = 120_000,
): CompletionEntry {
  return {
    dateKey,
    elapsedMs,
    outcome: 'completed',
    gameType,
  };
}

function dateKeysForMonth(monthKey: string, dayNumbers: number[]): string[] {
  return dayNumbers.map(
    (day) => `${monthKey}-${String(day).padStart(2, '0')}`,
  );
}

/** __DEV__: seed completion history for gentle-growth QA. Caller should refresh hydrate after. */
export async function applyGrowthDevScenario(
  scenario: GrowthDevScenarioId,
): Promise<boolean> {
  if (!DEV_TOOLS_ENABLED) return false;

  const today = getLocalDateKey();
  const entries: CompletionEntry[] = [];

  switch (scenario) {
    case 'growth-silent': {
      await saveCompletionHistory({
        entries: [completedEntry(addDaysToDateKey(today, -1))],
      });
      return true;
    }

    case 'growth-hot': {
      for (let offset = 6; offset >= 1; offset -= 1) {
        entries.push(completedEntry(addDaysToDateKey(today, -offset)));
      }
      await saveCompletionHistory({ entries });
      return true;
    }

    case 'growth-steady': {
      for (let offset = 3; offset >= 1; offset -= 1) {
        entries.push(completedEntry(addDaysToDateKey(today, -offset)));
      }
      await saveCompletionHistory({ entries });
      return true;
    }

    case 'growth-comeback': {
      await saveCompletionHistory({
        entries: [completedEntry(addDaysToDateKey(today, -4))],
      });
      return true;
    }

    case 'growth-calendar': {
      const monthKey = getMonthKeyForDateKey(today);
      const prevKey = getPreviousMonthKey(monthKey);
      const dayNum = Number(today.split('-')[2]);
      // One prev-month day + up to 3 earlier this-month days → after 一键通关 delta ≥ 1 (dayNum ≥ 2).
      const thisMonthEntries: CompletionEntry[] = [];
      for (let day = 1; day < dayNum && thisMonthEntries.length < 3; day += 1) {
        thisMonthEntries.push(
          completedEntry(`${monthKey}-${String(day).padStart(2, '0')}`),
        );
      }

      await saveCompletionHistory({
        entries: [
          ...dateKeysForMonth(prevKey, [15]).map((key) => completedEntry(key)),
          ...thisMonthEntries,
        ],
      });
      return true;
    }

    case 'growth-smoother': {
      for (const weeks of [1, 2, 3]) {
        entries.push(
          completedEntry(addDaysToDateKey(today, -7 * weeks), 'sudoku', 120_000),
        );
      }
      // Gap < GROWTH_COMEBACK_MIN_DAYS so rhythm can reach smoother (see resolveGrowthLine tests).
      entries.push(completedEntry(addDaysToDateKey(today, -1), 'sudoku', 120_000));
      await saveCompletionHistory({ entries });
      return true;
    }

    default:
      return false;
  }
}
