import { DIFFICULTY_TIERS } from '../../../../lib/puzzles/difficulty/tiers';
import { computeClues } from '../../../../lib/puzzles/nonogram/clues';
import {
  NONOGRAM_PATTERNS,
  patternSolution,
  patternsForDifficultyTier,
} from '../../../../lib/puzzles/nonogram/patterns';
import { rateNonogram } from '../../../../lib/puzzles/nonogram/rater';
import { NONOGRAM_COLS, NONOGRAM_FILL, NONOGRAM_ROWS } from '../../../../lib/puzzles/nonogram/spec';
import { applyTransform } from '../../../../lib/puzzles/nonogram/transform';
import { isCompleteAndValid } from '../../../../lib/puzzles/nonogram/validate';
import { patterns as enPatterns } from '../../../../locales/en/patterns';
import { patterns as zhPatterns } from '../../../../locales/zh/patterns';

/** Frozen pre-v2.4.2-02 id order (D-09 / D-11 append-only prefix lock). */
const PREFIX_IDS = [
  'silly-face',
  'silly-cat',
  'ghost',
  'heart',
  'star',
  'rocket',
  'mushroom',
  'duck',
  'apple',
  'cherry',
  'fish',
  'tree',
  'house',
  'moon',
  'sun',
  'cloud',
  'cup',
  'bell',
  'bow',
  'crown',
  'skull',
  'balloon',
  'pizza',
  'ice-cream',
  'carrot',
  'paw',
  'note',
  'bolt',
  'anchor',
  'gem',
  'bagel',
  'snail',
  'pear',
  'leaf',
  'egg',
  'key',
  'worm',
  'taco',
  'cookie',
  'lamp',
  'sock',
  'hat',
  'bunny',
  'toast',
  'cactus',
  'donut',
  'umbrella',
  'spider',
  'frog',
  'kiwi',
  'whale',
  'cake',
  'guitar',
  'boot',
  'bottle',
  'laptop',
  'crab',
  'penguin',
  'train',
  'octopus',
  'spaceship',
  'castle',
  'robot',
  'dragon',
  'trophy',
  'sandwich',
  'teapot',
  'goblin',
  'rainbow',
  'monkey',
  'piano',
  'submarine',
  'helicopter',
  'volcano',
  'turtle',
  'camera',
  'fridge',
  'bicycle',
  'mask',
  'lighthouse',
  'dragonfly',
  'crystal',
  'spacesuit',
  'fireworks',
  'hammer',
  'snorkel',
  'satellite',
  'treasure',
  'phoenix',
  'compass',
] as const;

function filledCount(line: boolean[]): number {
  return line.filter(Boolean).length;
}

function clueFillSum(clues: number[]): number {
  return clues.filter((n) => n > 0).reduce((sum, n) => sum + n, 0);
}

