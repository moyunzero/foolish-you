import type { GameType } from '../lib/puzzles/types';

/** 仅在开发构建中为 true；正式包不会包含调试面板 */
export const DEV_TOOLS_ENABLED = __DEV__;

/**
 * 新建「今日档案」时强制题型（需配合「重开今日」或删 App 后生效）。
 * - `'sudoku'` | `'binary'`：固定题型
 * - `null`：按日期种子随机（与线上一致）
 */
export const DEV_FORCE_GAME_TYPE: GameType | null = 'sudoku';

export function getDevForceGameType(): GameType | null {
  if (!__DEV__) return null;
  return DEV_FORCE_GAME_TYPE;
}
