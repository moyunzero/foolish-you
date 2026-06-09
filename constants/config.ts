/**
 * 每日谜题种子盐（写在客户端源码里，非秘密）。
 * 产品约束：任何人都能离线复现同一自然日的题目；不要在此基础上做竞技排行榜或防作弊。
 */
export const APP_SALT = 'foolish-you-v1';
export const STORAGE_KEY = '@foolish-you/daily-v1';
export const STREAK_STORAGE_KEY = '@foolish-you/streak-v1';
/** Bump when persisted streak JSON shape changes (see docs/CONFIGURATION.md § Storage version bumps). */
export const STREAK_STORAGE_VERSION = 4;
export const COMPLETION_HISTORY_STORAGE_KEY = '@foolish-you/completion-history-v1';
export const COMPLETION_HISTORY_STORAGE_VERSION = 2;
export const COMPLETION_HISTORY_MAX_ENTRIES = 90;
export const RECOVERY_LOG_STORAGE_KEY = '@foolish-you/snapshot-recovery-log-v1';
export const RECOVERY_LOG_MAX_ENTRIES = 10;
export const RATING_STORAGE_KEY = '@foolish-you/rating-v1';
/** Bump when persisted rating JSON shape changes (see docs/CONFIGURATION.md § Storage version bumps). */
export const RATING_STORAGE_VERSION = 1;
export const REMINDER_STORAGE_KEY = '@foolish-you/reminder-v1';
/** Bump when persisted reminder JSON shape changes (see docs/CONFIGURATION.md § Storage version bumps). */
export const REMINDER_STORAGE_VERSION = 1;
/** Bump when persisted snapshot shape changes; v2 drops puzzleStub / placeholders. */
export const STORAGE_VERSION = 2;

export const SUDOKU_GIVEN_COUNT = 30;
export const SUDOKU_MAX_GEN_ATTEMPTS = 50;

/** 8×8 Takuzu：约 38% 已知格（与数独比例接近） */
export const BINARY_GIVEN_COUNT = 24;
export const BINARY_MAX_GEN_ATTEMPTS = 40;

export const SLITHERLINK_MIN_CLUES = 18;
export const SLITHERLINK_MAX_GEN_ATTEMPTS = 50;

export const PLAY_STATE_DEBOUNCE_MS = 300;
