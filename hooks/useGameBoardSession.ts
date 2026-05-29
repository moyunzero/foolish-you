import { useMemo } from 'react';

import { useBinaryBoard } from './useBinaryBoard';
import { useNonogramBoard } from './useNonogramBoard';
import { useSudokuBoard } from './useSudokuBoard';
import { createEmptyGrid as createEmptyBinaryGrid } from '../lib/puzzles/binary/grid';
import { createEmptyGrid as createEmptyNonogramGrid } from '../lib/puzzles/nonogram/grid';
import { computeClues } from '../lib/puzzles/nonogram/clues';
import { patternSolution, NONOGRAM_PATTERNS } from '../lib/puzzles/nonogram/patterns';
import { NONOGRAM_COLS, NONOGRAM_ROWS } from '../lib/puzzles/nonogram/spec';
import { createEmptyGrid as createEmptySudokuGrid } from '../lib/puzzles/sudoku/grid';
import type {
  GameType,
  NonogramPuzzle,
  NonogramPlayState,
  PlayState,
  PuzzlePayload,
} from '../lib/puzzles/types';
import {
  isBinaryPuzzle,
  isNonogramPuzzle,
  isSudokuPuzzle,
} from '../lib/puzzles/types';
import type { HydrateStatus } from '../contexts/DailyGameContext';
import { useI18n } from '../lib/i18n';
import { getGameTypeLabel } from '../lib/i18n/gameLabels';

const NONOGRAM_HOOK_STUB: NonogramPuzzle = (() => {
  const pattern = NONOGRAM_PATTERNS[0]!;
  const solution = patternSolution(pattern);
  const { rowClues, colClues } = computeClues(solution);
  return {
    kind: 'nonogram',
    rows: NONOGRAM_ROWS,
    cols: NONOGRAM_COLS,
    rowClues,
    colClues,
    solution,
    pictureTitle: pattern.id,
    puzzleHash: 'stub',
  };
})();

type UseGameBoardSessionParams = {
  gameType: GameType | null;
  puzzle: PuzzlePayload | null;
  playState: PlayState | null;
  status: HydrateStatus;
  updatePlayState: (next: PlayState) => void;
};

export function useGameBoardSession({
  gameType,
  puzzle,
  playState,
  status,
  updatePlayState,
}: UseGameBoardSessionParams) {
  const { locale } = useI18n();
  const isSudoku =
    gameType === 'sudoku' && puzzle != null && isSudokuPuzzle(puzzle);
  const isBinary =
    gameType === 'binary' && puzzle != null && isBinaryPuzzle(puzzle);
  const isNonogram =
    gameType === 'nonogram' && puzzle != null && isNonogramPuzzle(puzzle);

  const sudokuGivens = isSudoku ? puzzle.givens : null;
  const binaryGivens = isBinary ? puzzle.givens : null;
  const nonogramPuzzle = isNonogram ? puzzle : NONOGRAM_HOOK_STUB;

  const sudokuPlay =
    isSudoku && playState != null ? playState : createEmptySudokuGrid();
  const binaryPlay =
    isBinary && playState != null ? playState : createEmptyBinaryGrid();
  const nonogramPlay: NonogramPlayState =
    isNonogram && playState != null
      ? (playState as NonogramPlayState)
      : createEmptyNonogramGrid();

  const sudokuBoard = useSudokuBoard({
    givens: sudokuGivens ?? createEmptySudokuGrid(),
    playState: sudokuPlay,
    updatePlayState: (next) => updatePlayState(next),
  });

  const binaryBoard = useBinaryBoard({
    givens: binaryGivens ?? createEmptyBinaryGrid(),
    playState: binaryPlay,
    updatePlayState: (next) => updatePlayState(next),
  });

  const nonogramBoard = useNonogramBoard({
    puzzle: nonogramPuzzle,
    playState: nonogramPlay,
    updatePlayState: (next) => updatePlayState(next),
  });

  const showBoardChrome = useMemo(
    () => (isSudoku || isBinary || isNonogram) && status === 'playing',
    [isSudoku, isBinary, isNonogram, status],
  );

  const showReload =
    status === 'playing' && !isSudoku && !isBinary && !isNonogram;

  const canComplete = isSudoku
    ? sudokuBoard.canComplete
    : isBinary
      ? binaryBoard.canComplete
      : isNonogram
        ? nonogramBoard.canComplete
        : false;

  const statusHint = isSudoku
    ? sudokuBoard.statusHint
    : isBinary
      ? binaryBoard.statusHint
      : isNonogram
        ? nonogramBoard.statusHint
        : null;

  const typeLabel =
    gameType != null ? getGameTypeLabel(gameType, locale) : '…';

  return {
    isSudoku,
    isBinary,
    isNonogram,
    sudokuGivens,
    binaryGivens,
    nonogramPuzzle: isNonogram ? puzzle : null,
    sudokuPlay,
    binaryPlay,
    nonogramPlay,
    sudokuBoard,
    binaryBoard,
    nonogramBoard,
    showBoardChrome,
    showReload,
    canComplete,
    statusHint,
    typeLabel,
  };
}
