import { SLITHERLINK_MIN_CLUES } from '../../../../constants/config';
import { createBlankSolution, createEmptyPlayState } from '../../../../lib/puzzles/slitherlink/edges';
import {
  generateLoop,
  generateSlitherlinkPuzzle,
  isFullyInteriorLoop,
  isPerimeterLoop,
} from '../../../../lib/puzzles/slitherlink/generator';
import { countSolutionsUpTo } from '../../../../lib/puzzles/slitherlink/solver';
import {
  EDGE_BLANK,
  EDGE_LINE,
  SLITHERLINK_SIZE,
} from '../../../../lib/puzzles/slitherlink/spec';
import {
  getConflictEdges,
  isCompleteAndValid,
} from '../../../../lib/puzzles/slitherlink/validate';

describe('slitherlink validate', () => {
  it('accepts a complete perimeter loop against matching clues', () => {
    const solution = createBlankSolution();
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      solution.h[0][col] = EDGE_LINE;
      solution.h[SLITHERLINK_SIZE][col] = EDGE_LINE;
    }
    for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
      solution.v[row][0] = EDGE_LINE;
      solution.v[row][SLITHERLINK_SIZE] = EDGE_LINE;
    }

    const clues = Array.from({ length: SLITHERLINK_SIZE }, (_, row) =>
      Array.from({ length: SLITHERLINK_SIZE }, (_, col) => {
        if (row === 0 && col === 0) return 2;
        if (row === 0 && col === SLITHERLINK_SIZE - 1) return 2;
        if (row === SLITHERLINK_SIZE - 1 && col === 0) return 2;
        if (row === SLITHERLINK_SIZE - 1 && col === SLITHERLINK_SIZE - 1) return 2;
        return null;
      }),
    );

    expect(isCompleteAndValid(solution, { clues })).toBe(true);
  });

  it('flags clue conflicts on partial play', () => {
    const play = createEmptyPlayState();
    play.h[0][0] = EDGE_LINE;
    play.h[0][1] = EDGE_LINE;
    play.h[1][0] = EDGE_LINE;

    const clues = Array.from({ length: SLITHERLINK_SIZE }, () =>
      Array<number | null>(SLITHERLINK_SIZE).fill(null),
    );
    clues[0][0] = 1;

    const conflicts = getConflictEdges(play, { clues });
    expect(conflicts.h[0][0] || conflicts.h[1][0] || conflicts.v[0][0]).toBe(true);
  });

  it('accepts a correct loop when untouched edges remain unknown', () => {
    const puzzle = generateSlitherlinkPuzzle(99);
    const play = createEmptyPlayState();

    for (let row = 0; row <= SLITHERLINK_SIZE; row += 1) {
      for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
        if (puzzle.solution.h[row][col] === EDGE_LINE) {
          play.h[row][col] = EDGE_LINE;
        }
      }
    }
    for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
      for (let col = 0; col <= SLITHERLINK_SIZE; col += 1) {
        if (puzzle.solution.v[row][col] === EDGE_LINE) {
          play.v[row][col] = EDGE_LINE;
        }
      }
    }

    expect(isCompleteAndValid(play, puzzle)).toBe(true);
  });

  it('rejects a wrong edge on an otherwise complete loop', () => {
    const puzzle = generateSlitherlinkPuzzle(99);
    const play = createEmptyPlayState();
    for (let row = 0; row <= SLITHERLINK_SIZE; row += 1) {
      for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
        play.h[row][col] = puzzle.solution.h[row][col];
      }
    }
    for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
      for (let col = 0; col <= SLITHERLINK_SIZE; col += 1) {
        play.v[row][col] = puzzle.solution.v[row][col];
      }
    }
    let removedLine = false;
    outer: for (let row = 0; row <= SLITHERLINK_SIZE; row += 1) {
      for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
        if (play.h[row][col] === EDGE_LINE) {
          play.h[row][col] = EDGE_BLANK;
          removedLine = true;
          break outer;
        }
      }
    }
    for (let row = 0; row < SLITHERLINK_SIZE && !removedLine; row += 1) {
      for (let col = 0; col <= SLITHERLINK_SIZE; col += 1) {
        if (play.v[row][col] === EDGE_LINE) {
          play.v[row][col] = EDGE_BLANK;
          removedLine = true;
          break;
        }
      }
    }
    expect(removedLine).toBe(true);
    expect(isCompleteAndValid(play, puzzle)).toBe(false);
  });
});

describe('slitherlink generator', () => {
  it('is deterministic for the same seed', () => {
    const a = generateSlitherlinkPuzzle(12345);
    const b = generateSlitherlinkPuzzle(12345);
    expect(a.puzzleHash).toBe(b.puzzleHash);
  });

  it('usually differs across seeds', () => {
    const a = generateSlitherlinkPuzzle(1);
    const b = generateSlitherlinkPuzzle(2);
    expect(a.puzzleHash).not.toBe(b.puzzleHash);
  });

  it('produces uniquely solvable puzzles with enough clues', () => {
    const puzzle = generateSlitherlinkPuzzle(777);
    const clueCount = puzzle.clues.flat().filter((value) => value != null).length;
    expect(clueCount).toBeGreaterThanOrEqual(SLITHERLINK_MIN_CLUES - 4);
    expect(countSolutionsUpTo(puzzle.clues, createEmptyPlayState(), 2)).toBe(1);
  });

  it('never uses a bare perimeter loop for easy/medium/hard', () => {
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      for (let seed = 0; seed < 20; seed += 1) {
        const solution = generateLoop(seed, difficulty);
        expect(solution).not.toBeNull();
        expect(isPerimeterLoop(solution!)).toBe(false);
      }
    }
  });

  it('produces non-perimeter loops for daily seeds', () => {
    const shapes = new Set<string>();
    for (let seed = 1; seed <= 40; seed += 1) {
      const puzzle = generateSlitherlinkPuzzle(seed);
      shapes.add(
        isPerimeterLoop(puzzle.solution) ? 'perimeter' : 'varied',
      );
    }
    expect(shapes.has('varied')).toBe(true);
  });

  it('includes fully interior loops for some hard seeds', () => {
    let foundInterior = false;
    for (let seed = 0; seed < 80; seed += 1) {
      const solution = generateLoop(seed, 'hard');
      if (solution != null && isFullyInteriorLoop(solution)) {
        foundInterior = true;
        break;
      }
    }
    expect(foundInterior).toBe(true);
  });
});
