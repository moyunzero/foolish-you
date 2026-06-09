jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { pickResultCopy } from '../../../lib/copy/resultMessages';
import { getGameRules } from '../../../lib/copy/gameRules';
import { formatStreakLine } from '../../../lib/copy/streak';
import { formatFreezeShieldSuffix, pickFreezeConsumedLine } from '../../../lib/copy/freeze';
import { pickMissedYesterdayLine } from '../../../lib/copy/missedYesterday';
import { getGameTypeLabel } from '../../../lib/i18n/gameLabels';
import { getStringsForLocale } from '../../../lib/i18n/strings';
import { generateSudokuPuzzle } from '../../../lib/puzzles/sudoku/generator';
import { createEmptyGrid as createEmptySudokuGrid } from '../../../lib/puzzles/sudoku/grid';
import { buildShareCard } from '../../../lib/share/buildShareCard';

const DATE_KEY = '2026-05-25';
const SEED = 42_424_242;

describe('English locale smoke', () => {
  it('formatStreakLine uses English copy', () => {
    expect(
      formatStreakLine(
        {
          displayStreak: 3,
          checkedInToday: true,
          streakBroken: false,
        },
        'en',
      ),
    ).toContain('3 days');
    expect(
      formatStreakLine(
        {
          displayStreak: 3,
          checkedInToday: true,
          streakBroken: false,
        },
        'en',
      ),
    ).toContain('No silly business today');
    expect(
      formatStreakLine(
        {
          displayStreak: 3,
          checkedInToday: false,
          streakBroken: false,
        },
        'en',
      ),
    ).toContain('Today’s puzzle still open');
    expect(
      formatStreakLine(
        {
          displayStreak: 3,
          checkedInToday: true,
          streakBroken: false,
        },
        'en',
      ),
    ).not.toMatch(/[\u4e00-\u9fff]/);
  });

  it('pickResultCopy completed returns English without CJK', () => {
    const copy = pickResultCopy('completed', 125_000, DATE_KEY, SEED, 'en');
    const cjk = /[\u4e00-\u9fff]/;

    expect(copy.mode).toBe('completed');
    expect(copy.headline).not.toMatch(cjk);
    expect(copy.punchline).not.toMatch(cjk);
    expect(copy.cta).not.toMatch(cjk);
  });

  it('binary rules mention row and column triple ban', () => {
    const bullet = getGameRules('en').binary.bullets[1];
    expect(bullet).toMatch(/row or column/i);
  });

  it('nonogram rules mention gaps between clue blocks', () => {
    const bullet = getGameRules('en').nonogram.bullets[1];
    expect(bullet).toMatch(/at least one empty cell/i);
  });

  it('slitherlink rules describe tap cycle from undecided', () => {
    const bullet = getGameRules('en').slitherlink.bullets[0];
    expect(bullet).toMatch(/undecided → line → ×/i);
  });

  it('slitherlink label and rules title are English without CJK', () => {
    const cjk = /[\u4e00-\u9fff]/;
    expect(getGameTypeLabel('slitherlink', 'en')).toBe('Slitherlink');
    expect(getGameRules('en').slitherlink.title).not.toMatch(cjk);
    expect(getGameRules('en').slitherlink.title.length).toBeGreaterThan(0);
  });

  it('buildShareCard includes Brainfool branding', () => {
    const puzzle = generateSudokuPuzzle(SEED);
    const card = buildShareCard(
      {
        gameType: 'sudoku',
        dateKey: DATE_KEY,
        elapsedMs: 138_000,
        status: 'completed',
        playState: createEmptySudokuGrid(),
        puzzle,
        seed: SEED,
        streakDays: 2,
      },
      'en',
    );

    expect(card).toContain('Brainfool');
    expect(card).toContain('#Brainfool');
    expect(card).not.toContain('傻了么');
  });

  it('freeze copy is English without CJK', () => {
    const cjk = /[\u4e00-\u9fff]/;
    expect(pickFreezeConsumedLine(DATE_KEY, SEED, 'en')).not.toMatch(cjk);
    expect(formatFreezeShieldSuffix(2, 'en')).toContain('Shield');
    expect(pickMissedYesterdayLine({
      todayKey: DATE_KEY,
      seed: SEED,
      locale: 'en',
      freezeConsumedToday: false,
    })).not.toMatch(cjk);
  });

  it('calendar UI strings are English without CJK', () => {
    const ui = getStringsForLocale('en').ui;
    const cjk = /[\u4e00-\u9fff]/;

    expect(ui.calendar.viewMonthLink).not.toMatch(cjk);
    expect(ui.calendar.viewMonthA11y).not.toMatch(cjk);
    expect(ui.sheet.dismissA11y).not.toMatch(cjk);
    expect(ui.calendar.streakLine(3)).not.toMatch(cjk);
    expect(ui.calendar.completedLine(2)).not.toMatch(cjk);
    expect(ui.calendar.emptyHeading).not.toMatch(cjk);
    expect(ui.gallery.generateCta).not.toMatch(cjk);
    expect(ui.gallery.generateCta.length).toBeGreaterThan(0);
    expect(ui.gallery.errorExport).not.toMatch(cjk);
  });

  it('reminder UI strings are English without CJK', () => {
    const ui = getStringsForLocale('en').ui;
    const cjk = /[\u4e00-\u9fff]/;

    expect(ui.reminder.softAsk.cta).not.toMatch(cjk);
    expect(ui.reminder.sheet.title).not.toMatch(cjk);
    expect(ui.reminder.banner.bodyNoPush).not.toMatch(cjk);
    expect(ui.reminder.errorPermissionDenied).not.toMatch(cjk);
    expect(ui.sheet.dismissReminderA11y).not.toMatch(cjk);
  });
});
