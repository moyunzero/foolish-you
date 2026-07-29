/**
 * Dev dry-run: print id → weekdayTier / difficultyTier / peak / sweeps / probes.
 * Not imported by app or lib runtime.
 *
 * Usage: npx tsx scripts/freeze-nonogram-difficulty-tiers.ts
 */
import { computeClues } from '../lib/puzzles/nonogram/clues';
import {
  NONOGRAM_PATTERNS,
  patternSolution,
} from '../lib/puzzles/nonogram/patterns';
import { rateNonogram } from '../lib/puzzles/nonogram/rater';

const hist: Record<string, number> = {
  easy: 0,
  medium: 0,
  hard: 0,
  expert: 0,
};

console.log('id,weekdayTier,difficultyTier,peak,sweeps,probes,status');

for (const pattern of NONOGRAM_PATTERNS) {
  const { rowClues, colClues } = computeClues(patternSolution(pattern));
  const rated = rateNonogram(rowClues, colClues);
  if (rated.status !== 'solved') {
    console.log(
      [
        pattern.id,
        pattern.tier,
        pattern.difficultyTier ?? '',
        rated.peak ?? '',
        '',
        '',
        rated.status,
      ].join(','),
    );
    continue;
  }
  hist[rated.tier] = (hist[rated.tier] ?? 0) + 1;
  console.log(
    [
      pattern.id,
      pattern.tier,
      rated.tier,
      rated.peak,
      rated.sweepCount,
      rated.probeCount,
      'solved',
    ].join(','),
  );
}

console.error('--- audit hist ---');
console.error(JSON.stringify(hist));
console.error(
  'sum',
  Object.values(hist).reduce((a, b) => a + b, 0),
);
