import { Text, View } from 'react-native';

import NonogramRevealCard from '../result/NonogramRevealCard';
import { colors } from '../../constants/design';
import type { GalleryCell } from '../../lib/gallery/resolveGalleryCell';

type GalleryDayCellProps = {
  cell: GalleryCell;
  dateLabel: string;
  /** Gallery capture uses static tiles — no entrance animation. */
  animate?: boolean;
};

const EMOJI_CELL_SIZE = 56;

export default function GalleryDayCell({
  cell,
  dateLabel,
  animate = false,
}: GalleryDayCellProps) {
  return (
    <View className="mb-4 flex-row items-center gap-3">
      <Text
        className="text-muted"
        style={{
          fontFamily: 'SpaceMono_400Regular',
          fontSize: 11,
          width: 52,
        }}
      >
        {dateLabel}
      </Text>
      <View className="flex-1 items-start">
        {cell.kind === 'nonogram' ? (
          <NonogramRevealCard
            puzzle={cell.puzzle}
            size={EMOJI_CELL_SIZE}
            animate={animate}
            showCaption={false}
          />
        ) : (
          <View
            className="rounded-lg border border-hairline px-2 py-1"
            style={{ backgroundColor: colors.canvasCard }}
          >
            <Text
              style={{
                fontFamily: 'SpaceMono_400Regular',
                fontSize: 10,
                lineHeight: 14,
                letterSpacing: 0,
              }}
            >
              {cell.emojiGrid}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
