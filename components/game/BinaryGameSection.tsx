import { View, type StyleProp, type ViewStyle } from 'react-native';

import type { useBinaryBoard } from '../../hooks/useBinaryBoard';
import type { SignatureMoment } from '../../lib/feel/signatureTokens';
import type { BinaryGivens, BinaryPlayState } from '../../lib/puzzles/types';
import BinaryGrid from '../grid/BinaryGrid';
import HairlineCard from '../ui/HairlineCard';

type BinaryBoardState = ReturnType<typeof useBinaryBoard>;

type BinaryGameSectionProps = {
  givens: BinaryGivens;
  playState: BinaryPlayState;
  maxWidth: number;
  board: BinaryBoardState;
  cardStyle?: StyleProp<ViewStyle>;
  /** DIFF-03 signature beat — board animation in Task 2. */
  signature?: SignatureMoment;
};

export default function BinaryGameSection({
  givens,
  playState,
  maxWidth,
  board,
  cardStyle,
}: BinaryGameSectionProps) {
  return (
    <View className="flex-1">
      <View className="items-center">
        <HairlineCard
          className="w-full p-3"
          style={[{ maxWidth, alignSelf: 'center' }, cardStyle]}
        >
          <BinaryGrid
            givens={givens}
            playState={playState}
            selected={board.selected}
            conflictCells={board.conflicts}
            onPressCell={board.handlePress}
            onLongPressCell={board.handleLongPress}
            onDragStrokeBegin={board.beginDragStroke}
            onDragStrokeMove={board.moveDragStroke}
            onDragStrokeEnd={board.endDragStroke}
          />
        </HairlineCard>
      </View>
    </View>
  );
}
