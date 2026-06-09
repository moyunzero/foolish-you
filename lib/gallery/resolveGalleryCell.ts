import { selectDailyGameSafe } from '../puzzles/dailySelectorSafe';
import type { CompletionOutcome } from '../storage/completionHistoryStorage';
import { buildShareEmojiGrid } from '../share/buildShareCard';
import type { NonogramPuzzle } from '../puzzles/types';
import { isNonogramPuzzle } from '../puzzles/types';
import { buildSyntheticPlayState } from './syntheticPlayState';

export type GalleryNonogramCell = {
  kind: 'nonogram';
  dateKey: string;
  puzzle: NonogramPuzzle;
  outcome: CompletionOutcome;
};

export type GalleryEmojiCell = {
  kind: 'emoji';
  dateKey: string;
  emojiGrid: string;
  outcome: CompletionOutcome;
};

export type GalleryCell = GalleryNonogramCell | GalleryEmojiCell;

export type ResolveGalleryCellInput = {
  dateKey: string;
  outcome: CompletionOutcome;
};

/** Resolve one gallery tile from deterministic daily puzzle + outcome tone (D-31). */
export function resolveGalleryCell(input: ResolveGalleryCellInput): GalleryCell {
  const { dateKey, outcome } = input;
  const daily = selectDailyGameSafe({ dateKey });
  const status = outcome === 'abandoned' ? 'abandoned' : 'completed';

  if (daily.gameType === 'nonogram' && isNonogramPuzzle(daily.puzzle)) {
    return {
      kind: 'nonogram',
      dateKey,
      puzzle: daily.puzzle,
      outcome,
    };
  }

  const playState = buildSyntheticPlayState(daily.gameType, daily.puzzle, status);
  const emojiGrid = buildShareEmojiGrid({
    gameType: daily.gameType,
    dateKey,
    elapsedMs: 0,
    status,
    playState,
    puzzle: daily.puzzle,
    seed: daily.seed,
  });

  return {
    kind: 'emoji',
    dateKey,
    emojiGrid,
    outcome,
  };
}
