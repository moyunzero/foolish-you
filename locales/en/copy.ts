/** English copy pools — native voice (Plan 03). */

export const resultPools = {
  successHeadlines: [
    'Silly today? — Not this time.',
    'Daily verdict: brain stayed online.',
    'You dodged the silly stamp.',
  ] as const,

  successPunchlines: [
    'Brain online. Puzzle offline.',
    'Clean win. No silly badge today.',
    'You beat today’s puzzle. Nice.',
    'Sharp finish. Tomorrow won’t be easier.',
    'Grid solved. Ego slightly inflated.',
    'Today’s puzzle met its match.',
  ] as const,

  successSublines: [
    'You won today. Tomorrow wants a rematch.',
    'Tough one — you still closed it out.',
    'Keep the streak of good decisions going.',
    'No “silly” stamp today. Hold the line.',
    'Solid run. Don’t trip on step one tomorrow.',
    'Come back tomorrow before it talks back.',
    'Brains +1. Try not to spend it all tonight.',
    'Victory lap optional. Showing up tomorrow isn’t.',
  ] as const,

  successCtas: [
    'See you tomorrow',
    'One more win tomorrow',
    'Back tomorrow',
    'Tomorrow’s puzzle can wait',
  ],

  failHeadlines: [
    'Achievement unlocked: Silly today',
    'You called it — silly mode engaged',
    'Today’s report card: needs work',
  ] as const,

  failPunchlines: [
    'Silly, but with personality.',
    'Brain buffering… try again tomorrow.',
    'IQ status: offline for maintenance.',
    'You surrendered. Pride didn’t.',
    'The grid won this round. Barely.',
    'Silly certified. Frame not included.',
  ] as const,

  failSublines: [
    'Make the puzzle silly tomorrow.',
    'Half surrender, full revenge tomorrow.',
    'Stumped you today? Normal. Come back.',
    'Others were sillier. You’re fine.',
    'Walked away? The puzzle will wait.',
    'It won today. Flip it tomorrow.',
    'Shame logged. Wash it off tomorrow.',
    'Tomorrow’s you is already plotting.',
  ] as const,

  foolIndexHints: [
    'Almost max silly — keep trying',
    'One step from peak silly',
    'Room to climb tomorrow',
    'Still headroom (downward)',
    'Peak silly is a journey, not a sprint',
  ] as const,

  failCtas: [
    'Revenge tomorrow',
    'I’m passing tomorrow',
    'Back tomorrow — no quit',
    'Tomorrow. I win.',
    'Rematch at midnight',
  ] as const,

  elapsedSecondsOnly: (seconds: number) => `${seconds}s`,

  elapsedMinutesSeconds: (minutes: number, seconds: number) =>
    minutes === 0 ? `${seconds}s` : `${minutes}m ${seconds}s`,

  abandonedStatsLine: (elapsedClock: string, brainCells: number) =>
    `Time ${elapsedClock} · ${brainCells} brain cells lost`,
} as const;

export const gameRules = {
  sudoku: {
    title: 'Sudoku rules',
    intro:
      'Fill the 9×9 grid with digits 1–9 so each row, column, and 3×3 box contains each digit exactly once.',
    bullets: [
      'Gray digits are givens — you can’t change them',
      'Tap a cell, then use the number pad; long-press or Clear to erase',
      'Duplicates in a row, column, or box are highlighted in red',
      'When the grid is complete and valid, tap Complete today',
    ],
  },
  binary: {
    title: 'Binary puzzle rules',
    intro: 'Fill the 8×8 grid with 0s and 1s. All of the following must hold.',
    bullets: [
      'Each row and column has exactly four 0s and four 1s',
      'No three identical digits in a row (no 000 or 111)',
      'No two rows may be identical; no two columns may be identical',
      'Gray digits are givens; tap cycles empty → 0 → 1; long-press clears',
      'Rule breaks highlight in red; when valid and full, tap Complete today',
    ],
  },
  nonogram: {
    title: 'Nonogram rules',
    intro:
      'Use the clues on each row and column to fill cells and reveal the picture.',
    bullets: [
      'Numbers are runs of filled cells in order along that line',
      'Tap cycles empty → fill → mark (×); long-press clears',
      '× marks are notes only — they don’t count toward completion',
      'No live error check; finish all required fills, then Complete today',
    ],
  },
} as const;

export const streak = {
  broken: 'Streak broken · Clear today to restart',
  zero: 'Streak board · Finish today to start',
  checkedIn: (displayStreak: number) =>
    `${displayStreak} days in a row · Cleared today`,
  pending: (displayStreak: number) =>
    `${displayStreak} days in a row · Today still open`,
} as const;

