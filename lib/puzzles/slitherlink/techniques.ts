import {
  EDGE_BLANK,
  EDGE_LINE,
  EDGE_UNKNOWN,
  SLITHERLINK_SIZE,
  type EdgeCoord,
  type SlitherlinkPlayState,
} from './spec';
import {
  edgeAt,
  lineCountAroundCell,
  setEdgeAt,
  unknownCountAroundCell,
} from './edges';
import { tryLocalLoop, tryVertexDegree } from './loops';
import type { SlitherlinkTechnique } from './techniqueIds';

export type TechniqueHit = {
  applied: true;
  technique: SlitherlinkTechnique;
};

export type TechniqueMiss = { applied: false };

export type TechniqueResult = TechniqueHit | TechniqueMiss;

const MISS: TechniqueMiss = { applied: false };

type CellEdge = EdgeCoord;

function cellEdges(row: number, col: number): CellEdge[] {
  return [
    { orientation: 'h', row, col },
    { orientation: 'h', row: row + 1, col },
    { orientation: 'v', row, col },
    { orientation: 'v', row, col: col + 1 },
  ];
}

function setOne(
  play: SlitherlinkPlayState,
  edge: CellEdge,
  state: typeof EDGE_LINE | typeof EDGE_BLANK,
): void {
  setEdgeAt(play, edge.orientation, edge.row, edge.col, state);
}

/** Easy: clue 0 → blank one unknown edge around the cell. */
function tryZeroElim(
  play: SlitherlinkPlayState,
  clues: (number | null)[][],
): TechniqueResult {
  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      if (clues[row]![col] !== 0) continue;
      for (const edge of cellEdges(row, col)) {
        if (edgeAt(play, edge.orientation, edge.row, edge.col) !== EDGE_UNKNOWN) {
          continue;
        }
        setOne(play, edge, EDGE_BLANK);
        return { applied: true, technique: 'zero_elim' };
      }
    }
  }
  return MISS;
}

/** Easy: corner 3 forces the two border edges to LINE. */
function tryCornerThree(
  play: SlitherlinkPlayState,
  clues: (number | null)[][],
): TechniqueResult {
  const n = SLITHERLINK_SIZE;
  const corners: Array<{
    row: number;
    col: number;
    edges: CellEdge[];
  }> = [
    {
      row: 0,
      col: 0,
      edges: [
        { orientation: 'h', row: 0, col: 0 },
        { orientation: 'v', row: 0, col: 0 },
      ],
    },
    {
      row: 0,
      col: n - 1,
      edges: [
        { orientation: 'h', row: 0, col: n - 1 },
        { orientation: 'v', row: 0, col: n },
      ],
    },
    {
      row: n - 1,
      col: 0,
      edges: [
        { orientation: 'h', row: n, col: 0 },
        { orientation: 'v', row: n - 1, col: 0 },
      ],
    },
    {
      row: n - 1,
      col: n - 1,
      edges: [
        { orientation: 'h', row: n, col: n - 1 },
        { orientation: 'v', row: n - 1, col: n },
      ],
    },
  ];

  for (const corner of corners) {
    if (clues[corner.row]![corner.col] !== 3) continue;
    for (const edge of corner.edges) {
      if (edgeAt(play, edge.orientation, edge.row, edge.col) !== EDGE_UNKNOWN) {
        continue;
      }
      setOne(play, edge, EDGE_LINE);
      return { applied: true, technique: 'corner_three' };
    }
  }
  return MISS;
}

