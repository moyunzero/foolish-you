jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { pickResultCopy } from '../../../lib/copy/resultMessages';
import { getGameRules } from '../../../lib/copy/gameRules';
import { formatStreakLine } from '../../../lib/copy/streak';
import { formatFreezeShieldSuffix, pickFreezeConsumedLine } from '../../../lib/copy/freeze';
import { pickMissedYesterdayLine } from '../../../lib/copy/missedYesterday';
import { pickGrowthLine } from '../../../lib/copy/growthLine';
import { pickAbandonConfirmBody } from '../../../lib/copy/abandonConfirm';
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

  it('Sunday Special copy keys exist and English Sunday roast has no CJK', () => {
    const en = getStringsForLocale('en');
    const cjk = /[\u4e00-\u9fff]/;
    const sunday = '2026-07-12';

    expect(en.copy.sundaySpecial.gameSubline).toBe('Sunday Special.');
    expect(en.copy.sundaySpecial.gameSubline).not.toMatch(cjk);

    const completed = pickResultCopy('completed', 90_000, sunday, SEED, 'en');
    const abandoned = pickResultCopy('abandoned', 90_000, sunday, SEED, 'en');
    expect(completed.punchline).not.toMatch(cjk);
    expect(abandoned.punchline).not.toMatch(cjk);
    expect(en.copy.resultPools.sundaySuccessPunchlines.length).toBeGreaterThan(0);
    expect(en.copy.resultPools.sundayFailPunchlines.length).toBeGreaterThan(0);
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

  it('growth line copy is English without CJK for all tones', () => {
    const cjk = /[\u4e00-\u9fff]/;
    for (const tone of ['comeback', 'hot', 'steady', 'smoother'] as const) {
      const line = pickGrowthLine(tone, DATE_KEY, SEED, 'en');
      expect(line.length).toBeGreaterThan(0);
      expect(line).not.toMatch(cjk);
    }
  });

  it('calendar UI strings are English without CJK', () => {
    const ui = getStringsForLocale('en').ui;
    const cjk = /[\u4e00-\u9fff]/;

    expect(ui.calendar.viewMonthLink).not.toMatch(cjk);
    expect(ui.calendar.viewMonthA11y).not.toMatch(cjk);
    expect(ui.sheet.dismissA11y).not.toMatch(cjk);
    expect(ui.calendar.streakLine(3)).not.toMatch(cjk);
    expect(ui.calendar.completedLine(2)).not.toMatch(cjk);
    expect(ui.calendar.completedDeltaLine(2)).not.toMatch(cjk);
    expect(ui.calendar.completedDeltaLine(2).length).toBeGreaterThan(0);
    expect(ui.calendar.emptyHeading).not.toMatch(cjk);
    expect(ui.gallery.generateCta).not.toMatch(cjk);
    expect(ui.gallery.generateCta.length).toBeGreaterThan(0);
    expect(ui.gallery.errorExport).not.toMatch(cjk);
  });

  it('reminder UI strings are English without CJK', () => {
    const ui = getStringsForLocale('en').ui;
    const cjk = /[\u4e00-\u9fff]/;

    expect(ui.reminder.softAsk.cta).not.toMatch(cjk);
    expect(ui.reminder.softAsk.dismissA11y).not.toMatch(cjk);
    expect(ui.reminder.sheet.title).not.toMatch(cjk);
    expect(ui.reminder.banner.bodyNoPush).not.toMatch(cjk);
    expect(ui.reminder.banner.dismissA11y).not.toMatch(cjk);
    expect(ui.reminder.errorPermissionDenied).not.toMatch(cjk);
    expect(ui.sheet.dismissReminderA11y).not.toMatch(cjk);
  });

  it('abandon confirm English pool has no CJK', () => {
    const cjk = /[\u4e00-\u9fff]/;
    expect(
      pickAbandonConfirmBody({ dateKey: DATE_KEY, seed: SEED, locale: 'en' }),
    ).not.toMatch(cjk);
  });

  it('composition UI keys exist and English has no CJK', () => {
    const ui = getStringsForLocale('en').ui;
    const cjk = /[\u4e00-\u9fff]/;

    expect(ui.game.bailToday).toBe('Bail today');
    expect(ui.game.bailToday).not.toMatch(cjk);
    expect(ui.abandonSheet.keepGoing).toBe('Keep going');
    expect(ui.abandonSheet.bail).toBe('Bail');
    expect(ui.abandonSheet.keepGoing).not.toMatch(cjk);
    expect(ui.abandonSheet.bail).not.toMatch(cjk);
    expect(ui.result.sectionOutcome).toBe('Outcome');
    expect(ui.result.sectionStats).toBe('Stats');
    expect(ui.result.sectionOutcome).not.toMatch(cjk);
    expect(ui.result.sectionStats).not.toMatch(cjk);
    expect(ui.sheet.dismissAbandonA11y).not.toMatch(cjk);
  });
});
