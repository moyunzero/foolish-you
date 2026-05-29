import {
  createStatsSublineRng,
  formatStatsClock,
  pickElapsedSubline,
  pickStreakSubline,
  pickWeeklySubline,
} from '../copy/statsSublines';
import type { Locale } from '../i18n/types';
import { getStringsForLocale } from '../i18n/strings';
import { loadCompletionHistory } from '../storage/completionHistoryStorage';
import { loadStreakState } from '../storage/streakStorage';
import { countWeeklyCompletedFromEntries } from './weeklyCompletedCount';

export type StatsCardItem = {
  label: string;
  value: string;
  subline: string;
};

export type StatsCardsData = {
  cards: [StatsCardItem, StatsCardItem, StatsCardItem];
};

export type ComputeStatsCardsInput = {
  elapsedMs: number;
  today: string;
  seed?: number | null;
  locale?: Locale;
};

export async function computeStatsCards(
  input: ComputeStatsCardsInput,
): Promise<StatsCardsData> {
  const locale = input.locale ?? 'zh';
  const labels = getStringsForLocale(locale).ui.stats;

  const [history, streakState] = await Promise.all([
    loadCompletionHistory(),
    loadStreakState(),
  ]);
  const weeklyCount = countWeeklyCompletedFromEntries(
    history.entries,
    input.today,
  );

  const currentStreak = streakState?.currentStreak ?? 0;
  const historicalMax = streakState?.historicalMax ?? currentStreak;

  const elapsedRng = createStatsSublineRng(input.today, input.seed, 0);
  const weeklyRng = createStatsSublineRng(input.today, input.seed, 1);
  const streakRng = createStatsSublineRng(input.today, input.seed, 2);

  return {
    cards: [
      {
        label: labels.today,
        value: formatStatsClock(input.elapsedMs),
        subline: pickElapsedSubline(
          input.elapsedMs,
          history.entries,
          input.today,
          elapsedRng,
          locale,
        ),
      },
      {
        label: labels.thisWeek,
        value: `${weeklyCount} / 7`,
        subline: pickWeeklySubline(weeklyCount, weeklyRng, locale),
      },
      {
        label: labels.bestStreak,
        value:
          locale === 'zh'
            ? `${historicalMax} 天`
            : `${historicalMax} days`,
        subline: pickStreakSubline(currentStreak, historicalMax, streakRng, locale),
      },
    ],
  };
}
