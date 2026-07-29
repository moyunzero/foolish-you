import type { DifficultyTier } from '../difficulty/tiers';

/** Ordered human-technique ladder for Binary (Takuzu) rating (D-06, D-23). */
export type BinaryTechnique =
  | 'adjacent_pair'
  | 'gap_fill'
  | 'balance'
  | 'uniqueness'
  | 'look_ahead';

/** Ascending difficulty — rater scans this order each step (SE-style restart). */
export const TECHNIQUE_ORDER: readonly BinaryTechnique[] = [
  'adjacent_pair',
  'gap_fill',
  'balance',
  'uniqueness',
  'look_ahead',
] as const;

const TECHNIQUE_RANK: Record<BinaryTechnique, number> = Object.fromEntries(
  TECHNIQUE_ORDER.map((t, i) => [t, i]),
) as Record<BinaryTechnique, number>;

export function techniqueRank(t: BinaryTechnique): number {
  return TECHNIQUE_RANK[t];
}

export function maxTechnique(
  a: BinaryTechnique | null,
  b: BinaryTechnique,
): BinaryTechnique {
  if (a == null) return b;
  return techniqueRank(b) > techniqueRank(a) ? b : a;
}

/** Peak technique → shared DifficultyTier (D-01, D-23). */
export function peakToTier(peak: BinaryTechnique): DifficultyTier {
  switch (peak) {
    case 'adjacent_pair':
    case 'gap_fill':
      return 'easy';
    case 'balance':
      return 'medium';
    case 'uniqueness':
      return 'hard';
    case 'look_ahead':
      return 'expert';
  }
}
