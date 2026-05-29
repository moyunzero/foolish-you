import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { colors } from '../../constants/design';
import { useI18n } from '../../lib/i18n';
import { resolvePictureTitle } from '../../lib/i18n/pictureTitle';
import type { NonogramPuzzle } from '../../lib/puzzles/types';

type NonogramRevealCardProps = {
  puzzle: NonogramPuzzle;
  size?: number;
};

/** 结果页「今日画作」— 仅展示填色块，无 × 标记 */
export default function NonogramRevealCard({
  puzzle,
  size = 160,
}: NonogramRevealCardProps) {
  const { locale, strings } = useI18n();
  const { rows, cols, solution, pictureTitle } = puzzle;
  const cellSize = Math.floor(size / Math.max(rows, cols));
  const title = resolvePictureTitle(pictureTitle, locale);

  return (
    <View className="items-center">
      <Animated.View
        entering={FadeIn.duration(400)}
        className="rounded-lg border border-hairline p-3"
        style={{ backgroundColor: colors.canvasCard }}
      >
        <View>
          {Array.from({ length: rows }, (_, row) => (
            <View key={`reveal-row-${row}`} className="flex-row">
              {Array.from({ length: cols }, (_, col) => {
                const filled = solution[row]![col]!;
                return (
                  <Animated.View
                    key={`reveal-${row}-${col}`}
                    entering={FadeIn.delay((row * cols + col) * 18).duration(
                      220,
                    )}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: filled
                        ? colors.accentSunset
                        : 'transparent',
                      borderWidth: 0.5,
                      borderColor: colors.hairline,
                    }}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </Animated.View>
      <Animated.Text
        entering={FadeIn.delay(400).duration(350)}
        className="mt-4 text-center text-body"
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 14,
          lineHeight: 20,
        }}
      >
        {`${strings.ui.nonogramReveal.prefix} ${title}`}
      </Animated.Text>
    </View>
  );
}
