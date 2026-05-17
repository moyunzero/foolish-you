import { hashStringToSeed } from '../rng';

/** 由题面给定数生成稳定 hash（用于 DAILY-05） */
export function computePuzzleHash(givens: number[][]): string {
  const flat = givens.map((row) => row.join('')).join('|');
  const seed = hashStringToSeed(`sudoku:${flat}`);
  return `sudo-${seed.toString(16)}`;
}