export const freeze = {
  consumedLines: [
    'Shield used: yesterday skipped, streak still alive — don’t gloat.',
    'One day frozen; the number holds — don’t ghost again.',
    'System covered for you. Submit today’s run.',
  ] as const,
  shieldSuffix: (count: number) => ` · Shield×${count}`,
} as const;

export const missedYesterday = {
  softPool: [
    'Missed yesterday — win today back.',
    'Shield bought time; don’t waste today.',
    'Streak’s still there — earn the pride.',
  ] as const,
  recallPool: [
    'You skipped yesterday — streak’s watching.',
    'One day off; skip today and it’s gone.',
    'Edge of a break — still time to play.',
  ] as const,
} as const;

export const statsPools = {
  elapsedFast: [
    'Speed run. Keyboard smoking.',
    'Submitted before the puzzle woke up.',
    'Fast hands. Don’t get cocky tomorrow.',
    'Feels like 2× speed.',
    'Today’s efficiency: unreasonable.',
  ] as const,

  elapsedSlow: [
    'Slow and proud of it.',
    'Enough time for tea.',
    'Slow work still worked.',
    'Deep-think mode: engaged.',
    'Time well spent (probably).',
  ] as const,

  elapsedMid: [
    'Steady pace. Just right.',
    'Normal day. Don’t flex.',
    'Middle of the road timing.',
    'Not fast, not slow — very you.',
    'Decent. Room to shave seconds.',
  ] as const,

  fasterThanPrevious: (deltaSec: number) => `${deltaSec}s faster than last time`,
  slowerThanPrevious: (deltaSec: number) => `${deltaSec}s slower than last time`,

  weeklyFull: [
    'Full week. Touch grass.',
    'Seven days — are you clocking in?',
    'Perfect attendance this week.',
    'Grind mode: weekly edition.',
    'Seven for seven. Wild.',
  ] as const,

  weeklyLow: [
    'One visit this week — casual?',
    'Low presence this week.',
    'Early days. Don’t nap yet.',
    '1/7 — plenty of runway.',
    'High chill index this week.',
  ] as const,

  weeklyRemaining: (remaining: number) => `${remaining} more day(s) this week`,

  streakNoRecord: 'Streak record starts at zero',

  streakRecord: [
    'New record in progress',
    'Streak high — stay steady',
    'Record underfoot — don’t float',
    'Peak day. Enjoy it.',
    'Longest run yet. Nice.',
  ] as const,

  streakChase: [
    (gap: number) => `${gap} day(s) to beat your record`,
    (gap: number) => `${gap} more to pass yourself`,
    (gap: number) => `Hold ${gap} more for the record`,
    (gap: number) => `Good momentum — ${gap} to go`,
    (gap: number) => `Record is ${gap} day(s) ahead`,
  ] as const,
} as const;

export const share = {
  nonogramTails: [
    '(What’s the picture? Play to find out.)',
    '(Spoiler-free — see you tomorrow.)',
    '(Abstract art. Don’t @ us.)',
    '(Paste in chat. Nobody will guess.)',
    '(Answer’s not in the card — in tomorrow’s grid.)',
  ] as const,

  abandonTails: [
    'Back tomorrow for round two.',
    'Surrender logged. Revenge tomorrow.',
    'Retreat today. Fight tomorrow.',
  ] as const,

  successTails: [
    'Brain fast. Fingers… debatable.',
    'Clean grid. Clock told the truth.',
    'Puzzle didn’t win. Timer almost did.',
    'Good game. Less stalling next time.',
    'Paste in chat — beat my time if you can.',
  ] as const,

  cardCta: '#SillyMe · daily puzzle',

  successToasts: [
    'Report copied — go flex in chat',
    'On your clipboard. Send it.',
    'Copied. Make a friend play too.',
    'Ready to paste. Show off.',
    'Copied. Wait for “what is this?”',
    'Copied. Spread the daily puzzle.',
  ] as const,

  errorToasts: [
    'Copy failed — tap again',
    'Clipboard said no — retry',
    'Didn’t copy — try once more',
    'System declined — hit again',
    'Copy glitched — tap to retry',
  ] as const,
} as const;

export const resultFooter = {
  default: 'New puzzle after midnight; game type may change.',
  ios: 'New puzzle after midnight; game type may change. On iOS, swipe up from the bottom to return home after tapping the button.',
} as const;
