import { View, type StyleProp, type ViewStyle } from 'react-native';

import type { useSudokuBoard } from '../../hooks/useSudokuBoard';
import type { SudokuGivens, SudokuPlayState } from '../../lib/puzzles/types';
import SudokuGrid from '../grid/SudokuGrid';
import SudokuNumpad from '../grid/SudokuNumpad';
import HairlineCard from '../ui/HairlineCard';

type SudokuBoardState = ReturnType<typeof useSudokuBoard>;

type SudokuGameSectionProps = {
  givens: SudokuGivens;
  playState: SudokuPlayState;
  maxWidth: number;
  board: SudokuBoardState;
  cardStyle?: StyleProp<ViewStyle>;
  /** Fired on any board interaction including cell select (D-03). */
  onBoardInteract?: () => void;
};

export default function SudokuGameSection({
  givens,
  playState,
  maxWidth,
  board,
  cardStyle,
  onBoardInteract,
}: SudokuGameSectionProps) {
  return (
    <View className="flex-1">
      <View className="items-center">
        <HairlineCard
          className="w-full p-3"
          style={[{ maxWidth, alignSelf: 'center' }, cardStyle]}
        >
          <SudokuGrid
            givens={givens}
            playState={playState}
            selected={board.selected}
            conflictCells={board.conflicts}
            onSelectCell={(row, col) => {
              onBoardInteract?.();
              board.handleSelect(row, col);
            }}
            onLongPressCell={(row, col) => {
              onBoardInteract?.();
              board.handleLongPress(row, col);
            }}
          />
        </HairlineCard>
      </View>

      <View className="mt-5">
        <SudokuNumpad
          onDigit={(digit) => {
            onBoardInteract?.();
            board.handleDigit(digit);
          }}
          onClear={() => {
            onBoardInteract?.();
            board.handleClear();
          }}
          disabled={board.numpadDisabled}
          dimmedDigits={board.dimmedDigits}
        />
      </View>
    </View>
  );
}
