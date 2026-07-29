import type { DifficultyTier } from '../difficulty/tiers';

/** Ordered human-technique ladder for Slitherlink rating (D-06, D-24). */
export type SlitherlinkTechnique =
  | 'zero_elim'
  | 'corner_three'
  | 'adjacent_three_three'
  | 'adjacent_three_zero'
  | 'diagonal_three_three'
  | 'edge_count'
  | 'vertex_degree'
  | 'local_loop'
  | 'bifurcation';

/** Ascending difficulty — rater scans this order each step (SE-style restart). */
export const TECHNIQUE_ORDER: readonly SlitherlinkTechnique[] = [
  'zero_elim',
  'corner_three',
  'adjacent_three_three',
  'adjacent_three_zero',
  'diagonal_three_three',
  'edge_count',
  'vertex_degree',
  'local_loop',
  'bifurcation',
] as const;

const TECHNIQUE_RANK: Record<SlitherlinkTechnique, number> = Object.fromEntries(
  TECHNIQUE_ORDER.map((t, i) => [t, i]),
) as Record<SlitherlinkTechnique, number>;

export function techniqueRank(t: SlitherlinkTechnique): number {
  return TECHNIQUE_RANK[t];
}

export function maxTechnique(
  a: SlitherlinkTechnique | null,
  b: SlitherlinkTechnique,
): SlitherlinkTechnique {
  if (a == null) return b;
  return techniqueRank(b) > techniqueRank(a) ? b : a;
}

/** Peak technique → shared DifficultyTier (D-01, D-24). Never alias SlitherlinkDifficulty. */
export function peakToTier(peak: SlitherlinkTechnique): DifficultyTier {
  switch (peak) {
    case 'zero_elim':
    case 'corner_three':
      return 'easy';
    case 'adjacent_three_three':
    case 'adjacent_three_zero':
    case 'diagonal_three_three':
    case 'edge_count':
      return 'medium';
    case 'vertex_degree':
    case 'local_loop':
      return 'hard';
    case 'bifurcation':
      return 'expert';
  }
}
