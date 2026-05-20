/**
 * 每日谜题种子盐（写在客户端源码里，非秘密）。
 * 产品约束：任何人都能离线复现同一自然日的题目；不要在此基础上做竞技排行榜或防作弊。
 */
export const APP_SALT = 'foolish-you-v1';
export const STORAGE_KEY = '@foolish-you/daily-v1';
/** Bump when persisted snapshot shape changes; v2 drops puzzleStub / placeholders. */
export const STORAGE_VERSION = 2;

export const SUDOKU_GIVEN_COUNT = 30;
export const SUDOKU_MAX_GEN_ATTEMPTS = 50;

/** 8×8 Takuzu：约 38% 已知格（与数独比例接近） */
export const BINARY_GIVEN_COUNT = 24;
export const BINARY_MAX_GEN_ATTEMPTS = 40;

export const PLAY_STATE_DEBOUNCE_MS = 300;
