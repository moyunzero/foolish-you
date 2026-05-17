import { APP_SALT } from '../../constants/config';

/** FNV-1a 风格字符串哈希 → 32-bit 无符号整数 */
export function hashStringToSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Mulberry32 PRNG */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function deriveSeed(dateKey: string): number {
  return hashStringToSeed(`${APP_SALT}:${dateKey}`);
}

export function deriveSubSeed(baseSeed: number, label: string): number {
  return hashStringToSeed(`${baseSeed}:${label}`);
}
