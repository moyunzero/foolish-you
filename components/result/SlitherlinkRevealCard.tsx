import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { colors } from '../../constants/design';
import { useI18n } from '../../lib/i18n';
import {
  EDGE_LINE,
  SLITHERLINK_SIZE,
} from '../../lib/puzzles/slitherlink/spec';
import type { SlitherlinkPuzzle } from '../../lib/puzzles/types';

type SlitherlinkRevealCardProps = {
  puzzle: SlitherlinkPuzzle;
  size?: number;
};

type LineSegment = {
  id: string;
  orientation: 'h' | 'v';
  row: number;
  col: number;
  index: number;
};

function collectSolutionSegments(puzzle: SlitherlinkPuzzle): LineSegment[] {
  const segments: LineSegment[] = [];
  let index = 0;

  for (let row = 0; row <= SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      if (puzzle.solution.h[row]![col]! !== EDGE_LINE) continue;
      segments.push({
        id: `h-${row}-${col}`,
        orientation: 'h',
        row,
        col,
        index,
      });
      index += 1;
    }
  }

  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col <= SLITHERLINK_SIZE; col += 1) {
      if (puzzle.solution.v[row]![col]! !== EDGE_LINE) continue;
      segments.push({
        id: `v-${row}-${col}`,
        orientation: 'v',
        row,
        col,
        index,
      });
      index += 1;
    }
  }

  return segments;
}

function LoopSegment({
  orientation,
  row,
  col,
  cellSize,
  index,
}: LineSegment & { cellSize: number }) {
  const stroke = 3;
  const entering = FadeIn.delay(index * 15).duration(220);

  if (orientation === 'h') {
    return (
      <Animated.View
        entering={entering}
        style={{
          position: 'absolute',
          left: col * cellSize,
          top: row * cellSize - stroke / 2,
          width: cellSize,
          height: stroke,
          backgroundColor: colors.accentSunset,
          borderRadius: 1,
        }}
      />
    );
  }

  return (
    <Animated.View
      entering={entering}
      style={{
        position: 'absolute',
        left: col * cellSize - stroke / 2,
        top: row * cellSize,
        width: stroke,
        height: cellSize,
        backgroundColor: colors.accentSunset,
        borderRadius: 1,
      }}
    />
  );
}

/** 结果页「今日数回」— 仅 completed 态展示 solution 闭合环 */
export default function SlitherlinkRevealCard({
  puzzle,
  size = 160,
}: SlitherlinkRevealCardProps) {
  const { strings } = useI18n();
  const cellSize = Math.floor(size / SLITHERLINK_SIZE);
  const gridSize = cellSize * SLITHERLINK_SIZE;
  const segments = collectSolutionSegments(puzzle);

  return (
    <View className="items-center">
      <Animated.View
        entering={FadeIn.duration(400)}
        className="rounded-lg border border-hairline p-3"
        style={{ backgroundColor: colors.canvasCard }}
      >
        <View style={{ width: gridSize, height: gridSize, position: 'relative' }}>
          {Array.from({ length: SLITHERLINK_SIZE }, (_, row) =>
            Array.from({ length: SLITHERLINK_SIZE }, (_, col) => {
              const clue = puzzle.clues[row]![col];
              return (
                <View
                  key={`clue-${row}-${col}`}
                  style={{
                    position: 'absolute',
                    left: col * cellSize,
                    top: row * cellSize,
                    width: cellSize,
                    height: cellSize,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {clue != null ? (
                    <Text
                      style={{
                        fontFamily: 'SpaceMono_400Regular',
                        fontSize: 11,
                        color: colors.muted,
                      }}
                    >
                      {String(clue)}
                    </Text>
                  ) : null}
                </View>
              );
            }),
          )}
          {segments.map((segment) => (
            <LoopSegment
              key={segment.id}
              {...segment}
              cellSize={cellSize}
            />
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
        {strings.ui.slitherlinkReveal.prefix}
      </Animated.Text>
    </View>
  );
}
