import {
  NONOGRAM_CROSS,
  NONOGRAM_EMPTY,
  NONOGRAM_FILL,
  type NonogramCell,
} from './spec';

/**
 * Enumerate all boolean fill placements of length `n` matching `clues`.
 * Clue `[0]` means an empty line (all CROSS).
 */
function enumeratePlacements(n: number, clues: number[]): boolean[][] {
  if (clues.length === 1 && clues[0] === 0) {
    return [Array.from({ length: n }, () => false)];
  }

  const results: boolean[][] = [];

  function place(clueIndex: number, start: number, line: boolean[]): void {
    if (clueIndex >= clues.length) {
      results.push(line.slice());
      return;
    }

    const block = clues[clueIndex]!;
    const remainingBlocks = clues.slice(clueIndex + 1);
    const minTail =
      remainingBlocks.reduce((sum, b) => sum + b, 0) + remainingBlocks.length;
    const maxStart = n - block - minTail;

    for (let s = start; s <= maxStart; s += 1) {
      for (let i = 0; i < block; i += 1) {
        line[s + i] = true;
      }
      const nextStart = s + block + (clueIndex + 1 < clues.length ? 1 : 0);
      place(clueIndex + 1, nextStart, line);
      for (let i = 0; i < block; i += 1) {
        line[s + i] = false;
      }
    }
  }

  place(0, 0, Array.from({ length: n }, () => false));
  return results;
}

function placementMatchesKnown(
  placement: boolean[],
  cells: readonly NonogramCell[],
): boolean {
  for (let i = 0; i < cells.length; i += 1) {
    const known = cells[i]!;
    if (known === NONOGRAM_EMPTY) continue;
    const filled = placement[i]!;
    if (known === NONOGRAM_FILL && !filled) return false;
    if (known === NONOGRAM_CROSS && filled) return false;
  }
  return true;
}

function validPlacements(
  cells: readonly NonogramCell[],
  clues: readonly number[],
): boolean[][] {
  return enumeratePlacements(cells.length, [...clues]).filter((p) =>
    placementMatchesKnown(p, cells),
  );
}

/** True when at least one placement matches clues + known FILL/CROSS. */
export function lineHasValidPlacement(
  cells: readonly NonogramCell[],
  clues: readonly number[],
): boolean {
  return validPlacements(cells, clues).length > 0;
}

/**
 * Settle one line: force cells identical across all valid placements
 * consistent with clues + known FILL/CROSS. Returns a new array (clone).
 * Prefer complete enumeration for n=8.
 */
export function settleLine(
  cells: readonly NonogramCell[],
  clues: readonly number[],
): NonogramCell[] {
  const n = cells.length;
  const placements = validPlacements(cells, clues);
  const out: NonogramCell[] = cells.map((c) => c);

  if (placements.length === 0) {
    return out;
  }

  for (let i = 0; i < n; i += 1) {
    if (out[i] !== NONOGRAM_EMPTY) continue;
    const first = placements[0]![i]!;
    const allAgree = placements.every((p) => p[i] === first);
    if (allAgree) {
      out[i] = first ? NONOGRAM_FILL : NONOGRAM_CROSS;
    }
  }

  return out;
}
