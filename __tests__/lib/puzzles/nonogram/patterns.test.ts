import { computeClues } from '../../../../lib/puzzles/nonogram/clues';
import {
  NONOGRAM_PATTERNS,
  patternSolution,
} from '../../../../lib/puzzles/nonogram/patterns';
import { NONOGRAM_COLS, NONOGRAM_FILL, NONOGRAM_ROWS } from '../../../../lib/puzzles/nonogram/spec';
import { applyTransform } from '../../../../lib/puzzles/nonogram/transform';
import { isCompleteAndValid } from '../../../../lib/puzzles/nonogram/validate';

function filledCount(line: boolean[]): number {
  return line.filter(Boolean).length;
}

function clueFillSum(clues: number[]): number {
  return clues.filter((n) => n > 0).reduce((sum, n) => sum + n, 0);
}

describe('NONOGRAM_PATTERNS', () => {
  it('contains 30 patterns with unique ids and titles', () => {
    expect(NONOGRAM_PATTERNS).toHaveLength(30);
    const ids = NONOGRAM_PATTERNS.map((p) => p.id);
    const titles = NONOGRAM_PATTERNS.map((p) => p.title);
    expect(new Set(ids).size).toBe(30);
    expect(new Set(titles).size).toBe(30);
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
