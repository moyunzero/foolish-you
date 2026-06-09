import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import MonthGalleryCta from '../gallery/MonthGalleryCta';
import BottomSheetShell from '../ui/BottomSheetShell';
import CalendarMonthGrid from './CalendarMonthGrid';
import { colors } from '../../constants/design';
import {
  buildMonthGrid,
  canGoToNextMonth,
  canGoToPreviousMonth,
  getMonthKeyForDateKey,
  getPreviousMonthKey,
} from '../../lib/calendar/buildMonthGrid';
import { monthHasGalleryRecords } from '../../lib/gallery/buildMonthGallery';
import {
  computeMonthSummary,
  entriesToMap,
  freezeDatesFromStreak,
} from '../../lib/calendar/monthSummary';
import type { DailyStatus } from '../../lib/puzzles/types';
import type { CompletionEntry } from '../../lib/storage/completionHistoryStorage';
import { loadCompletionHistory } from '../../lib/storage/completionHistoryStorage';
import { loadStreakState } from '../../lib/storage/streakStorage';
import type { StreakState } from '../../lib/streak/types';
import { useI18n } from '../../lib/i18n';

type MonthCalendarSheetProps = {
  visible: boolean;
  onClose: () => void;
  dateKey: string | null;
  seed?: number | null;
  todaySnapshotStatus?: DailyStatus;
};

function formatMonthTitle(monthKey: string, locale: 'zh' | 'en'): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (locale === 'zh') {
    return `${year}年${month}月`;
  }
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export default function MonthCalendarSheet({
  visible,
  onClose,
  dateKey,
  seed,
  todaySnapshotStatus,
}: MonthCalendarSheetProps) {
  const { locale, strings } = useI18n();
  const calendarUi = strings.ui.calendar;
  const sheetUi = strings.ui.sheet;

  const todayKey = dateKey ?? '';
  const [monthKey, setMonthKey] = useState(() =>
    todayKey ? getMonthKeyForDateKey(todayKey) : '',
  );
  const [entries, setEntries] = useState<CompletionEntry[]>([]);
  const [streak, setStreak] = useState<StreakState | null>(null);

  useEffect(() => {
    if (!visible || !dateKey) return;
    setMonthKey(getMonthKeyForDateKey(dateKey));
    let cancelled = false;
    void Promise.all([loadCompletionHistory(), loadStreakState()]).then(
      ([history, streakState]) => {
        if (cancelled) return;
        setEntries(history.entries);
        setStreak(streakState);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [visible, dateKey]);

  const monthTitle = formatMonthTitle(monthKey, locale);

  const summary = useMemo(
    () =>
      computeMonthSummary({
        monthKey,
        entries,
        streak,
        seed,
        locale,
      }),
    [monthKey, entries, streak, seed, locale],
  );

  const gridCells = useMemo(
    () =>
      buildMonthGrid({
        monthKey,
        todayKey,
        entriesByDate: entriesToMap(entries),
        freezeDates: freezeDatesFromStreak(streak),
        todaySnapshotStatus,
      }),
    [monthKey, todayKey, entries, streak, todaySnapshotStatus],
  );

  const showPrev = canGoToPreviousMonth(monthKey, todayKey);
  const showNext = canGoToNextMonth(monthKey, todayKey);
  const hasGalleryRecords = monthHasGalleryRecords(monthKey, entries);

  if (!dateKey) {
    return null;
  }

  return (
    <BottomSheetShell
      visible={visible}
      onClose={onClose}
      dismissA11y={sheetUi.dismissA11y}
    >
      <View style={{ maxHeight: '100%' }}>
        <View className="border-b border-hairline px-5 pb-3 pt-1">
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => showPrev && setMonthKey(getPreviousMonthKey(monthKey))}
              disabled={!showPrev}
              accessibilityRole="button"
              accessibilityLabel={calendarUi.prevMonthA11y}
              className="min-h-[44px] min-w-[44px] items-center justify-center"
              style={{ opacity: showPrev ? 1 : 0.25 }}
            >
              <Text
                style={{
                  fontFamily: 'SpaceMono_400Regular',
                  fontSize: 22,
                  color: colors.ink,
                }}
              >
                ‹
              </Text>
            </Pressable>

            <Text
              className="text-ink"
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 18,
                fontWeight: '700',
                letterSpacing: -0.3,
              }}
            >
              {monthTitle}
            </Text>

            <Pressable
              onPress={() => showNext && setMonthKey(getMonthKeyForDateKey(todayKey))}
              disabled={!showNext}
              accessibilityRole="button"
              accessibilityLabel={calendarUi.nextMonthA11y}
              className="min-h-[44px] min-w-[44px] items-center justify-center"
              style={{ opacity: showNext ? 1 : 0.25 }}
            >
              <Text
                style={{
                  fontFamily: 'SpaceMono_400Regular',
                  fontSize: 22,
                  color: colors.ink,
                }}
              >
                ›
              </Text>
            </Pressable>
          </View>

          <Text
            className="mt-3 text-sm text-body"
            style={{ fontFamily: 'Inter_400Regular', lineHeight: 20 }}
          >
            {calendarUi.streakLine(summary.currentStreak)}
          </Text>
          <Text
            className="mt-1 text-sm text-body"
            style={{ fontFamily: 'Inter_400Regular', lineHeight: 20 }}
          >
            {calendarUi.completedLine(summary.monthCompletedCount)}
          </Text>
          <Text
            className="mt-2 text-xs text-muted"
            style={{ fontFamily: 'Inter_400Regular', lineHeight: 18 }}
            numberOfLines={2}
          >
            {summary.summaryTaunt}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {!hasGalleryRecords ? (
            <View className="mb-4">
              <Text
                className="text-sm text-ink"
                style={{ fontFamily: 'Inter_400Regular', fontWeight: '700' }}
              >
                {calendarUi.emptyHeading}
              </Text>
              <Text
                className="mt-1 text-sm text-body"
                style={{ fontFamily: 'Inter_400Regular', lineHeight: 20 }}
              >
                {calendarUi.emptyBody}
              </Text>
            </View>
          ) : null}
          <CalendarMonthGrid cells={gridCells} weekdayLabels={calendarUi.weekdays} />
        </ScrollView>

        <MonthGalleryCta
          monthKey={monthKey}
          monthTitle={monthTitle}
          todayKey={todayKey}
          entries={entries}
        />
      </View>
    </BottomSheetShell>
  );
}
