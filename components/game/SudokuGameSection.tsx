import { View, type StyleProp, type ViewStyle } from 'react-native';

import type { useSudokuBoard } from '../../hooks/useSudokuBoard';
import type { SudokuGivens, SudokuPlayState } from '../../lib/puzzles/types';
import SudokuGrid from '../grid/SudokuGrid';
import HairlineCard from '../ui/HairlineCard';

type SudokuBoardState = ReturnType<typeof useSudokuBoard>;

type SudokuGameSectionProps = {
  givens: SudokuGivens;
  playState: SudokuPlayState;
  maxWidth: number;
  board: SudokuBoardState;
  cardStyle?: StyleProp<ViewStyle>;
};

/** Sudoku board only — numpad lives in GameScreenFooter (Host Desk Path B). */
export default function SudokuGameSection({
  givens,
  playState,
  maxWidth,
  board,
  cardStyle,
}: SudokuGameSectionProps) {
  return (
    <View className="flex-1 items-center justify-center">
      <HairlineCard
        className="w-full p-3"
        style={[{ maxWidth, alignSelf: 'center' }, cardStyle]}
      >
        <SudokuGrid
          givens={givens}
          playState={playState}
          sudokuNotes={board.sudokuNotes}
          selected={board.selected}
          conflictCells={board.conflicts}
          onSelectCell={board.handleSelect}
          onLongPressCell={board.handleLongPress}
        />
      </HairlineCard>
    </View>
  );
}
