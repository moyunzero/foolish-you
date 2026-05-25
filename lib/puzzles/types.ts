export type GameType = 'sudoku' | 'binary' | 'nonogram';

export type DailyStatus = 'playing' | 'completed' | 'abandoned';

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

export type NonogramCellState = -1 | 0 | 1;

export type NonogramPlayState = NonogramCellState[][];

export type NonogramPuzzle = {
  kind: 'nonogram';
  rows: number;
  cols: number;
  rowClues: number[][];
  colClues: number[][];
  solution: boolean[][];
  pictureTitle: string;
  puzzleHash: string;
};

export type PuzzlePayload = SudokuPuzzle | BinaryPuzzle | NonogramPuzzle;

export type PlayState = SudokuPlayState | BinaryPlayState | NonogramPlayState;

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

export function isNonogramPuzzle(
  puzzle: PuzzlePayload,
): puzzle is NonogramPuzzle {
  return puzzle.kind === 'nonogram';
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
  lastGameType?: GameType;
  lastPuzzleHash?: string;
};
