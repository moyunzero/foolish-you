import { selectDailyGame, type SelectDailyGameParams, type SelectDailyGameResult } from './dailySelector';
import { getFallbackDailySelection } from './fallbackPuzzles';
import { isPuzzleSolvable } from './isSolvable';
import { deriveSeed, deriveSubSeed } from './rng';

/**
 * Like `selectDailyGame`, but verifies solvability and falls back to static puzzles.
 * Fallback does not preserve dateKey-level puzzle determinism (disaster path only).
 */
export function selectDailyGameSafe(
  params: SelectDailyGameParams,
): SelectDailyGameResult {
  const baseSeed = params.seed ?? deriveSeed(params.dateKey);
  let lastCandidate: SelectDailyGameResult | null = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const attemptSeed =
      attempt === 0 ? baseSeed : deriveSubSeed(baseSeed, 'solvable-retry');
    const candidate = selectDailyGame({ ...params, seed: attemptSeed });
    lastCandidate = candidate;
    if (isPuzzleSolvable(candidate.gameType, candidate.puzzle)) {
      return candidate;
    }
    if (__DEV__) {
      console.warn(
        '[dailySelectorSafe] unsolvable candidate',
        params.dateKey,
        candidate.gameType,
        'attempt',
        attempt,
      );
    }
  }

  const gameType =
    params.forceGameType ?? lastCandidate?.gameType ?? 'sudoku';

  const fallback = getFallbackDailySelection(gameType);

  if (__DEV__) {
    console.warn(
      '[dailySelectorSafe] using fallback puzzle (not dateKey-deterministic)',
      params.dateKey,
      gameType,
      'puzzleHash',
      fallback.puzzleHash,
      'seed',
      fallback.seed,
    );
  }

  return fallback;
}
