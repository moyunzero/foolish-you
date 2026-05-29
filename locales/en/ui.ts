/** English UI strings — MVP (Plan 02). */
export const ui = {
  common: {
    back: 'Back',
    gotIt: 'Got it',
    later: 'Later',
    retryTap: 'Tap to retry',
    reload: 'Reload',
    retrySave: 'Retry save',
    retryStreak: 'Retry streak',
    timer: 'Time',
  },
  index: {
    loadingPuzzle: 'Loading today’s puzzle…',
    errorReloading: 'Something went wrong. Reloading today’s puzzle…',
  },
  game: {
    completeToday: 'Complete today',
    giveUpToday: 'Give up today',
    loadFailed: 'Couldn’t load today’s puzzle. Local data may be corrupted.',
  },
  result: {
    loadingStatus: 'Loading today’s result…',
    statusWin: 'Cleared',
    statusSurrender: 'Gave up',
    recordPrefix: 'Today ·',
    elapsedPrefix: 'Time: ',
    foolIndexPrefix: 'Silly index: ',
    daysSuffix: ' days',
  },
  privacy: {
    openInBrowser: 'Open public version in browser',
    publicUrlA11y: 'Public privacy policy URL',
    cannotOpenLinkTitle: 'Can’t open link',
    cannotOpenLinkMessage:
      'Try again later, or open the public privacy policy in your browser.',
  },
  share: {
    copyReport: 'Copy report',
    copying: 'Copying…',
    copied: 'Copied',
    copyFailed: 'Copy failed — tap again',
    copyReportA11y: 'Copy today’s report',
    copiedA11y: 'Report copied to clipboard',
    failedA11y: 'Failed to copy report',
    hint: 'No spoilers — paste into chat',
  },
  stats: {
    today: 'Today',
    thisWeek: 'This week',
    bestStreak: 'Best streak',
  },
  gameTypes: {
    sudoku: 'Sudoku',
    binary: 'Binary',
    nonogram: 'Nonogram',
  },
  nonogramReveal: {
    prefix: 'Today’s picture ·',
  },
  rules: {
    closeA11y: 'Close rules',
    viewRulesA11y: (title: string) => `View ${title}`,
  },
  badges: {
    foolA11y: 'Silly achievement icon',
    winA11y: 'Clear achievement icon',
  },
  legal: {
    privacyLink: 'Privacy policy',
    privacyA11y: 'View privacy policy',
    lastUpdated: (date: string) => `Last updated: ${date}`,
  },
  settings: {
    title: 'Settings (placeholder)',
    subtitle: 'Language follows the system; in-app switching comes later.',
    previewNote:
      'Dev preview only — not persisted. Restarts follow the system language again.',
    deviceLabel: (locale: string) => `System language → ${locale}`,
    segments: {
      system: 'System',
      zh: '中文',
      en: 'English',
    },
    segmentA11y: (choice: string) => `Preview language: ${choice}`,
  },
  login: {
    title: 'Sign in later',
    subtitle: 'Account sync is coming in a future version',
    backToToday: 'Back to today',
  },
  hooks: {
    sudoku: {
      complete: 'All correct — you can finish',
      conflict: 'Conflicts — check highlighted cells',
      selectCell: 'Tap an empty cell, then pick a number',
    },
    binary: {
      complete: 'All rules satisfied — you can finish',
      conflict: 'Rule break — check highlighted cells',
      tapHint: 'Tap to cycle · long-press to clear',
    },
    nonogram: {
      complete: 'Picture matches — you can finish',
      tapHint: 'Tap to cycle · long-press to clear',
    },
  },
  alerts: {
    abandonTitle: 'Give up today’s puzzle?',
    abandonMessage:
      'Progress will be saved as “gave up”. You can try again tomorrow.',
    continuePlay: 'Keep playing',
    giveUp: 'Give up',
    saveFailedTitle: 'Save failed',
    saveFailedMessage:
      'Couldn’t save progress locally. Try again or tap Retry save.',
    streakSaveFailedTitle: 'Streak save failed',
    streakSaveFailedMessage:
      'Couldn’t save streak locally. Try again or tap Retry streak.',
  },
  shareCard: {
    completed: (elapsed: string, suffix: string, streak: string) =>
      `✅ Cleared · ${elapsed}${suffix}${streak}`,
    abandoned: (elapsed: string) => `🏳 Gave up · ${elapsed}`,
    suffixHadMistakes: ' · rough edges',
    suffixSlow: ' · slow burn',
    suffixFast: ' · speed run',
    suffixClean: ' · clean grid',
    streakDays: (days: number) => ` · ${days}-day streak`,
  },
  grid: {
    rowCol: (row: number, col: number) => `Row ${row + 1}, column ${col + 1}`,
    empty: ', empty',
    filled: ', filled',
    marked: ', marked',
    given: 'Given',
    filledCell: 'Filled',
    knownGiven: 'Given',
    conflictSudoku: ', conflicts with row, column, or box',
    conflictBinary: ', breaks a rule',
    sudokuGivenA11y: 'Given digit — cannot change',
    sudokuConflictA11y: 'Duplicates in row, column, or box',
    sudokuCellA11y: 'Tap to select, long-press to clear',
    clearCell: 'Clear this cell',
    clear: 'Clear',
    digitDisabled: (n: number) => `Digit ${n} already used in row, column, or box`,
    fillDigit: (n: number) => `Enter ${n}`,
  },
} as const;
