import { generateNonogramPuzzle } from '../../../../lib/puzzles/nonogram/generator';
import { isNonogramPuzzle } from '../../../../lib/puzzles/types';

describe('generateNonogramPuzzle', () => {
  it('returns stable puzzle for same seed', () => {
    const a = generateNonogramPuzzle(4242);
    const b = generateNonogramPuzzle(4242);
    expect(b.puzzleHash).toBe(a.puzzleHash);
    expect(b.pictureTitle).toBe(a.pictureTitle);
    expect(b.rowClues).toEqual(a.rowClues);
  });

  it('returns valid nonogram payload', () => {
    const puzzle = generateNonogramPuzzle(99);
    expect(isNonogramPuzzle(puzzle)).toBe(true);
    expect(puzzle.rows).toBe(8);
    expect(puzzle.cols).toBe(8);
    expect(puzzle.solution).toHaveLength(8);
    expect(puzzle.solution[0]).toHaveLength(8);
    expect(puzzle.puzzleHash).toMatch(/^nono-/);
    expect(puzzle.pictureTitle.length).toBeGreaterThan(0);
  });
});
