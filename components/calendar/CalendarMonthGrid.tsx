import { Text, View } from 'react-native';

import { colors } from '../../constants/design';
import type { MonthGridCell } from '../../lib/calendar/buildMonthGrid';
import { useI18n } from '../../lib/i18n';

type CalendarMonthGridProps = {
  cells: MonthGridCell[];
  weekdayLabels: readonly string[];
};

const WEEK_SIZE = 7;

function cellMark(state: MonthGridCell['state']): string {
  switch (state) {
    case 'completed':
      return '✓';
    case 'abandoned':
      return '🏳';
    case 'shield':
      return '🛡';
    case 'missed':
      return '·';
    default:
      return '';
  }
}

function cellTone(state: MonthGridCell['state']): string {
  switch (state) {
    case 'completed':
      return colors.ink;
    case 'abandoned':
      return colors.accentSunset;
    case 'shield':
      return colors.calendarShield;
    case 'missed':
      return colors.muted;
    default:
      return colors.muted;
  }
}

function blankCell(): MonthGridCell {
  return { dateKey: null, state: null, isToday: false, isInMonth: false };
}

/** Chunk flat month cells into Sun–Sat weeks (avoids flex-wrap % width overflow). */
function chunkWeeks(cells: MonthGridCell[]): MonthGridCell[][] {
  const weeks: MonthGridCell[][] = [];
  for (let i = 0; i < cells.length; i += WEEK_SIZE) {
    const week = cells.slice(i, i + WEEK_SIZE);
    // Always 7 columns — a short last row would stretch flex-1 and re-break Sat.
    while (week.length < WEEK_SIZE) {
      week.push(blankCell());
    }
    weeks.push(week);
  }
  return weeks;
}

export default function CalendarMonthGrid({
  cells,
  weekdayLabels,
}: CalendarMonthGridProps) {
  const { strings } = useI18n();
  const calendarUi = strings.ui.calendar;
  const weeks = chunkWeeks(cells);

  return (
    <View>
      <View className="mb-2 flex-row">
        {weekdayLabels.map((label) => (
          <View key={label} className="flex-1 items-center py-1">
            <Text
              className="text-[10px] text-muted"
              style={{ fontFamily: 'SpaceMono_400Regular' }}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={`week-${weekIndex}`} className="flex-row">
          {week.map((cell, dayIndex) => {
            const index = weekIndex * WEEK_SIZE + dayIndex;
            if (!cell.isInMonth || cell.dateKey == null) {
              return (
                <View
                  key={`blank-${index}`}
                  className="aspect-square flex-1 items-center justify-center"
                />
              );
            }

            const day = Number(cell.dateKey.slice(8, 10));
            const mark = cellMark(cell.state);
            const tone = cellTone(cell.state);

            return (
              <View
                key={cell.dateKey}
                accessible
                accessibilityRole="text"
                className="aspect-square flex-1 items-center justify-center px-0.5 py-0.5"
                accessibilityLabel={
                  cell.state != null
                    ? calendarUi.cellA11y(day, cell.state)
                    : calendarUi.cellEmptyA11y(day)
                }
              >
                <View
                  className="h-full w-full items-center justify-center rounded-md"
                  style={{
                    borderWidth: cell.isToday ? 1 : 0,
                    borderColor: cell.isToday
                      ? colors.accentSunset
                      : 'transparent',
                    backgroundColor:
                      cell.state === 'completed'
                        ? 'rgba(255,255,255,0.06)'
                        : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'SpaceMono_400Regular',
                      fontSize: 11,
                      color: colors.muted,
                    }}
                  >
                    {day}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'SpaceMono_400Regular',
                      fontSize: 10,
                      lineHeight: 12,
                      color: tone,
                    }}
                  >
                    {mark}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
