import {
  digitBit,
  eliminateCandidate,
  type TechniqueBoard,
} from './candidates';

/** Max links in a short X-chain / AIC (D-04). */
export const EXPERT_CHAIN_MAX_LENGTH = 6;

/** Max node expansions per rate call for chain search (D-04). */
export const EXPERT_CHAIN_MAX_NODES = 2000;

export type ChainStepResult =
  | { applied: true; technique: 'short_chain' }
  | { applied: false; budgetExceeded: boolean };

function idxRow(i: number): number {
  return Math.floor(i / 9);
}

function idxCol(i: number): number {
  return i % 9;
}

function sameUnit(a: number, b: number): boolean {
  const ra = idxRow(a);
  const ca = idxCol(a);
  const rb = idxRow(b);
  const cb = idxCol(b);
  if (ra === rb || ca === cb) return true;
  return (
    Math.floor(ra / 3) === Math.floor(rb / 3) &&
    Math.floor(ca / 3) === Math.floor(cb / 3)
  );
}

type ChainNode = {
  cell: number;
  digit: number;
  /** true = strong link arrival (digit must be here if previous false) */
  strong: boolean;
  depth: number;
};

/**
 * Bounded short X-chain: for each digit, explore alternating strong/weak links
 * among candidate cells. On a productive elimination, apply and return.
 * Exceeding node/length caps → budgetExceeded (never wall-clock).
 */
export function tryShortChain(board: TechniqueBoard): ChainStepResult {
  let nodesExpanded = 0;

  for (let digit = 1; digit <= 9; digit += 1) {
    const bit = digitBit(digit);
    const cells: number[] = [];
    for (let i = 0; i < 81; i += 1) {
      if (board.digits[idxRow(i)][idxCol(i)] !== 0) continue;
      if ((board.candidates[i] & bit) !== 0) cells.push(i);
    }
    if (cells.length < 2) continue;

    // Strong links: exactly two candidates in a house for this digit
    const strongPairs = new Set<string>();
    for (let h = 0; h < 27; h += 1) {
      const inHouse = cells.filter((i) => {
        const r = idxRow(i);
        const c = idxCol(i);
        if (h < 9) return r === h;
        if (h < 18) return c === h - 9;
        const box = h - 18;
        const br = Math.floor(box / 3) * 3;
        const bc = (box % 3) * 3;
        return r >= br && r < br + 3 && c >= bc && c < bc + 3;
      });
      if (inHouse.length === 2) {
        const [a, b] = inHouse;
        strongPairs.add(`${a}-${b}`);
        strongPairs.add(`${b}-${a}`);
      }
    }

    const isStrong = (a: number, b: number): boolean =>
      strongPairs.has(`${a}-${b}`);

    for (const start of cells) {
      // Seed depth-0 as not a completed strong arrival so the first hop
      // must be a strong link (classic strong–weak–strong… open X-chain).
      const queue: ChainNode[] = [
        { cell: start, digit, strong: false, depth: 0 },
      ];
      const seen = new Set<string>([`${start}:0`]);

      while (queue.length > 0) {
        const node = queue.shift()!;
        nodesExpanded += 1;
        if (nodesExpanded > EXPERT_CHAIN_MAX_NODES) {
          return { applied: false, budgetExceeded: true };
        }
        if (node.depth >= EXPERT_CHAIN_MAX_LENGTH) continue;

        for (const next of cells) {
          if (next === node.cell) continue;
          if (!sameUnit(node.cell, next)) continue;

          // Alternate: after weak (or seed), take strong; after strong, take weak
          const nextStrong = !node.strong;
          if (nextStrong && !isStrong(node.cell, next)) continue;
          // Weak link: share a unit and both have the candidate (already sameUnit)

          const key = `${next}:${node.depth + 1}:${nextStrong ? 1 : 0}`;
          if (seen.has(key)) continue;
          seen.add(key);

          const depth = node.depth + 1;
          // Productive only when both endpoints are strong arrivals:
          // depth >= 2 and arrival is strong (start was linked out via strong first hop).
          if (depth >= 2 && nextStrong) {
            let changed = false;
            for (let i = 0; i < 81; i += 1) {
              if (i === start || i === next) continue;
              if (board.digits[idxRow(i)][idxCol(i)] !== 0) continue;
              if ((board.candidates[i] & bit) === 0) continue;
              if (!sameUnit(i, start) || !sameUnit(i, next)) continue;
              if (eliminateCandidate(board, idxRow(i), idxCol(i), digit)) {
                changed = true;
              }
            }
            if (changed) {
              return { applied: true, technique: 'short_chain' };
            }
          }

          queue.push({
            cell: next,
            digit,
            strong: nextStrong,
            depth,
          });
        }
      }
    }
  }

  // XY-chain / AIC: deferred (IN-02) — do not burn shared node budget on a
  // non-productive walk until a documented elimination rule lands.
  return { applied: false, budgetExceeded: false };
}
