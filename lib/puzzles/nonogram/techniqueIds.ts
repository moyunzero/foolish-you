import type { DifficultyTier } from '../difficulty/tiers';

/** Ordered solver-class ladder for Nonogram rating (D-01, D-26). */
export type NonogramTechnique =
  | 'simple_few'
  | 'simple_many'
  | 'probe'
  | 'nested_probe';

/** Ascending difficulty — rater maps peak via sweep/probe metrics. */
export const TECHNIQUE_ORDER: readonly NonogramTechnique[] = [
  'simple_few',
  'simple_many',
  'probe',
  'nested_probe',
] as const;

const TECHNIQUE_RANK: Record<NonogramTechnique, number> = Object.fromEntries(
  TECHNIQUE_ORDER.map((t, i) => [t, i]),
) as Record<NonogramTechnique, number>;

export function techniqueRank(t: NonogramTechnique): number {
  return TECHNIQUE_RANK[t];
}

export function maxTechnique(
  a: NonogramTechnique | null,
  b: NonogramTechnique,
): NonogramTechnique {
  if (a == null) return b;
  return techniqueRank(b) > techniqueRank(a) ? b : a;
}

/** Peak technique → shared DifficultyTier (D-01, D-26). Never fork a parallel tier union. */
export function peakToTier(peak: NonogramTechnique): DifficultyTier {
  switch (peak) {
    case 'simple_few':
      return 'easy';
    case 'simple_many':
      return 'medium';
    case 'probe':
      return 'hard';
    case 'nested_probe':
      return 'expert';
  }
}
