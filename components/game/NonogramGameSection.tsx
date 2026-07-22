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
  /** Fired on any board interaction (D-03). */
  onBoardInteract?: () => void;
};

export default function NonogramGameSection({
  puzzle,
  playState,
  maxWidth,
  board,
  cardStyle,
  onBoardInteract,
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
