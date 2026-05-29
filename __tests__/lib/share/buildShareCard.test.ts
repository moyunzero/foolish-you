import { generateBinaryPuzzle } from '../../../lib/puzzles/binary/generator';
import { createEmptyGrid as createEmptyBinaryGrid } from '../../../lib/puzzles/binary/grid';
import { generateNonogramPuzzle } from '../../../lib/puzzles/nonogram/generator';
import { createEmptyGrid as createEmptyNonogramGrid } from '../../../lib/puzzles/nonogram/grid';
import { NONOGRAM_FILL } from '../../../lib/puzzles/nonogram/spec';
import { generateSudokuPuzzle } from '../../../lib/puzzles/sudoku/generator';
import { createEmptyGrid as createEmptySudokuGrid } from '../../../lib/puzzles/sudoku/grid';
import { SHARE_CARD_CTA } from '../../../lib/copy/shareCaption';
import {
  buildShareCard,
  formatShareElapsed,
  shareGridHasNoDigits,
  shareGridLines,
} from '../../../lib/share/buildShareCard';

const DATE_KEY = '2026-05-25';
const SECRET_TITLE = '绝密图案-不应出现';

function makeNonogramFixture() {
  const puzzle = generateNonogramPuzzle(777);
  return {
    ...puzzle,
    pictureTitle: SECRET_TITLE,
  };
}

describe('formatShareElapsed', () => {
  it('formats mm:ss', () => {
    expect(formatShareElapsed(222_000)).toBe('03:42');
    expect(formatShareElapsed(138_000)).toBe('02:18');
  });
});

describe('buildShareCard', () => {
  it('builds sudoku completed card under 280 chars without grid digits', () => {
    const puzzle = generateSudokuPuzzle(9001);
    const card = buildShareCard({
      gameType: 'sudoku',
      dateKey: DATE_KEY,
      elapsedMs: 222_000,
      status: 'completed',
      playState: createEmptySudokuGrid(),
      puzzle,
      seed: 9001,
      streakDays: 7,
    }, 'zh');

    expect(card).toContain('傻了么 · 数独 · 2026-05-25');
    expect(card).toContain('✅ 通关 · 用时 03:42 · 连签 7 天');
    expect(card).toContain(SHARE_CARD_CTA);
    expect(shareGridLines(card)).toHaveLength(3);
    expect(card).toMatch(/[🟩🟨⬛]/);
    expect(card.length).toBeLessThanOrEqual(280);
    expect(shareGridHasNoDigits(card)).toBe(true);
  });

  it('omits streak in share when streak is below 7', () => {
    const puzzle = generateSudokuPuzzle(9001);
    const card = buildShareCard({
      gameType: 'sudoku',
      dateKey: DATE_KEY,
      elapsedMs: 636_000,
      status: 'completed',
      playState: createEmptySudokuGrid(),
      puzzle,
      seed: 9001,
      streakDays: 2,
    }, 'zh');

    expect(card).toContain('✅ 通关 · 用时 10:36 · 慢热局');
    expect(card).not.toContain('连签');
  });

  it('builds binary completed card', () => {
    const puzzle = generateBinaryPuzzle(4242);
    const card = buildShareCard({
      gameType: 'binary',
      dateKey: DATE_KEY,
      elapsedMs: 138_000,
      status: 'completed',
      playState: createEmptyBinaryGrid(),
      puzzle,
      seed: 4242,
      streakDays: 3,
    }, 'zh');

    expect(card).toContain('傻了么 · 二进制 · 2026-05-25');
    expect(card).toContain('✅ 通关');
    expect(shareGridLines(card)).toHaveLength(4);
    expect(card.length).toBeLessThanOrEqual(280);
    expect(shareGridHasNoDigits(card)).toBe(true);
  });

  it('builds nonogram completed card without pictureTitle', () => {
    const puzzle = makeNonogramFixture();
    const play = createEmptyNonogramGrid();
    play[0]![0] = NONOGRAM_FILL;

    const card = buildShareCard({
      gameType: 'nonogram',
      dateKey: DATE_KEY,
      elapsedMs: 249_000,
      status: 'completed',
      playState: play,
      puzzle,
      seed: 777,
      streakDays: 2,
    }, 'zh');

    expect(card).toContain('傻了么 · 数绘 · 2026-05-25');
    expect(card).not.toContain(SECRET_TITLE);
    expect(card).not.toContain('绝密');
    expect(card).toMatch(/（.+）/);
    expect(card.length).toBeLessThanOrEqual(280);
    expect(shareGridHasNoDigits(card)).toBe(true);
  });

  it('builds sudoku abandoned card with mostly empty squares', () => {
    const puzzle = generateSudokuPuzzle(9001);
    const card = buildShareCard({
      gameType: 'sudoku',
      dateKey: DATE_KEY,
      elapsedMs: 68_000,
      status: 'abandoned',
      playState: createEmptySudokuGrid(),
      puzzle,
      seed: 9001,
    }, 'zh');

    expect(card).toContain('🏳 认怂 · 用时 01:08');
    expect(card).toContain('⬛');
    expect(card).toContain('明天还来挨打。');
    expect(card).toContain(SHARE_CARD_CTA);
    expect(shareGridLines(card)).toHaveLength(3);
    expect(card.length).toBeLessThanOrEqual(280);
  });

  it('builds binary abandoned card', () => {
    const puzzle = generateBinaryPuzzle(4242);
    const card = buildShareCard({
      gameType: 'binary',
      dateKey: DATE_KEY,
      elapsedMs: 90_000,
      status: 'abandoned',
      playState: createEmptyBinaryGrid(),
      puzzle,
      seed: 4242,
    }, 'zh');

    expect(card).toContain('傻了么 · 二进制');
    expect(card).toContain('🏳 认怂');
    expect(card.length).toBeLessThanOrEqual(280);
  });

  it('builds nonogram abandoned card without pictureTitle', () => {
    const puzzle = makeNonogramFixture();
    const card = buildShareCard({
      gameType: 'nonogram',
      dateKey: DATE_KEY,
      elapsedMs: 120_000,
      status: 'abandoned',
      playState: createEmptyNonogramGrid(),
      puzzle,
      seed: 777,
    }, 'zh');

    expect(card).not.toContain(SECRET_TITLE);
    expect(card).toContain('🏳 认怂');
    expect(card.length).toBeLessThanOrEqual(280);
  });

  it('builds english sudoku header when locale is en', () => {
    const puzzle = generateSudokuPuzzle(9001);
    const card = buildShareCard(
      {
        gameType: 'sudoku',
        dateKey: DATE_KEY,
        elapsedMs: 222_000,
        status: 'completed',
        playState: createEmptySudokuGrid(),
        puzzle,
        seed: 9001,
        streakDays: 7,
      },
      'en',
    );

    expect(card).toContain('Silly Me · Sudoku · 2026-05-25');
    expect(card).toContain('✅ Cleared');
    expect(card).not.toContain('傻了么');
  });
});
