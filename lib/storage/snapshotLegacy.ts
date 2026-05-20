import type {
  BinaryPuzzle,
  DailyStatus,
  GameType,
  PlayState,
  SudokuPuzzle,
} from '../puzzles/types';

/** Phase 1 on-disk placeholder; normalized away at STORAGE_VERSION 2. */
export type PersistedPuzzlePlaceholder = {
  kind: GameType;
  placeholder: true;
};

/** Raw JSON shape accepted on load (includes v1 legacy fields). */
export type PersistedSnapshot = {
  version?: number;
  dateKey: string;
  gameType: GameType;
  seed: number;
  status: DailyStatus;
  puzzle: SudokuPuzzle | BinaryPuzzle | PersistedPuzzlePlaceholder;
  puzzleHash: string;
  playState?: PlayState;
  startedAt?: number;
  finishedAt?: number;
  puzzleStub?: PersistedPuzzlePlaceholder;
  lastGameType?: GameType;
  lastPuzzleHash?: string;
};

export function isPersistedPuzzlePlaceholder(
  puzzle: unknown,
): puzzle is PersistedPuzzlePlaceholder {
  if (puzzle == null || typeof puzzle !== 'object') return false;
  const p = puzzle as Record<string, unknown>;
  return (
    (p.kind === 'sudoku' || p.kind === 'binary') && p.placeholder === true
  );
}

export function snapshotNeedsV2Upgrade(persisted: PersistedSnapshot): boolean {
  const version = persisted.version ?? 0;
  return (
    version < 2 ||
    persisted.puzzleStub != null ||
    isPersistedPuzzlePlaceholder(persisted.puzzle)
  );
}
