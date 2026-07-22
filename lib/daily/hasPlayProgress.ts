import { createEmptyGrid as createEmptyBinaryGrid } from '../puzzles/binary/grid';
import { createEmptyGrid as createEmptyNonogramGrid } from '../puzzles/nonogram/grid';
import { createEmptyPlayState as createEmptySlitherlinkPlayState } from '../puzzles/slitherlink/edges';
import { createEmptyGrid as createEmptySudokuGrid } from '../puzzles/sudoku/grid';
import type { GameType, PlayState } from '../puzzles/types';

function emptyPlayStateForGameType(gameType: GameType): PlayState {
  switch (gameType) {
    case 'sudoku':
      return createEmptySudokuGrid();
    case 'binary':
      return createEmptyBinaryGrid();
    case 'nonogram':
      return createEmptyNonogramGrid();
    default:
      return createEmptySlitherlinkPlayState();
  }
}

/**
 * True when playState differs from the type's empty factory.
 * Hydrate always materializes an empty playState — presence alone is not progress (D-06).
 */
export function hasPlayProgress(
  gameType: GameType,
  playState: PlayState | null | undefined,
): boolean {
  if (playState == null) return false;
  return (
    JSON.stringify(playState) !==
    JSON.stringify(emptyPlayStateForGameType(gameType))
  );
}
