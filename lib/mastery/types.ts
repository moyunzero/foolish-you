import type { DifficultyTier } from '../puzzles/difficulty/tiers';
import type { GameType } from '../puzzles/types';

export type MasteryGrade = 'again' | 'hard' | 'good' | 'easy';

export type MasteryOutcome = 'completed' | 'abandoned';

export type GameTypeMastery = {
  stabilityDays: number;
  tier: DifficultyTier;
  lastPracticedAtMs: number | null;
  lastOutcome: MasteryOutcome | null;
  consecutiveUp: number;
  consecutiveDown: number;
};

export type MasteryState = {
  byType: Record<GameType, GameTypeMastery>;
};

export type ApplyMasteryOutcomeInput = {
  gameType: GameType;
  outcome: MasteryOutcome;
  elapsedMs: number;
  nowMs: number;
};

export type ResolveTargetTierInput = {
  gameType: GameType;
  dateKey: string;
  mastery: MasteryState;
  nowMs?: number;
};
