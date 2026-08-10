import { View, type StyleProp, type ViewStyle } from 'react-native';

import type { useSudokuBoard } from '../../hooks/useSudokuBoard';
import type { SignatureMoment } from '../../lib/feel/signatureTokens';
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
  /** DIFF-03 signature beat — board animation in Task 2. */
  signature?: SignatureMoment;
};

/** Sudoku board only — numpad lives in GameScreenFooter (Host Desk Path B). */
export default function SudokuGameSection({
  givens,
  playState,
  maxWidth,
  board,
  cardStyle,
  signature = 'idle',
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
          signature={signature}
        />
      </HairlineCard>
    </View>
  );
}
