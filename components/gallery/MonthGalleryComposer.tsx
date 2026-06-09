import { forwardRef } from 'react';
import { Text, View, type View as ViewType } from 'react-native';

import { colors } from '../../constants/design';
import { getAppDisplayName } from '../../lib/i18n/format';
import type { GalleryCell } from '../../lib/gallery/resolveGalleryCell';
import type { Locale } from '../../lib/i18n/types';
import GalleryDayCell from './GalleryDayCell';

export type MonthGalleryComposerProps = {
  monthTitle: string;
  locale: Locale;
  cells: GalleryCell[];
};

function formatDayLabel(dateKey: string): string {
  const [, month, day] = dateKey.split('-');
  return `${month}-${day}`;
}

const MonthGalleryComposer = forwardRef<ViewType, MonthGalleryComposerProps>(
  function MonthGalleryComposer({ monthTitle, locale, cells }, ref) {
    return (
      <View
        ref={ref}
        collapsable={false}
        style={{
          width: 320,
          backgroundColor: colors.canvas,
          paddingHorizontal: 20,
          paddingVertical: 24,
        }}
      >
        <Text
          className="text-ink"
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 16,
            fontWeight: '700',
            marginBottom: 4,
          }}
        >
          {getAppDisplayName(locale)}
        </Text>
        <Text
          className="mb-5 text-muted"
          style={{
            fontFamily: 'SpaceMono_400Regular',
            fontSize: 12,
          }}
        >
          {monthTitle}
        </Text>
        {cells.map((cell) => (
          <GalleryDayCell
            key={cell.dateKey}
            cell={cell}
            dateLabel={formatDayLabel(cell.dateKey)}
            animate={false}
          />
        ))}
      </View>
    );
  },
);

export default MonthGalleryComposer;
