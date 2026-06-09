/** English UI strings — MVP (Plan 02). */
export const ui = {
  common: {
    back: 'Back',
    gotIt: 'Got it',
    later: 'Later',
    retryTap: 'Tap to retry',
    reload: 'Reload',
    retrySave: 'Retry save',
    retryStreak: 'Retry streak save',
    timer: 'Time',
  },
  index: {
    loadingPuzzle: 'Digging up today’s silly puzzle…',
    errorReloading: 'Something went wrong. Tap below to try again.',
  },
  game: {
    completeToday: 'Finish today’s puzzle',
    giveUpToday: 'Give up on today’s puzzle',
    loadFailed: 'Couldn’t load today’s puzzle. Local data may be corrupted.',
  },
  result: {
    loadingStatus: 'Loading today’s result…',
    statusWin: 'Cleared',
    statusSurrender: 'Bailed out',
    recordPrefix: 'Today ·',
    elapsedPrefix: 'Time: ',
    foolIndexPrefix: 'Silly index: ',
    daysSuffix: ' days',
  },
  privacy: {
    openInBrowser: 'Open the public version in a browser',
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
  sheet: {
    dismissA11y: 'Dismiss month calendar',
    dismissReminderA11y: 'Dismiss reminder settings',
  },
  reminder: {
    softAsk: {
      bodies: [
        'Same time tomorrow — don’t ghost us again.',
        'You cleared it — want a nudge tomorrow?',
      ] as const,
      cta: 'Remind me tomorrow',
      ctaA11y: 'Open reminder settings for a daily nudge',
    },
    sheet: {
      title: 'Daily reminder',
      toggleLabel: 'Turn on reminders',
      timeLabel: 'Reminder time',
      privacyHint: 'Scheduled on-device only — turn off anytime here.',
      toggleA11y: 'Toggle daily reminder',
      timeA11y: (hour: number, minute: number) =>
        `Reminder time ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    },
    banner: {
      bodyNoPush: 'Almost 8 PM and today’s still open — want a nudge tomorrow?',
      bodyHasPush: 'Almost 8 PM — don’t leave today hanging.',
      ctaEnable: 'Turn on reminders',
      ctaEdit: 'Change reminder',
    },
    errorPermissionDenied: 'Notifications blocked — catch you in the app',
  },
  calendar: {
    viewMonthLink: 'View this month',
    viewMonthA11y: 'View this month calendar',
    prevMonthA11y: 'Previous month',
    nextMonthA11y: 'Next month',
    streakLine: (days: number) => `${days}-day streak`,
    completedLine: (count: number) => `${count} cleared this month`,
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const,
    cellA11y: (
      day: number,
      state: 'completed' | 'abandoned' | 'missed' | 'shield',
    ) => {
      const labels = {
        completed: 'cleared',
        abandoned: 'bailed',
        missed: 'missed',
        shield: 'shield',
      } as const;
      return `Day ${day} · ${labels[state]}`;
    },
    cellEmptyA11y: (day: number) => `Day ${day} · not yet`,
    emptyHeading: 'Nothing stamped this month yet',
    emptyBody: 'Finish a day to light up a cell.',
  },
  gallery: {
    generateCta: "Build this month's gallery",
    generating: 'Building…',
    errorExport: 'Gallery export failed — try again',
    retry: 'Try again',
    generateA11y: 'Build and share this month gallery image',
    shareDialogTitle: 'Share monthly gallery',
  },
  gameTypes: {
    sudoku: 'Sudoku',
    binary: 'Binary',
    nonogram: 'Nonogram',
    slitherlink: 'Slitherlink',
  },
  nonogramReveal: {
    prefix: 'Today’s picture ·',
  },
  slitherlinkReveal: {
    prefix: 'Today’s loop ·',
  },
  rules: {
    closeA11y: 'Close rules',
    viewRulesA11y: (title: string) => `View ${title}`,
  },
  badges: {
    foolA11y: 'Silly achievement icon',
    winA11y: 'Win badge icon',
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
      conflict: 'Rule violation — check highlighted cells',
      tapHint: 'Tap to cycle · long-press to clear',
    },
    nonogram: {
      complete: 'Picture matches — you can finish',
      tapHint: 'Tap to cycle · long-press to clear',
    },
    slitherlink: {
      complete: 'One loop closed — you can finish',
      conflict: 'Loop or clue mismatch',
      tapHint: 'Edge: undecided → line → × · long-press: clear',
    },
  },
  alerts: {
    abandonTitle: 'Give up today’s puzzle?',
    abandonMessage:
      'Progress will be saved as “Bailed out”. You can try again tomorrow.',
    continuePlay: 'Keep playing',
    giveUp: 'Give up',
    saveFailedTitle: 'Save failed',
    saveFailedMessage:
      'Couldn’t save progress locally. Try again or tap Retry save.',
    streakSaveFailedTitle: 'Streak save failed',
    streakSaveFailedMessage:
      'Couldn’t save streak locally. Try again or tap Retry streak save.',
  },
  shareCard: {
    completed: (elapsed: string, suffix: string, streak: string) =>
      `✅ Cleared · ${elapsed}${suffix}${streak}`,
    abandoned: (elapsed: string) => `🏳 Bailed out · ${elapsed}`,
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
    slitherlinkClueA11y: (row: number, col: number, clue: number) =>
      `Row ${row + 1}, column ${col + 1}, clue ${clue}`,
    slitherlinkEdgeA11y: (
      row: number,
      col: number,
      orientation: 'h' | 'v',
      state: 'line' | 'blank' | 'unknown',
      conflict: boolean,
    ) => {
      const pos = `Row ${row + 1}, column ${col + 1}`;
      const kind = orientation === 'h' ? ', horizontal edge' : ', vertical edge';
      const stateText =
        state === 'line'
          ? 'line'
          : state === 'blank'
            ? '× mark'
            : 'undecided';
      const conflictText = conflict ? ', conflict' : '';
      return `${pos}${kind}, ${stateText}${conflictText}`;
    },
  },
} as const;