/** Medium: orthogonal adjacent 3-3 → outer parallel edges LINE. */
function tryAdjacentThreeThree(
  play: SlitherlinkPlayState,
  clues: (number | null)[][],
): TechniqueResult {
  // Horizontal 3-3
  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE - 1; col += 1) {
      if (clues[row]![col] !== 3 || clues[row]![col + 1] !== 3) continue;
      const outer: CellEdge[] = [
        { orientation: 'v', row, col },
        { orientation: 'v', row, col: col + 2 },
      ];
      for (const edge of outer) {
        if (edgeAt(play, edge.orientation, edge.row, edge.col) !== EDGE_UNKNOWN) {
          continue;
        }
        setOne(play, edge, EDGE_LINE);
        return { applied: true, technique: 'adjacent_three_three' };
      }
    }
  }
  // Vertical 3-3
  for (let row = 0; row < SLITHERLINK_SIZE - 1; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      if (clues[row]![col] !== 3 || clues[row + 1]![col] !== 3) continue;
      const outer: CellEdge[] = [
        { orientation: 'h', row, col },
        { orientation: 'h', row: row + 2, col },
      ];
      for (const edge of outer) {
        if (edgeAt(play, edge.orientation, edge.row, edge.col) !== EDGE_UNKNOWN) {
          continue;
        }
        setOne(play, edge, EDGE_LINE);
        return { applied: true, technique: 'adjacent_three_three' };
      }
    }
  }
  return MISS;
}

/** Medium: 3 adjacent to 0 → shared edge blank via 0; force 3's other three LINE. */
function tryAdjacentThreeZero(
  play: SlitherlinkPlayState,
  clues: (number | null)[][],
): TechniqueResult {
  const dirs: Array<{
    dr: number;
    dc: number;
    shared: (r: number, c: number) => CellEdge;
    others: (r: number, c: number) => CellEdge[];
  }> = [
    {
      dr: 0,
      dc: 1,
      shared: (r, c) => ({ orientation: 'v', row: r, col: c + 1 }),
      others: (r, c) => [
        { orientation: 'h', row: r, col: c },
        { orientation: 'h', row: r + 1, col: c },
        { orientation: 'v', row: r, col: c },
      ],
    },
    {
      dr: 0,
      dc: -1,
      shared: (r, c) => ({ orientation: 'v', row: r, col: c }),
      others: (r, c) => [
        { orientation: 'h', row: r, col: c },
        { orientation: 'h', row: r + 1, col: c },
        { orientation: 'v', row: r, col: c + 1 },
      ],
    },
    {
      dr: 1,
      dc: 0,
      shared: (r, c) => ({ orientation: 'h', row: r + 1, col: c }),
      others: (r, c) => [
        { orientation: 'h', row: r, col: c },
        { orientation: 'v', row: r, col: c },
        { orientation: 'v', row: r, col: c + 1 },
      ],
    },
    {
      dr: -1,
      dc: 0,
      shared: (r, c) => ({ orientation: 'h', row: r, col: c }),
      others: (r, c) => [
        { orientation: 'h', row: r + 1, col: c },
        { orientation: 'v', row: r, col: c },
        { orientation: 'v', row: r, col: c + 1 },
      ],
    },
  ];

  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      if (clues[row]![col] !== 3) continue;
      for (const dir of dirs) {
        const nr = row + dir.dr;
        const nc = col + dir.dc;
        if (nr < 0 || nr >= SLITHERLINK_SIZE || nc < 0 || nc >= SLITHERLINK_SIZE) {
          continue;
        }
        if (clues[nr]![nc] !== 0) continue;

        // Shared edge must be blank (0-elim may already have set it).
        const shared = dir.shared(row, col);
        const sharedState = edgeAt(
          play,
          shared.orientation,
          shared.row,
          shared.col,
        );
        if (sharedState === EDGE_LINE) continue;
        if (sharedState === EDGE_UNKNOWN) {
          setOne(play, shared, EDGE_BLANK);
          return { applied: true, technique: 'adjacent_three_zero' };
        }

        for (const edge of dir.others(row, col)) {
          if (edgeAt(play, edge.orientation, edge.row, edge.col) !== EDGE_UNKNOWN) {
            continue;
          }
          setOne(play, edge, EDGE_LINE);
          return { applied: true, technique: 'adjacent_three_zero' };
        }
      }
    }
  }
  return MISS;
}

