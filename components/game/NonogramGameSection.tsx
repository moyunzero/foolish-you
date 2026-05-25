import { View, type StyleProp, type ViewStyle } from 'react-native';

import type { useNonogramBoard } from '../../hooks/useNonogramBoard';
import type { NonogramPlayState, NonogramPuzzle } from '../../lib/puzzles/types';
import NonogramGrid from '../grid/NonogramGrid';
import HairlineCard from '../ui/HairlineCard';

type NonogramBoardState = ReturnType<typeof useNonogramBoard>;

type NonogramGameSectionProps = {
  puzzle: NonogramPuzzle;
  playState: NonogramPlayState;
  maxWidth: number;
  board: NonogramBoardState;
  cardStyle?: StyleProp<ViewStyle>;
};

export default function NonogramGameSection({
  puzzle,
  playState,
  maxWidth,
  board,
  cardStyle,
}: NonogramGameSectionProps) {
  return (
    <View className="flex-1">
      <View className="items-center">
        <HairlineCard
          className="w-full p-3"
          style={[{ maxWidth, alignSelf: 'center' }, cardStyle]}
        >
          <NonogramGrid
            rows={puzzle.rows}
            cols={puzzle.cols}
            rowClues={puzzle.rowClues}
            colClues={puzzle.colClues}
            playState={playState}
            selected={board.selected}
            maxWidth={maxWidth - 24}
            onPressCell={board.handlePress}
            onLongPressCell={board.handleLongPress}
          />
        </HairlineCard>
      </View>
    </View>
  );
}
