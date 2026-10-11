/**
 * English DEV panel copy (structural parity).
 * Runtime panel uses zh via getStringsForLocale('zh') for Maestro label stability.
 */
export const devTools = {
  title: 'DEV tools',
  collapse: 'Collapse ▼',
  expand: 'Expand ▲',
  hide: 'Hide',
  hideA11y: 'Hide debug bar for screenshots',
  regenerating: 'Generating today’s puzzle…',
  streakPlaceholder: 'streak: —',
  settings: 'Settings stub',
  previewEnglish: 'Preview·English',
  fakeSunday: 'Fake date·Sunday',
  fakeNextDay: 'Fake date·next day',
  fakeNextDayA11y: 'Fake next day, no remint — carry hand QA',
  openCalendar: 'Open calendar',
  openCalendarA11y: 'Open calendar, DEV carry acceptance',
  clearFakeDate: 'Fake date·clear',
  naturalRandom: 'Natural random',
  reopenToday: 'Rebuild today',
  promptReview: 'Prompt review',
  resetCompletions: 'Reset completions',
  resetRating: 'Reset rating',
  injectBadBoard: 'Inject bad board',
  clearRecoveryLog: 'Clear recovery log',
  growthSection: 'Gentle growth QA (seed history → clear → result / calendar)',
  fillBoard: 'Fill board',
  fillBoardA11y: 'Fill board only — do not complete',
  oneTapClear: 'One-tap clear',
  streakSection: 'Streak / shield QA (inject → hydrate → game)',
  /** Separator between scenario label and hint in DEV help lines. */
  hintSep: ': ',
  recoveryLogTitle: (n: number) => `Recovery log (last ${n})`,
  helpFooter:
    'Tap a game type to clear today’s save and rebuild; Natural random follows the date algorithm. Rebuild today keeps type and mints a new puzzle. Or set DEV_FORCE_GAME_TYPE in constants/dev.ts. Prompt review opens the system dialog; reset buttons clear weekly stats / rating gates. Inject bad board writes completed+empty for recovery. Open calendar checks in_progress carry. Hide for screenshots; long-press Privacy Policy to show the bar again.',
  growth: {
    'growth-silent': {
      label: 'Recent·quiet',
      hint: 'Only yesterday cleared; no growth line after today’s win',
    },
    'growth-hot': {
      label: 'Recent·hot',
      hint: '≥6 clears in last 7 days incl. today → hot tone',
    },
    'growth-steady': {
      label: 'Recent·steady',
      hint: '4–5 clears in last 7 days incl. today → steady tone',
    },
    'growth-comeback': {
      label: 'Recent·comeback',
      hint: 'Last clear ≥3 days ago → long time no see',
    },
    'growth-calendar': {
      label: 'Calendar·beat last month',
      hint: '2 days last month + several this month; Sheet should append positive delta',
    },
    'growth-smoother': {
      label: 'Easter·smoother same type',
      hint: 'Slower same-weekday history; faster today → smoother line',
    },
  },
  streak: {
    clear: {
      label: 'Clear streak',
      hint: 'Delete streak storage; hydrate like a fresh install',
    },
    'gap2-recall': {
      label: 'Missed recall',
      hint: 'Last check-in = day before yesterday, no shield; expect recall banner',
    },
    'gap2-freeze-ready': {
      label: 'Shield ready',
      hint: 'Last check-in = day before yesterday, shield×1; auto-consume freeze line',
    },
    'gap2-yesterday-real': {
      label: 'Yesterday real clear',
      hint: 'Day-before check-in + yesterday real clear; repair without shield',
    },
    'freeze-consumed-ui': {
      label: 'Shield used',
      hint: 'Consumed state: freeze line only, no recall banner',
    },
    'shields-full': {
      label: 'Shield×2',
      hint: 'Result card 3 subline should include Shield×2',
    },
    'weekly-grant-pending': {
      label: 'Week rollover +1',
      hint: 'Granted last week; hydrate freezeCount +1 (cap 2)',
    },
  },
} as const;
