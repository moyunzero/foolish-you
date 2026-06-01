import { SLITHERLINK_SIZE } from './spec';

/** Max distance (px) from finger to edge segment to register a tap.
 *  Must stay below half of minimum cellStep (~32) so cell-center taps do not snap to an edge. */
export const SLITHERLINK_EDGE_HIT_RADIUS = 18;

export type SlitherlinkEdgeHit = {
  orientation: 'h' | 'v';
  row: number;
  col: number;
};

function distPointToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    return Math.hypot(px - x1, py - y1);
  }
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

/**
 * Map a touch inside the board container to the nearest edge segment.
 * `px`/`py` are relative to the board view (0,0 = top-left of container).
 */
export function findNearestSlitherlinkEdge(
  px: number,
  py: number,
  inset: number,
  cellStep: number,
  hitRadius: number = SLITHERLINK_EDGE_HIT_RADIUS,
): SlitherlinkEdgeHit | null {
  let bestDist = hitRadius;
  let best: SlitherlinkEdgeHit | null = null;

  for (let row = 0; row <= SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col < SLITHERLINK_SIZE; col += 1) {
      const x0 = inset + col * cellStep;
      const x1 = inset + (col + 1) * cellStep;
      const y = inset + row * cellStep;
      const d = distPointToSegment(px, py, x0, y, x1, y);
      if (d < bestDist) {
        bestDist = d;
        best = { orientation: 'h', row, col };
      }
    }
  }

  for (let row = 0; row < SLITHERLINK_SIZE; row += 1) {
    for (let col = 0; col <= SLITHERLINK_SIZE; col += 1) {
      const x = inset + col * cellStep;
      const y0 = inset + row * cellStep;
      const y1 = inset + (row + 1) * cellStep;
      const d = distPointToSegment(px, py, x, y0, x, y1);
      if (d < bestDist) {
        bestDist = d;
        best = { orientation: 'v', row, col };
      }
    }
  }

  return best;
}
