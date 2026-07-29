import {
  cellIndex,
  digitBit,
  hasDigit,
  initTechniqueBoard,
} from '../../../../lib/puzzles/sudoku/candidates';
import { tryShortChain } from '../../../../lib/puzzles/sudoku/chains';

describe('tryShortChain open X-chain soundness (CR-01)', () => {
  it('does not strip victim candidate via illegal weak-first open X-chain', () => {
    // Pattern from REVIEW CR-01:
    // A–B weak (row share, ≥3 candidates in house), B–C strong (exactly two in col),
    // victim V sees both A and C and still legally holds digit D.
    // Unsound elim: start -weak→ mid =strong⇒ end → strip D from V.
    const D = 1;
    const empty = Array.from({ length: 9 }, () => Array(9).fill(0));
    const board = initTechniqueBoard(empty);

    const A = cellIndex(0, 0);
    const B = cellIndex(0, 4);
    const F = cellIndex(0, 8); // third row-0 candidate → A–B is weak, not strong
    const C = cellIndex(5, 4); // strong with B in col 4
    const V = cellIndex(5, 0); // sees A (col 0) and C (row 5)

    for (let i = 0; i < 81; i += 1) {
      board.candidates[i] = 0;
    }
    const bit = digitBit(D);
    board.candidates[A] = bit;
    board.candidates[B] = bit;
    board.candidates[F] = bit;
    board.candidates[C] = bit;
    board.candidates[V] = bit;

    expect(hasDigit(board.candidates[V], D)).toBe(true);

    const result = tryShortChain(board);

    // Either no productive step, or if applied, victim must retain D
    if (result.applied) {
      expect(hasDigit(board.candidates[V], D)).toBe(true);
    } else {
      expect(hasDigit(board.candidates[V], D)).toBe(true);
    }
  });
});
