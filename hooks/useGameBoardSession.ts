import { useMemo } from 'react';

import { useBinaryBoard } from './useBinaryBoard';
import { useSudokuBoard } from './useSudokuBoard';
import { createEmptyGrid as createEmptyBinaryGrid } from '../lib/puzzles/binary/grid';
import { createEmptyGrid as createEmptySudokuGrid } from '../lib/puzzles/sudoku/grid';
import type {
  GameType,
  PlayState,
  PuzzlePayload,
} from '../lib/puzzles/types';
import { isBinaryPuzzle, isSudokuPuzzle } from '../lib/puzzles/types';
import type { HydrateStatus } from '../contexts/DailyGameContext';

export const GAME_TYPE_LABEL: Record<GameType, string> = {
  sudoku: '数独',
  binary: '二进制',
};

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
  const isSudoku =
    gameType === 'sudoku' && puzzle != null && isSudokuPuzzle(puzzle);
  const isBinary =
    gameType === 'binary' && puzzle != null && isBinaryPuzzle(puzzle);

  const sudokuGivens = isSudoku ? puzzle.givens : null;
  const binaryGivens = isBinary ? puzzle.givens : null;

  const sudokuPlay =
    isSudoku && playState != null ? playState : createEmptySudokuGrid();
  const binaryPlay =
    isBinary && playState != null ? playState : createEmptyBinaryGrid();

  const sudokuBoard = useSudokuBoard({
    givens: sudokuGivens ?? createEmptySudokuGrid(),
    playState: sudokuPlay,
    updatePlayState,
  });

  const binaryBoard = useBinaryBoard({
    givens: binaryGivens ?? createEmptyBinaryGrid(),
    playState: binaryPlay,
    updatePlayState,
  });

  const showBoardChrome = useMemo(
    () => (isSudoku || isBinary) && status === 'playing',
    [isSudoku, isBinary, status],
  );

  const showReload = status === 'playing' && !isSudoku && !isBinary;

  const canComplete = isSudoku
    ? sudokuBoard.canComplete
    : isBinary
      ? binaryBoard.canComplete
      : false;

  const statusHint = isSudoku
    ? sudokuBoard.statusHint
    : isBinary
      ? binaryBoard.statusHint
      : null;

  const typeLabel =
    gameType != null ? (GAME_TYPE_LABEL[gameType] ?? gameType) : '…';

  return {
    isSudoku,
    isBinary,
    sudokuGivens,
    binaryGivens,
    sudokuPlay,
    binaryPlay,
    sudokuBoard,
    binaryBoard,
    showBoardChrome,
    showReload,
    canComplete,
    statusHint,
    typeLabel,
  };
}
