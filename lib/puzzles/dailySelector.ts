import { AVOID_HASH_MAX_ATTEMPTS } from '../../constants/config';
import { DEFAULT_MASTERY_STATE } from '../mastery/defaults';
import { resolveTargetTier } from '../mastery/resolveTargetTier';
import type { MasteryState } from '../mastery/types';
import { generateBinaryPuzzleForTier } from './binary/generateForTier';
import type { DifficultyTier } from './difficulty/tiers';
import { generateNonogramPuzzleForTier } from './nonogram/generateForTier';
import { deriveSeed, deriveSubSeed, mulberry32 } from './rng';
import { generateSlitherlinkPuzzleForTier } from './slitherlink/generateForTier';
import { generateSudokuPuzzleForTier } from './sudoku/generateForTier';
import type { GameType, PuzzlePayload } from './types';

const GAME_TYPES: GameType[] = ['sudoku', 'binary', 'nonogram', 'slitherlink'];

export type SelectDailyGameParams = {
  dateKey: string;
  seed?: number;
  /** gameType omitted → do not avoid repeating that type (dev refresh same type) */
  previous?: { gameType?: GameType; puzzleHash?: string };
  /** 开发/调试：跳过日期随机，强制题型 */
  forceGameType?: GameType;
  /** Personal mastery; omitted → DEFAULT_MASTERY_STATE (gallery-compatible). */
  mastery?: MasteryState;
  /** Per-type played-hash ring to skip within avoid budget. */
  avoidByType?: Partial<Record<GameType, readonly string[]>>;
  /** Clock for FSRS retrievability soften in resolveTargetTier. */
  nowMs?: number;
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

function buildAvoidSet(
  gameType: GameType,
  avoidByType: SelectDailyGameParams['avoidByType'],
  previousHash?: string,
): ReadonlySet<string> {
  const avoid = new Set<string>(avoidByType?.[gameType] ?? []);
  if (previousHash != null) {
    avoid.add(previousHash);
  }
  return avoid;
}

function generatePuzzleForTier(
  gameType: GameType,
  attemptSeed: number,
  targetTier: DifficultyTier,
): { puzzle: PuzzlePayload; puzzleHash: string } {
  if (gameType === 'sudoku') {
    const { puzzle } = generateSudokuPuzzleForTier(attemptSeed, targetTier);
    return { puzzle, puzzleHash: puzzle.puzzleHash };
  }
  if (gameType === 'binary') {
    const { puzzle } = generateBinaryPuzzleForTier(attemptSeed, targetTier);
    return { puzzle, puzzleHash: puzzle.puzzleHash };
  }
  if (gameType === 'nonogram') {
    const { puzzle } = generateNonogramPuzzleForTier(attemptSeed, targetTier);
    return { puzzle, puzzleHash: puzzle.puzzleHash };
  }
  const { puzzle } = generateSlitherlinkPuzzleForTier(attemptSeed, targetTier);
  return { puzzle, puzzleHash: puzzle.puzzleHash };
}

function tryGeneratePuzzleForTier(
  gameType: GameType,
  attemptSeed: number,
  targetTier: DifficultyTier,
): { puzzle: PuzzlePayload; puzzleHash: string } | null {
  try {
    return generatePuzzleForTier(gameType, attemptSeed, targetTier);
  } catch {
    // forTier may throw when a seed cannot meet the tier (e.g. SL Easy);
    // treat as a failed attempt and continue the outer avoid budget.
    return null;
  }
}

/**
 * Outer avoid loop over played-hash ring ∪ previous.puzzleHash.
 * Exhaustion relaxes avoid but still uses generate*ForTier (D-05/D-06).
 */
function buildPuzzleWithAvoid(
  gameType: GameType,
  seed: number,
  targetTier: DifficultyTier,
  avoid: ReadonlySet<string>,
): { puzzle: PuzzlePayload; puzzleHash: string } {
  for (let attempt = 0; attempt < AVOID_HASH_MAX_ATTEMPTS; attempt += 1) {
    const attemptSeed = deriveSubSeed(
      seed,
      `daily-avoid-${gameType}-${attempt}`,
    );
    const built = tryGeneratePuzzleForTier(gameType, attemptSeed, targetTier);
    if (built != null && !avoid.has(built.puzzleHash)) {
      return built;
    }
  }

  const relaxed = tryGeneratePuzzleForTier(
    gameType,
    deriveSubSeed(seed, `daily-avoid-${gameType}-relax`),
    targetTier,
  );
  if (relaxed != null) {
    return relaxed;
  }

  // Rare: forTier threw across avoid budget + relax — keep seeking a forTier
  // puzzle (still never builtin / never getFallbackDailySelection).
  for (let attempt = 0; attempt < AVOID_HASH_MAX_ATTEMPTS; attempt += 1) {
    const built = tryGeneratePuzzleForTier(
      gameType,
      deriveSubSeed(seed, `daily-avoid-${gameType}-recover-${attempt}`),
      targetTier,
    );
    if (built != null) {
      return built;
    }
  }

  throw new Error(
    `Failed to generate ${gameType} for tier ${targetTier} after avoid retries`,
  );
}

export function selectDailyGame(
  params: SelectDailyGameParams,
): SelectDailyGameResult {
  const seed = params.seed ?? deriveSeed(params.dateKey);
  const typeRng = mulberry32(deriveSubSeed(seed, 'type'));
  const avoidType = params.previous?.gameType;
  const gameType =
    params.forceGameType ?? pickGameType(typeRng, avoidType);

  const mastery = params.mastery ?? DEFAULT_MASTERY_STATE;
  const targetTier = resolveTargetTier({
    gameType,
    mastery,
    dateKey: params.dateKey,
    nowMs: params.nowMs,
  });

  const avoid = buildAvoidSet(
    gameType,
    params.avoidByType,
    params.previous?.puzzleHash,
  );
  const { puzzle, puzzleHash } = buildPuzzleWithAvoid(
    gameType,
    seed,
    targetTier,
    avoid,
  );

  return { gameType, seed, puzzle, puzzleHash };
}
