import { DEV_TOOLS_ENABLED } from '../../constants/dev';
import { createEmptyGrid as createEmptyBinaryGrid } from '../puzzles/binary/grid';
import { createEmptyGrid as createEmptyNonogramGrid } from '../puzzles/nonogram/grid';
import { createEmptyPlayState as createEmptySlitherlinkPlayState } from '../puzzles/slitherlink/edges';
import { createEmptyGrid as createEmptySudokuGrid } from '../puzzles/sudoku/grid';
import type { DailySnapshot } from '../puzzles/types';
import { loadDailySnapshot, saveDailySnapshot } from '../storage/dailyStorage';

function emptyPlayStateFor(snapshot: DailySnapshot) {
  if (snapshot.gameType === 'sudoku') return createEmptySudokuGrid();
  if (snapshot.gameType === 'binary') return createEmptyBinaryGrid();
  if (snapshot.gameType === 'nonogram') return createEmptyNonogramGrid();
  return createEmptySlitherlinkPlayState();
}

/** __DEV__: status=completed but empty board → triggers recover on next load. */
export async function devInjectCompletedEmptyPlayState(): Promise<boolean> {
  if (!DEV_TOOLS_ENABLED) return false;
  const snapshot = await loadDailySnapshot();
  if (snapshot == null) return false;
  const saved = await saveDailySnapshot({
    ...snapshot,
    status: 'completed',
    playState: emptyPlayStateFor(snapshot),
    finishedAt: Date.now(),
  });
  return saved;
}