/** Medium: diagonal 3-3 → outer corner edges LINE. */
function tryDiagonalThreeThree(
  play: SlitherlinkPlayState,
  clues: (number | null)[][],
): TechniqueResult {
  const pairs: Array<{
    a: { row: number; col: number };
    b: { row: number; col: number };
    edges: CellEdge[];
  }> = [];

  for (let row = 0; row < SLITHERLINK_SIZE - 1; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE - 1; col += 1) {
      // ↘ diagonal
      if (clues[row]![col] === 3 && clues[row + 1]![col + 1] === 3) {
        pairs.push({
          a: { row, col },
          b: { row: row + 1, col: col + 1 },
          edges: [
            { orientation: 'h', row, col },
            { orientation: 'v', row, col },
            { orientation: 'h', row: row + 2, col: col + 1 },
            { orientation: 'v', row: row + 1, col: col + 2 },
          ],
        });
      }
      // ↙ diagonal
      if (clues[row]![col + 1] === 3 && clues[row + 1]![col] === 3) {
        pairs.push({
          a: { row, col: col + 1 },
          b: { row: row + 1, col },
          edges: [
            { orientation: 'h', row, col: col + 1 },
            { orientation: 'v', row, col: col + 2 },
            { orientation: 'h', row: row + 2, col },
            { orientation: 'v', row: row + 1, col },
          ],
        });
      }
    }
  }

  for (const pair of pairs) {
    for (const edge of pair.edges) {
      if (edgeAt(play, edge.orientation, edge.row, edge.col) !== EDGE_UNKNOWN) {
        continue;
      }
      setOne(play, edge, EDGE_LINE);
      return { applied: true, technique: 'diagonal_three_three' };
    }
  }
  return MISS;
}

/**
 * Medium: clue saturation / remainder force — one edge per hit.
 * lines+unknowns===clue → LINE; lines===clue → BLANK.
 */
function tryEdgeCount(
  play: SlitherlinkPlayState,
  clues: (number | null)[][],
): TechniqueResult {
  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      const clue = clues[row]![col];
      if (clue == null || clue === 0) continue;

      const lines = lineCountAroundCell(play, row, col);
      const unknowns = unknownCountAroundCell(play, row, col);
      if (unknowns === 0) continue;

      if (lines + unknowns === clue) {
        for (const edge of cellEdges(row, col)) {
          if (edgeAt(play, edge.orientation, edge.row, edge.col) !== EDGE_UNKNOWN) {
            continue;
          }
          setOne(play, edge, EDGE_LINE);
          return { applied: true, technique: 'edge_count' };
        }
      }

      if (lines === clue) {
        for (const edge of cellEdges(row, col)) {
          if (edgeAt(play, edge.orientation, edge.row, edge.col) !== EDGE_UNKNOWN) {
            continue;
          }
          setOne(play, edge, EDGE_BLANK);
          return { applied: true, technique: 'edge_count' };
        }
      }
    }
  }
  return MISS;
}

type Detector = (
  play: SlitherlinkPlayState,
  clues: (number | null)[][],
) => TechniqueResult;

/** Easy–Hard detectors in TECHNIQUE_ORDER excluding bifurcation. */
const DETECTORS: Detector[] = [
  tryZeroElim,
  tryCornerThree,
  tryAdjacentThreeThree,
  tryAdjacentThreeZero,
  tryDiagonalThreeThree,
  tryEdgeCount,
  (play) => tryVertexDegree(play),
  (play) => tryLocalLoop(play),
];

/**
 * Apply the first productive Easy→Hard technique (one edge).
 * Never rates bulk runPropagation as a single technique.
 */
export function applyNextTechnique(
  play: SlitherlinkPlayState,
  clues: (number | null)[][],
): TechniqueResult {
  for (const detect of DETECTORS) {
    const hit = detect(play, clues);
    if (hit.applied) return hit;
  }
  return MISS;
}

export function hasUnknownEdge(play: SlitherlinkPlayState): boolean {
  for (let row = 0; row <= SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      if (play.h[row]![col] === EDGE_UNKNOWN) return true;
    }
  }
  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col <= SLITHERLINK_SIZE; col += 1) {
      if (play.v[row]![col] === EDGE_UNKNOWN) return true;
    }
  }
  return false;
}
