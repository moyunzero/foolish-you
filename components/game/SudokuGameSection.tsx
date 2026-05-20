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
};

export default function SudokuGameSection({
  givens,
  playState,
  maxWidth,
  board,
  cardStyle,
}: SudokuGameSectionProps) {
  return (
    <View className="mt-3 flex-1">
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
            onSelectCell={board.handleSelect}
          />
        </HairlineCard>
      </View>

      <View className="mt-5">
        <SudokuNumpad
          onDigit={board.handleDigit}
          onClear={board.handleClear}
          disabled={board.numpadDisabled}
          dimmedDigits={board.dimmedDigits}
        />
      </View>
    </View>
  );
}
