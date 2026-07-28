/** Shared Easy→Expert ladder for mastery + future raters (TIER-01). Not SlitherlinkDifficulty. */

export const DIFFICULTY_TIERS = ['easy', 'medium', 'hard', 'expert'] as const;

export type DifficultyTier = (typeof DIFFICULTY_TIERS)[number];

export function isDifficultyTier(value: unknown): value is DifficultyTier {
  return (
    typeof value === 'string' &&
    (DIFFICULTY_TIERS as readonly string[]).includes(value)
  );
}

export function tierIndex(tier: DifficultyTier): number {
  return DIFFICULTY_TIERS.indexOf(tier);
}

export function tierFromIndex(i: number): DifficultyTier {
  const clamped = Math.max(0, Math.min(3, Math.floor(i)));
  return DIFFICULTY_TIERS[clamped]!;
}
