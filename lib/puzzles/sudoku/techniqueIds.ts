import type { DifficultyTier } from '../difficulty/tiers';

/** Ordered human-technique ladder for Sudoku rating (D-02). */
export type SudokuTechnique =
  | 'full_house'
  | 'naked_single'
  | 'hidden_single'
  | 'pointing'
  | 'claiming'
  | 'naked_pair'
  | 'hidden_pair'
  | 'naked_triple'
  | 'hidden_triple'
  | 'x_wing'
  | 'swordfish'
  | 'xy_wing'
  | 'short_chain';

/** Ascending difficulty — rater scans this order each step (SE-style restart). */
export const TECHNIQUE_ORDER: readonly SudokuTechnique[] = [
  'full_house',
  'naked_single',
  'hidden_single',
  'pointing',
  'claiming',
  'naked_pair',
  'hidden_pair',
  'naked_triple',
  'hidden_triple',
  'x_wing',
  'swordfish',
  'xy_wing',
  'short_chain',
] as const;

const TECHNIQUE_RANK: Record<SudokuTechnique, number> = Object.fromEntries(
  TECHNIQUE_ORDER.map((t, i) => [t, i]),
) as Record<SudokuTechnique, number>;

export function techniqueRank(t: SudokuTechnique): number {
  return TECHNIQUE_RANK[t];
}

export function maxTechnique(
  a: SudokuTechnique | null,
  b: SudokuTechnique,
): SudokuTechnique {
  if (a == null) return b;
  return techniqueRank(b) > techniqueRank(a) ? b : a;
}

/** Peak technique → shared DifficultyTier (D-01, D-02, A4). */
export function peakToTier(peak: SudokuTechnique): DifficultyTier {
  switch (peak) {
    case 'full_house':
    case 'naked_single':
    case 'hidden_single':
      return 'easy';
    case 'pointing':
    case 'claiming':
    case 'naked_pair':
    case 'hidden_pair':
      return 'medium';
    case 'naked_triple':
    case 'hidden_triple':
    case 'x_wing':
    case 'swordfish':
      return 'hard';
    case 'xy_wing':
    case 'short_chain':
      return 'expert';
  }
}