describe('NONOGRAM_PATTERNS', () => {
  // D-20: after bucket growth, same dateKey may pick a different pattern across app versions — accepted.
  it('expands to exactly 120 patterns with unique ids and titles (D-01/D-03)', () => {
    expect(NONOGRAM_PATTERNS).toHaveLength(120);
    const ids = NONOGRAM_PATTERNS.map((p) => p.id);
    const titles = NONOGRAM_PATTERNS.map((p) => p.title);
    expect(new Set(ids).size).toBe(120);
    expect(new Set(titles).size).toBe(120);
  });

  it('keeps the first 90 pattern ids in original order (D-09/D-11 prefix lock)', () => {
    expect(PREFIX_IDS).toHaveLength(90);
    expect(NONOGRAM_PATTERNS.slice(0, 90).map((p) => p.id)).toEqual([...PREFIX_IDS]);
  });

  it('balances weekday tiers 0–6 to exact hist [17,17,17,17,17,17,18] (D-02/D-03/D-10)', () => {
    const expected = [17, 17, 17, 17, 17, 17, 18];
    for (let tier = 0; tier <= 6; tier += 1) {
      expect(NONOGRAM_PATTERNS.filter((p) => p.tier === tier)).toHaveLength(expected[tier]!);
    }
  });

  it('first pattern id remains silly-face (append-only order)', () => {
    expect(NONOGRAM_PATTERNS[0]!.id).toBe('silly-face');
  });

  it.each(NONOGRAM_PATTERNS.map((p) => [p.id, p] as const))(
    'D-04: %s frozen difficultyTier matches rateNonogram(canonical)',
    (_id, pattern) => {
      expect(DIFFICULTY_TIERS).toContain(pattern.difficultyTier);
      const { rowClues, colClues } = computeClues(patternSolution(pattern));
      const rated = rateNonogram(rowClues, colClues);
      expect(rated.status).toBe('solved');
      if (rated.status === 'solved') {
        expect(pattern.difficultyTier).toBe(rated.tier);
      }
    },
  );

  it('SC-1: difficultyTier audit hist sums to 120 with easy > 0', () => {
    const hist = { easy: 0, medium: 0, hard: 0, expert: 0 };
    for (const pattern of NONOGRAM_PATTERNS) {
      hist[pattern.difficultyTier] += 1;
    }
    const sum = hist.easy + hist.medium + hist.hard + hist.expert;
    expect(sum).toBe(120);
    expect(hist.easy).toBeGreaterThan(0);
    // Uneven OK — do not assert equal counts (D-03).
  });

  it('patternsForDifficultyTier filters by difficultyTier only', () => {
    for (const tier of DIFFICULTY_TIERS) {
      const pool = patternsForDifficultyTier(tier);
      expect(pool.every((p) => p.difficultyTier === tier)).toBe(true);
      expect(pool).toHaveLength(
        NONOGRAM_PATTERNS.filter((p) => p.difficultyTier === tier).length,
      );
    }
  });

  it('assigns titleKey equal to id on every pattern (D-17)', () => {
    for (const pattern of NONOGRAM_PATTERNS) {
      expect(pattern.titleKey).toBe(pattern.id);
    }
  });

  it('has non-empty zh and en titles for every pattern id (D-17)', () => {
    for (const pattern of NONOGRAM_PATTERNS) {
      const zh = zhPatterns[pattern.id as keyof typeof zhPatterns];
      const en = enPatterns[pattern.id as keyof typeof enPatterns];
      expect(typeof zh).toBe('string');
      expect(zh.length).toBeGreaterThan(0);
      expect(typeof en).toBe('string');
      expect(en.length).toBeGreaterThan(0);
    }
  });

  it.each(NONOGRAM_PATTERNS.map((p) => [p.id, p] as const))(
    '%s is 8×8 with self-consistent clues',
    (_id, pattern) => {
      expect(pattern.rows).toHaveLength(NONOGRAM_ROWS);
      for (const row of pattern.rows) {
        expect(row).toMatch(/^[01]{8}$/);
      }

      const solution = patternSolution(pattern);
      expect(solution).toHaveLength(NONOGRAM_ROWS);
      expect(solution[0]).toHaveLength(NONOGRAM_COLS);

      const { rowClues, colClues } = computeClues(solution);

      for (let row = 0; row < NONOGRAM_ROWS; row += 1) {
        expect(clueFillSum(rowClues[row]!)).toBe(filledCount(solution[row]!));
      }
      for (let col = 0; col < NONOGRAM_COLS; col += 1) {
        const line = solution.map((r) => r[col]!);
        expect(clueFillSum(colClues[col]!)).toBe(filledCount(line));
      }

      const playState = solution.map((row) =>
        row.map((filled) => (filled ? NONOGRAM_FILL : -1)),
      );
      expect(isCompleteAndValid(playState, solution)).toBe(true);
    },
  );

  it.each(NONOGRAM_PATTERNS.map((p) => [p.id, p] as const))(
    '%s stays valid under mirror transforms',
    (_id, pattern) => {
      const solution = patternSolution(pattern);
      for (const mirrorX of [false, true]) {
        for (const mirrorY of [false, true]) {
          const transformed = applyTransform(solution, { mirrorX, mirrorY });
          const { rowClues, colClues } = computeClues(transformed);
          const playState = transformed.map((row) =>
            row.map((filled) => (filled ? NONOGRAM_FILL : -1)),
          );
          expect(isCompleteAndValid(playState, transformed)).toBe(true);
          expect(rowClues).toHaveLength(NONOGRAM_ROWS);
          expect(colClues).toHaveLength(NONOGRAM_COLS);
        }
      }
    },
  );
});
