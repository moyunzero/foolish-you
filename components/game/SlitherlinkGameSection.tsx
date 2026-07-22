import { View, type StyleProp, type ViewStyle } from 'react-native';

import type { useSlitherlinkBoard } from '../../hooks/useSlitherlinkBoard';
import type { EdgeOrientation } from '../../lib/puzzles/slitherlink/spec';
import type { SlitherlinkPlayState, SlitherlinkPuzzle } from '../../lib/puzzles/types';
import SlitherlinkBoard from '../slitherlink/SlitherlinkBoard';
import HairlineCard from '../ui/HairlineCard';

type SlitherlinkBoardState = ReturnType<typeof useSlitherlinkBoard>;

type SlitherlinkGameSectionProps = {
  puzzle: SlitherlinkPuzzle;
  playState: SlitherlinkPlayState;
  maxWidth: number;
  board: SlitherlinkBoardState;
  cardStyle?: StyleProp<ViewStyle>;
  /** Fired on any board interaction (D-03). */
  onBoardInteract?: () => void;
};

export default function SlitherlinkGameSection({
  puzzle,
  playState,
  maxWidth,
  board,
  cardStyle,
  onBoardInteract,
}: SlitherlinkGameSectionProps) {
  return (
    <View className="flex-1">
      <View className="items-center">
        <HairlineCard
          className="w-full p-3"
          style={[{ maxWidth, alignSelf: 'center' }, cardStyle]}
        >
          <SlitherlinkBoard
            puzzle={puzzle}
            playState={playState}
            conflicts={board.conflicts}
            selectedEdge={board.selectedEdge}
            onPressEdge={(
              orientation: EdgeOrientation,
              row: number,
              col: number,
            ) => {
              onBoardInteract?.();
              board.handlePressEdge(orientation, row, col);
            }}
            onLongPressEdge={(
              orientation: EdgeOrientation,
              row: number,
              col: number,
            ) => {
              onBoardInteract?.();
              board.handleLongPressEdge(orientation, row, col);
            }}
            maxWidth={maxWidth}
          />
        </HairlineCard>
      </View>
    </View>
  );
}
