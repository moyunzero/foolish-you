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
};

export default function BinaryGameSection({
  givens,
  playState,
  maxWidth,
  board,
  cardStyle,
}: BinaryGameSectionProps) {
  return (
    <View className="mt-3 flex-1">
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
          />
        </HairlineCard>
      </View>
    </View>
  );
}
