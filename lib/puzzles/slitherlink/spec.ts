export const SLITHERLINK_SIZE = 7;

/** unknown | line | blank */
export type EdgeState = 0 | 1 | 2;

export const EDGE_UNKNOWN = 0 as const;
export const EDGE_LINE = 1 as const;
export const EDGE_BLANK = 2 as const;

export type SlitherlinkSolutionEdges = {
  h: EdgeState[][];
  v: EdgeState[][];
};

export type SlitherlinkPlayState = SlitherlinkSolutionEdges;

export type SlitherlinkPuzzle = {
  kind: 'slitherlink';
  size: typeof SLITHERLINK_SIZE;
  clues: (number | null)[][];
  puzzleHash: string;
  solution: SlitherlinkSolutionEdges;
};

export type EdgeOrientation = 'h' | 'v';

export type EdgeCoord = {
  orientation: EdgeOrientation;
  row: number;
  col: number;
};
