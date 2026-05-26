import {
  pickAbandonShareTail,
  pickNonogramShareTail,
  pickSuccessShareTail,
  SHARE_CARD_CTA,
} from '../copy/shareCaption';
import type {
  DailyStatus,
  GameType,
  NonogramPlayState,
  PlayState,
  PuzzlePayload,
} from '../puzzles/types';
import {
  isBinaryPuzzle,
  isNonogramPuzzle,
  isSudokuPuzzle,
} from '../puzzles/types';
import { SHARE_EMOJI_COMPLETE, SHARE_EMOJI_WARN } from './emojiGrid';
import { formatElapsedClock } from '../time/formatElapsedClock';
import {
  softenGridForAbandon,
  summarizeBinaryGrid,
  summarizeNonogramGrid,
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

const GAME_TYPE_LABEL: Record<GameType, string> = {
  sudoku: '数独',
  binary: '二进制',
  nonogram: '数绘',
};

const SLOW_ELAPSED_MS = 8 * 60 * 1000;
const FAST_ELAPSED_MS = 2 * 60 * 1000;
const STREAK_SHARE_MIN_DAYS = 7;

export function formatShareElapsed(ms: number): string {
  return formatElapsedClock(ms);
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
): string {
  if (status === 'abandoned') {
    return '';
  }
  if (gridHasWarnTone(grid)) {
    return ' · 曾翻车';
  }
  if (elapsedMs >= SLOW_ELAPSED_MS) {
    return ' · 慢热局';
  }
  if (elapsedMs <= FAST_ELAPSED_MS) {
    return ' · 手速局';
  }
  if (gridIsAllComplete(grid)) {
    return ' · 干净局';
  }
  return '';
}

function pickStreakSuffix(
  status: ShareCardInput['status'],
  streakDays?: number,
): string {
  if (status !== 'completed') {
    return '';
  }
  if (streakDays == null || streakDays < STREAK_SHARE_MIN_DAYS) {
    return '';
  }
  return ` · 连签 ${streakDays} 天`;
}

function buildBattleLine(input: ShareCardInput, grid: string): string {
  const elapsed = formatShareElapsed(input.elapsedMs);
  const battleSuffix = pickBattleSuffix(input.status, input.elapsedMs, grid);
  const streakSuffix = pickStreakSuffix(input.status, input.streakDays);

  if (input.status === 'abandoned') {
    return `🏳 认怂 · 用时 ${elapsed}`;
  }
  return `✅ 通关 · 用时 ${elapsed}${battleSuffix}${streakSuffix}`;
}

function buildTailLine(input: ShareCardInput): string | null {
  if (input.status === 'abandoned') {
    return pickAbandonShareTail();
  }
  if (input.gameType === 'nonogram') {
    return pickNonogramShareTail(input.seed ?? 0, input.dateKey);
  }
  if (input.status === 'completed') {
    return pickSuccessShareTail(input.seed ?? 0, input.dateKey);
  }
  return null;
}

export function buildShareCard(input: ShareCardInput): string {
  const label = GAME_TYPE_LABEL[input.gameType];
  const grid = summarizeGrid(input);

  const lines = [
    `傻了么 · ${label} · ${input.dateKey}`,
    buildBattleLine(input, grid),
    grid,
  ];

  const tail = buildTailLine(input);
  if (tail != null) {
    lines.push(tail);
  }
  lines.push(SHARE_CARD_CTA);

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
