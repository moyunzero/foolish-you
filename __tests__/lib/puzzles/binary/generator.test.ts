import { BINARY_GIVEN_COUNT } from '../../../../constants/config';
import { countGivens } from '../../../../lib/puzzles/binary/grid';
import { generateBinaryPuzzle } from '../../../../lib/puzzles/binary/generator';
import { binaryGivensForDate } from '../../../../lib/puzzles/difficulty/weekdayBand';
import { countSolutionsUpTo } from '../../../../lib/puzzles/binary/solver';

describe('generateBinaryPuzzle', () => {
  it('is deterministic for the same seed', () => {
    const a = generateBinaryPuzzle(42);
    const b = generateBinaryPuzzle(42);
    expect(b.givens).toEqual(a.givens);
    expect(b.puzzleHash).toBe(a.puzzleHash);
  });

  it('produces unique-solution puzzles with target givens', () => {
    const puzzle = generateBinaryPuzzle(20260516);
    expect(puzzle.kind).toBe('binary');
    expect(countGivens(puzzle.givens)).toBe(BINARY_GIVEN_COUNT);
    expect(countSolutionsUpTo(puzzle.givens, 2)).toBe(1);
    expect(puzzle.puzzleHash).toMatch(/^bin-[0-9a-f]{8}$/);
  });

  it('uses weekday band givens when dateKey is provided', () => {
    const mon = generateBinaryPuzzle(20260516, '2026-06-01');
    const sun = generateBinaryPuzzle(20260516, '2026-06-07');
    expect(countGivens(mon.givens)).toBe(binaryGivensForDate('2026-06-01'));
    expect(countGivens(sun.givens)).toBe(binaryGivensForDate('2026-06-07'));
    expect(countGivens(mon.givens)).toBeGreaterThan(countGivens(sun.givens));
  });

  it('differs across seeds', () => {
    const a = generateBinaryPuzzle(1);
    const b = generateBinaryPuzzle(2);
    expect(a.puzzleHash).not.toBe(b.puzzleHash);
  });
});
