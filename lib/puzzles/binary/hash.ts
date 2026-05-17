import { APP_SALT } from '../../../constants/config';
import { BINARY_SIZE } from './spec';

function fnv1a(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function computePuzzleHash(givens: number[][]): string {
  const flat = givens.flat().join('');
  return `bin-${fnv1a(`${APP_SALT}:binary:${BINARY_SIZE}:${flat}`)}`;
}
