import { APP_SALT } from '../../../constants/config';
import { SLITHERLINK_SIZE } from './spec';

function fnv1a(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function computePuzzleHash(clues: (number | null)[][]): string {
  const flat = clues
    .flat()
    .map((value) => (value == null ? '.' : String(value)))
    .join('');
  return `sl-${fnv1a(`${APP_SALT}:slitherlink:${SLITHERLINK_SIZE}:${flat}`)}`;
}
