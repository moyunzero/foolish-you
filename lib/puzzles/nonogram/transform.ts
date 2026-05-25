export type TransformFlags = {
  mirrorX: boolean;
  mirrorY: boolean;
};

export function mirrorX(grid: boolean[][]): boolean[][] {
  return grid.map((row) => [...row].reverse());
}

export function mirrorY(grid: boolean[][]): boolean[][] {
  return [...grid].reverse();
}

export function applyTransform(
  grid: boolean[][],
  flags: TransformFlags,
): boolean[][] {
  let next = grid;
  if (flags.mirrorX) next = mirrorX(next);
  if (flags.mirrorY) next = mirrorY(next);
  return next;
}
