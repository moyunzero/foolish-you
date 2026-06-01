import { useMemo } from 'react';

import { useBinaryBoard } from './useBinaryBoard';
import { useNonogramBoard } from './useNonogramBoard';
import { useSlitherlinkBoard } from './useSlitherlinkBoard';
import { useSudokuBoard } from './useSudokuBoard';
import { createEmptyGrid as createEmptyBinaryGrid } from '../lib/puzzles/binary/grid';
import { createEmptyGrid as createEmptyNonogramGrid } from '../lib/puzzles/nonogram/grid';
import { computeClues } from '../lib/puzzles/nonogram/clues';
import { patternSolution, NONOGRAM_PATTERNS } from '../lib/puzzles/nonogram/patterns';
import { NONOGRAM_COLS, NONOGRAM_ROWS } from '../lib/puzzles/nonogram/spec';
import { getSlitherlinkBuiltinPuzzle } from '../lib/puzzles/slitherlink/builtinPuzzle';
import { createEmptyPlayState as createEmptySlitherlinkPlayState } from '../lib/puzzles/slitherlink/edges';
import { createEmptyGrid as createEmptySudokuGrid } from '../lib/puzzles/sudoku/grid';
import type {
  GameType,
  NonogramPuzzle,
  NonogramPlayState,
  PlayState,
  PuzzlePayload,
  SlitherlinkPlayState,
  SlitherlinkPuzzle,
} from '../lib/puzzles/types';
import {
  isBinaryPuzzle,
  isNonogramPuzzle,
  isSlitherlinkPuzzle,
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

const SLITHERLINK_HOOK_STUB: SlitherlinkPuzzle = getSlitherlinkBuiltinPuzzle();

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
  const isSlitherlink =
    gameType === 'slitherlink' && puzzle != null && isSlitherlinkPuzzle(puzzle);

  const sudokuGivens = isSudoku ? puzzle.givens : null;
  const binaryGivens = isBinary ? puzzle.givens : null;
  const nonogramPuzzle = isNonogram ? puzzle : NONOGRAM_HOOK_STUB;
  const slitherlinkPuzzle = isSlitherlink ? puzzle : SLITHERLINK_HOOK_STUB;

  const sudokuPlay =
    isSudoku && playState != null && Array.isArray(playState)
      ? playState
      : createEmptySudokuGrid();
  const binaryPlay =
    isBinary && playState != null && Array.isArray(playState)
      ? playState
      : createEmptyBinaryGrid();
  const nonogramPlay: NonogramPlayState =
    isNonogram && playState != null && Array.isArray(playState)
      ? (playState as NonogramPlayState)
      : createEmptyNonogramGrid();
  const slitherlinkPlay: SlitherlinkPlayState =
    isSlitherlink && playState != null && !Array.isArray(playState)
      ? playState
      : createEmptySlitherlinkPlayState();

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

  const slitherlinkBoard = useSlitherlinkBoard({
    puzzle: slitherlinkPuzzle,
    playState: slitherlinkPlay,
    updatePlayState: (next) => updatePlayState(next),
  });

  const showBoardChrome = useMemo(
    () =>
      (isSudoku || isBinary || isNonogram || isSlitherlink) &&
      status === 'playing',
    [isSudoku, isBinary, isNonogram, isSlitherlink, status],
  );

  const showReload =
    status === 'playing' &&
    !isSudoku &&
    !isBinary &&
    !isNonogram &&
    !isSlitherlink;

  const canComplete = isSudoku
    ? sudokuBoard.canComplete
    : isBinary
      ? binaryBoard.canComplete
      : isNonogram
        ? nonogramBoard.canComplete
        : isSlitherlink
          ? slitherlinkBoard.canComplete
          : false;

  const statusHint = isSudoku
    ? sudokuBoard.statusHint
    : isBinary
      ? binaryBoard.statusHint
      : isNonogram
        ? nonogramBoard.statusHint
        : isSlitherlink
          ? slitherlinkBoard.statusHint
          : null;

  const typeLabel =
    gameType != null ? getGameTypeLabel(gameType, locale) : '…';

  return {
    isSudoku,
    isBinary,
    isNonogram,
    isSlitherlink,
    sudokuGivens,
    binaryGivens,
    nonogramPuzzle: isNonogram ? puzzle : null,
    slitherlinkPuzzle: isSlitherlink ? puzzle : null,
    sudokuPlay,
    binaryPlay,
    nonogramPlay,
    slitherlinkPlay,
    sudokuBoard,
    binaryBoard,
    nonogramBoard,
    slitherlinkBoard,
    showBoardChrome,
    showReload,
    canComplete,
    statusHint,
    typeLabel,
  };
}
