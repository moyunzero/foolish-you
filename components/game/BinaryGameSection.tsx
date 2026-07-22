import { View, type StyleProp, type ViewStyle } from 'react-native';

import type { useBinaryBoard } from '../../hooks/useBinaryBoard';
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
  /** Fired on any board interaction (D-03). */
  onBoardInteract?: () => void;
};

export default function BinaryGameSection({
  givens,
  playState,
  maxWidth,
  board,
  cardStyle,
  onBoardInteract,
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
            onPressCell={(row, col) => {
              onBoardInteract?.();
              board.handlePress(row, col);
            }}
            onLongPressCell={(row, col) => {
              onBoardInteract?.();
              board.handleLongPress(row, col);
            }}
          />
        </HairlineCard>
      </View>
    </View>
  );
}
