import {
  getShareCardCta,
  pickAbandonShareTailSeeded,
  pickNonogramShareTail,
  pickSuccessShareTail,
} from '../copy/shareCaption';
import { getAppDisplayName } from '../i18n/format';
import { getGameTypeLabel } from '../i18n/gameLabels';
import type { Locale } from '../i18n/types';
import { getStringsForLocale } from '../i18n/strings';
import type {
  DailyStatus,
  GameType,
  NonogramPlayState,
  PlayState,
  PuzzlePayload,
  SlitherlinkPlayState,
} from '../puzzles/types';
import {
  isBinaryPuzzle,
  isNonogramPuzzle,
  isSlitherlinkPuzzle,
  isSudokuPuzzle,
} from '../puzzles/types';
import { SHARE_EMOJI_COMPLETE, SHARE_EMOJI_WARN } from './emojiGrid';
import { formatElapsedClock } from '../time/formatElapsedClock';
import {
  softenGridForAbandon,
  summarizeBinaryGrid,
  summarizeNonogramGrid,
  summarizeSlitherlinkGrid,
  summarizeSudokuGrid,
} from './cellSummarize';

export type ShareCardInput = {
  gameType: GameType;
  dateKey: string;
  elapsedMs: number;
  status: Exclude<DailyStatus, 'playing'>;
  playState: PlayState;
  puzzle: PuzzlePayload;
  seed?: number | null;
  streakDays?: number;
};

const SLOW_ELAPSED_MS = 8 * 60 * 1000;
const FAST_ELAPSED_MS = 2 * 60 * 1000;
const STREAK_SHARE_MIN_DAYS = 7;

export function formatShareElapsed(ms: number): string {
  return formatElapsedClock(ms);
}

/** Emoji grid lines only — used by monthly gallery (D-31). */
export function buildShareEmojiGrid(input: ShareCardInput): string {
  return summarizeGrid(input);
}

function summarizeGrid(input: ShareCardInput): string {
  const { gameType, playState, puzzle, status } = input;

  let grid: string;
  if (gameType === 'sudoku' && isSudokuPuzzle(puzzle)) {
    grid = summarizeSudokuGrid(playState as number[][], puzzle.givens);
  } else if (gameType === 'binary' && isBinaryPuzzle(puzzle)) {
    grid = summarizeBinaryGrid(playState as number[][], puzzle.givens);
  } else if (gameType === 'nonogram' && isNonogramPuzzle(puzzle)) {
    grid = summarizeNonogramGrid(playState as NonogramPlayState);
  } else if (gameType === 'slitherlink' && isSlitherlinkPuzzle(puzzle)) {
    grid = summarizeSlitherlinkGrid(
      playState as SlitherlinkPlayState,
      puzzle,
    );
  } else {
    grid = '⬛⬛⬛⬛\n⬛⬛⬛⬛\n⬛⬛⬛⬛\n⬛⬛⬛⬛';
  }

  if (status === 'abandoned') {
    return softenGridForAbandon(grid);
  }
  return grid;
}

function gridHasWarnTone(grid: string): boolean {
  return grid.includes(SHARE_EMOJI_WARN);
}

function gridIsAllComplete(grid: string): boolean {
  const emojiLines = grid.split('\n').filter((line) => line.length > 0);
  if (emojiLines.length === 0) return false;
  return emojiLines.every((line) =>
    [...line].every((ch) => ch === SHARE_EMOJI_COMPLETE),
  );
}

function pickBattleSuffix(
  status: ShareCardInput['status'],
  elapsedMs: number,
  grid: string,
  locale: Locale,
): string {
  const sc = getStringsForLocale(locale).ui.shareCard;
  if (status === 'abandoned') {
    return '';
  }
  if (gridHasWarnTone(grid)) {
    return sc.suffixHadMistakes;
  }
  if (elapsedMs >= SLOW_ELAPSED_MS) {
    return sc.suffixSlow;
  }
  if (elapsedMs <= FAST_ELAPSED_MS) {
    return sc.suffixFast;
  }
  if (gridIsAllComplete(grid)) {
    return sc.suffixClean;
  }
  return '';
}

function pickStreakSuffix(
  status: ShareCardInput['status'],
  streakDays: number | undefined,
  locale: Locale,
): string {
  if (status !== 'completed') {
    return '';
  }
  if (streakDays == null || streakDays < STREAK_SHARE_MIN_DAYS) {
    return '';
  }
  return getStringsForLocale(locale).ui.shareCard.streakDays(streakDays);
}

function buildBattleLine(input: ShareCardInput, grid: string, locale: Locale): string {
  const elapsed = formatShareElapsed(input.elapsedMs);
  const battleSuffix = pickBattleSuffix(input.status, input.elapsedMs, grid, locale);
  const streakSuffix = pickStreakSuffix(input.status, input.streakDays, locale);
  const sc = getStringsForLocale(locale).ui.shareCard;

  if (input.status === 'abandoned') {
    return sc.abandoned(elapsed);
  }
  return sc.completed(elapsed, battleSuffix, streakSuffix);
}

function buildTailLine(input: ShareCardInput, locale: Locale): string | null {
  if (input.status === 'abandoned') {
    return pickAbandonShareTailSeeded(
      input.seed ?? 0,
      input.dateKey,
      locale,
    );
  }
  if (input.gameType === 'nonogram') {
    return pickNonogramShareTail(input.seed ?? 0, input.dateKey, locale);
  }
  if (input.status === 'completed') {
    return pickSuccessShareTail(input.seed ?? 0, input.dateKey, locale);
  }
  return null;
}

export function buildShareCard(
  input: ShareCardInput,
  locale: Locale = 'zh',
): string {
  const label = getGameTypeLabel(input.gameType, locale);
  const appName = getAppDisplayName(locale);
  const grid = summarizeGrid(input);

  const lines = [
    `${appName} · ${label} · ${input.dateKey}`,
    buildBattleLine(input, grid, locale),
    grid,
  ];

  const tail = buildTailLine(input, locale);
  if (tail != null) {
    lines.push(tail);
  }
  lines.push(getShareCardCta(locale));

  return lines.join('\n');
}

const EMOJI_GRID_LINE = /^[🟩🟨⬛]+$/u;

/** 战报 emoji 区行（仅方格行，不含战况/尾句/CTA） */
export function shareGridLines(card: string): string[] {
  return card.split('\n').filter((line) => EMOJI_GRID_LINE.test(line));
}

export function shareGridHasNoDigits(card: string): boolean {
  return shareGridLines(card).every((line) => !/[0-9]/.test(line));
}
