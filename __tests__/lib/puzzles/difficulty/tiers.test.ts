import {
  DIFFICULTY_TIERS,
  isDifficultyTier,
  tierFromIndex,
  tierIndex,
  type DifficultyTier,
} from '../../../../lib/puzzles/difficulty/tiers';

describe('DifficultyTier helpers', () => {
  it('exports four tiers including expert', () => {
    expect(DIFFICULTY_TIERS).toEqual(['easy', 'medium', 'hard', 'expert']);
    expect(DIFFICULTY_TIERS).toHaveLength(4);
  });

  it('maps tierIndex 0..3', () => {
    expect(tierIndex('easy')).toBe(0);
    expect(tierIndex('medium')).toBe(1);
    expect(tierIndex('hard')).toBe(2);
    expect(tierIndex('expert')).toBe(3);
  });

  it('clamps tierFromIndex to 0..3', () => {
    expect(tierFromIndex(-2)).toBe('easy');
    expect(tierFromIndex(0)).toBe('easy');
    expect(tierFromIndex(1.9)).toBe('medium');
    expect(tierFromIndex(3)).toBe('expert');
    expect(tierFromIndex(99)).toBe('expert');
  });

  it('isDifficultyTier rejects unknown strings', () => {
    expect(isDifficultyTier('easy')).toBe(true);
    expect(isDifficultyTier('expert')).toBe(true);
    expect(isDifficultyTier('nightmare')).toBe(false);
    expect(isDifficultyTier('')).toBe(false);
    expect(isDifficultyTier(null)).toBe(false);
    // SlitherlinkDifficulty has no expert — still a valid DifficultyTier string when 'easy'
    const maybe: DifficultyTier = 'easy';
    expect(isDifficultyTier(maybe)).toBe(true);
  });
});
