import { generateBinaryPuzzle } from './binary/generator';
import { generateNonogramPuzzle } from './nonogram/generator';
import { getSlitherlinkBuiltinPuzzle } from './slitherlink/builtinPuzzle';
import { generateSlitherlinkPuzzle } from './slitherlink/generator';
import { generateSudokuPuzzle } from './sudoku/generator';
import type {
  BinaryPuzzle,
  GameType,
  PuzzlePayload,
  SlitherlinkPuzzle,
} from './types';
import { deriveSeed, deriveSubSeed, mulberry32 } from './rng';

const GAME_TYPES: GameType[] = ['sudoku', 'binary', 'nonogram', 'slitherlink'];

export type SelectDailyGameParams = {
  dateKey: string;
  seed?: number;
  /** gameType omitted → do not avoid repeating that type (dev refresh same type) */
  previous?: { gameType?: GameType; puzzleHash?: string };
  /** 开发/调试：跳过日期随机，强制题型 */
  forceGameType?: GameType;
};

export type SelectDailyGameResult = {
  gameType: GameType;
  seed: number;
  puzzle: PuzzlePayload;
  puzzleHash: string;
};

function pickGameType(
  rng: () => number,
  avoidType?: GameType,
): GameType {
  const pool =
    avoidType != null
      ? GAME_TYPES.filter((t) => t !== avoidType)
      : GAME_TYPES;
  const index = Math.floor(rng() * pool.length);
  return pool[index] ?? 'sudoku';
}

function buildSudokuPuzzle(
  seed: number,
  avoidHash?: string,
): { puzzle: PuzzlePayload; puzzleHash: string } {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const puzzle = generateSudokuPuzzle(
      deriveSubSeed(seed, `daily-sudo-${attempt}`),
    );
    if (avoidHash == null || puzzle.puzzleHash !== avoidHash) {
      return { puzzle, puzzleHash: puzzle.puzzleHash };
    }
  }
  const puzzle = generateSudokuPuzzle(deriveSubSeed(seed, 'daily-sudo-fallback'));
  return { puzzle, puzzleHash: puzzle.puzzleHash };
}

export function selectDailyGame(
  params: SelectDailyGameParams,
): SelectDailyGameResult {
  const seed = params.seed ?? deriveSeed(params.dateKey);
  const typeRng = mulberry32(deriveSubSeed(seed, 'type'));
  const avoidType = params.previous?.gameType;
  const gameType =
    params.forceGameType ?? pickGameType(typeRng, avoidType);

  if (gameType === 'sudoku') {
    const { puzzle, puzzleHash } = buildSudokuPuzzle(
      seed,
      params.previous?.puzzleHash,
    );
    return { gameType, seed, puzzle, puzzleHash };
  }

  if (gameType === 'binary') {
    const puzzle = buildBinaryPuzzle(seed, params.previous?.puzzleHash);
    return { gameType, seed, puzzle, puzzleHash: puzzle.puzzleHash };
  }

  if (gameType === 'nonogram') {
    const puzzle = buildNonogramPuzzle(seed, params.previous?.puzzleHash);
    return { gameType, seed, puzzle, puzzleHash: puzzle.puzzleHash };
  }

  const puzzle = buildSlitherlinkPuzzle(seed, params.previous?.puzzleHash);
  return { gameType, seed, puzzle, puzzleHash: puzzle.puzzleHash };
}

function buildNonogramPuzzle(seed: number, avoidHash?: string) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const puzzle = generateNonogramPuzzle(
      deriveSubSeed(seed, `daily-nono-${attempt}`),
    );
    if (avoidHash == null || puzzle.puzzleHash !== avoidHash) {
      return puzzle;
    }
  }
  return generateNonogramPuzzle(deriveSubSeed(seed, 'daily-nono-fallback'));
}

function buildBinaryPuzzle(seed: number, avoidHash?: string): BinaryPuzzle {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const puzzle = generateBinaryPuzzle(
      deriveSubSeed(seed, `daily-bin-${attempt}`),
    );
    if (avoidHash == null || puzzle.puzzleHash !== avoidHash) {
      return puzzle;
    }
  }
  const puzzle = generateBinaryPuzzle(deriveSubSeed(seed, 'daily-bin-fallback'));
  return puzzle;
}

function buildSlitherlinkPuzzle(
  seed: number,
  avoidHash?: string,
): SlitherlinkPuzzle {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const puzzle = generateSlitherlinkPuzzle(
      deriveSubSeed(seed, `daily-sl-${attempt}`),
    );
    if (avoidHash == null || puzzle.puzzleHash !== avoidHash) {
      return puzzle;
    }
  }
  return getSlitherlinkBuiltinPuzzle();
}
