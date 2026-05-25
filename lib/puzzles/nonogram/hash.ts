import { APP_SALT } from '../../../constants/config';
import { NONOGRAM_COLS, NONOGRAM_ROWS } from './spec';

function fnv1a(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function computePuzzleHash(params: {
  patternId: string;
  mirrorX: boolean;
  mirrorY: boolean;
  rowClues: number[][];
  colClues: number[][];
}): string {
  const flatRows = params.rowClues.map((r) => r.join(',')).join('|');
  const flatCols = params.colClues.map((c) => c.join(',')).join('|');
  const payload = `${APP_SALT}:nonogram:${NONOGRAM_ROWS}x${NONOGRAM_COLS}:${params.patternId}:${params.mirrorX ? 'x' : ''}${params.mirrorY ? 'y' : ''}:${flatRows}:${flatCols}`;
  return `nono-${fnv1a(payload)}`;
}
