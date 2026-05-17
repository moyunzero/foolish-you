export type GameType = 'sudoku' | 'binary';

export type DailyStatus = 'playing' | 'completed' | 'abandoned';

/** @deprecated Phase 1 占位，hydrate 时迁移为 puzzle */
export type PuzzleStub = {
  kind: GameType;
  placeholder: true;
};

export type SudokuGivens = number[][];
export type SudokuPlayState = number[][];

export type SudokuPuzzle = {
  kind: 'sudoku';
  givens: SudokuGivens;
  puzzleHash: string;
};

export type BinaryGivens = number[][];
export type BinaryPlayState = number[][];

export type BinaryPuzzle = {
  kind: 'binary';
  givens: BinaryGivens;
  puzzleHash: string;
};

/** @deprecated 迁移用；新数据为 BinaryPuzzle */
export type BinaryPuzzleStub = {
  kind: 'binary';
  placeholder: true;
};

export type PuzzlePayload = SudokuPuzzle | BinaryPuzzle | BinaryPuzzleStub;

export type PlayState = SudokuPlayState | BinaryPlayState;

export function isSudokuPuzzle(
  puzzle: PuzzlePayload,
): puzzle is SudokuPuzzle {
  return puzzle.kind === 'sudoku';
}

export function isBinaryPuzzle(
  puzzle: PuzzlePayload,
): puzzle is BinaryPuzzle {
  return puzzle.kind === 'binary' && 'givens' in puzzle;
}

export function isBinaryPuzzleStub(
  puzzle: PuzzlePayload,
): puzzle is BinaryPuzzleStub {
  return puzzle.kind === 'binary' && 'placeholder' in puzzle;
}

export type DailySnapshot = {
  version: number;
  dateKey: string;
  gameType: GameType;
  seed: number;
  status: DailyStatus;
  puzzle: PuzzlePayload;
  puzzleHash: string;
  playState?: PlayState;
  /** 本局开始时间（用于结果页用时文案） */
  startedAt?: number;
  /** 完成或放弃时间 */
  finishedAt?: number;
  /** @deprecated 仅用于从 Phase 1 数据迁移 */
  puzzleStub?: PuzzleStub;
  lastGameType?: GameType;
  lastPuzzleHash?: string;
};
