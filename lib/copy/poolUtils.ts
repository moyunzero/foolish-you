export function pickFromPool<T>(rng: () => number, items: readonly T[]): T {
  const idx = Math.floor(rng() * items.length);
  return items[idx] ?? items[0];
}

export function pickUniquePlainLines(
  rng: () => number,
  pool: readonly string[],
  count: number,
  exclude: string[] = [],
): string[] {
  const filtered = pool.filter((line) => !exclude.includes(line));
  const shuffled = [...filtered].sort(() => (rng() < 0.5 ? -1 : 1));
  return shuffled.slice(0, count);
}

export function seededFoolIndexPercent(rng: () => number): number {
  return 72 + Math.floor(rng() * 24);
}

export function seededBrainCells(rng: () => number): number {
  return 500 + Math.floor(rng() * 700);
}
