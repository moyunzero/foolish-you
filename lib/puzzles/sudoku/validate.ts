import type { SudokuGivens, SudokuPlayState } from '../types';
import { mergePlayAndGivens, type CellCoord } from './grid';

function coordKey({ row, col }: CellCoord): string {
  return `${row},${col}`;
}

function collectDuplicates(
  grid: number[][],
  getPeers: (row: number, col: number) => CellCoord[],
): Set<string> {
  const conflicts = new Set<string>();

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const value = grid[row][col];
      if (value === 0) continue;

      for (const peer of getPeers(row, col)) {
        if (grid[peer.row][peer.col] === value) {
          conflicts.add(coordKey({ row, col }));
          conflicts.add(coordKey(peer));
        }
      }
    }
  }

  return conflicts;
}

function rowPeers(row: number, col: number): CellCoord[] {
  const peers: CellCoord[] = [];
  for (let c = 0; c < 9; c += 1) {
    if (c !== col) peers.push({ row, col: c });
  }
  return peers;
}

function colPeers(row: number, col: number): CellCoord[] {
  const peers: CellCoord[] = [];
  for (let r = 0; r < 9; r += 1) {
    if (r !== row) peers.push({ row: r, col });
  }
  return peers;
}

function boxPeers(row: number, col: number): CellCoord[] {
  const peers: CellCoord[] = [];
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxCol; c < boxCol + 3; c += 1) {
      if (r !== row || c !== col) peers.push({ row: r, col: c });
    }
  }
  return peers;
}

export function getConflictCells(
  play: SudokuPlayState,
  givens: SudokuGivens,
): CellCoord[] {
  const merged = mergePlayAndGivens(givens, play);
  const conflictKeys = new Set<string>();

  for (const peers of [rowPeers, colPeers, boxPeers]) {
    for (const key of collectDuplicates(merged, peers)) {
      conflictKeys.add(key);
    }
  }

  return [...conflictKeys].map((key) => {
    const [row, col] = key.split(',').map(Number);
    return { row, col };
  });
}

export function isCompleteAndValid(
  play: SudokuPlayState,
  givens: SudokuGivens,
): boolean {
  const merged = mergePlayAndGivens(givens, play);

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (merged[row][col] === 0) return false;
    }
  }

  return getConflictCells(play, givens).length === 0;
}
