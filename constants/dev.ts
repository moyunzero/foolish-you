import type { GameType } from '../lib/puzzles/types';

/** 仅在开发构建中为 true；正式包不会包含调试面板 */
export const DEV_TOOLS_ENABLED = __DEV__;

/**
 * 开发包启动时默认隐藏底部 DEV 条（适合连续截图）。
 * 仍可在应用内长按「隐私政策」唤出 / 收起调试条。
 */
export const DEV_TOOLS_BAR_HIDDEN_DEFAULT = false;

/**
 * 新建「今日档案」时强制题型（需配合「重开今日」或删 App 后生效）。
 * - `'sudoku'` | `'binary'` | `'nonogram'`：固定题型
 * - `null`：按日期种子随机（与线上一致）
 */
/** 开发时强制题型；正式包由 __DEV__ 屏蔽，此处仅影响本地调试 */
export const DEV_FORCE_GAME_TYPE: GameType | null = null;

export function getDevForceGameType(): GameType | null {
  if (!__DEV__) return null;
  return DEV_FORCE_GAME_TYPE;
}
