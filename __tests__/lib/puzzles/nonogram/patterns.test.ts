import { computeClues } from '../../../../lib/puzzles/nonogram/clues';
import {
  NONOGRAM_PATTERNS,
  patternSolution,
} from '../../../../lib/puzzles/nonogram/patterns';
import { NONOGRAM_COLS, NONOGRAM_FILL, NONOGRAM_ROWS } from '../../../../lib/puzzles/nonogram/spec';
import { applyTransform } from '../../../../lib/puzzles/nonogram/transform';
import { isCompleteAndValid } from '../../../../lib/puzzles/nonogram/validate';

/** Frozen pre-expand id order (D-17 append-only prefix lock). */
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
] as const;

function filledCount(line: boolean[]): number {
  return line.filter(Boolean).length;
}

function clueFillSum(clues: number[]): number {
  return clues.filter((n) => n > 0).reduce((sum, n) => sum + n, 0);
}

describe('NONOGRAM_PATTERNS', () => {
  // D-20: after bucket growth, same dateKey may pick a different pattern across app versions — accepted.
  it('expands to ~90 patterns with unique ids and titles (D-13)', () => {
    const { length } = NONOGRAM_PATTERNS;
    expect(length).toBeGreaterThanOrEqual(84);
    expect(length).toBeLessThanOrEqual(98);
    const ids = NONOGRAM_PATTERNS.map((p) => p.id);
    const titles = NONOGRAM_PATTERNS.map((p) => p.title);
    expect(new Set(ids).size).toBe(length);
    expect(new Set(titles).size).toBe(length);
  });

  it('keeps the first 30 pattern ids in original order (D-17 prefix lock)', () => {
    expect(NONOGRAM_PATTERNS.slice(0, 30).map((p) => p.id)).toEqual([...PREFIX_IDS]);
  });

  it('balances tiers 0–6 to 12–14 patterns each (D-15)', () => {
    for (let tier = 0; tier <= 6; tier += 1) {
      const count = NONOGRAM_PATTERNS.filter((p) => p.tier === tier).length;
      expect(count).toBeGreaterThanOrEqual(12);
      expect(count).toBeLessThanOrEqual(14);
    }
  });

  it('assigns titleKey equal to id on every pattern (D-17)', () => {
    for (const pattern of NONOGRAM_PATTERNS) {
      expect(pattern.titleKey).toBe(pattern.id);
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
