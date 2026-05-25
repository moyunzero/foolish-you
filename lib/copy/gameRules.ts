import type { GameType } from '../puzzles/types';

export type GameRulesContent = {
  title: string;
  intro: string;
  bullets: string[];
};

export const GAME_RULES: Record<GameType, GameRulesContent> = {
  sudoku: {
    title: '数独规则',
    intro:
      '在 9×9 格子中填入 1～9，使每一行、每一列、每一个 3×3 宫格都恰好出现 1～9 各一次。',
    bullets: [
      '灰色数字是题目给定的，不能修改',
      '先点空格，再用下方数字条填入；长按该格或点「清除」可擦掉',
      '同一行、列或宫格里重复的数字会标红',
      '全部填对且无冲突后，点「完成今日」',
    ],
  },
  binary: {
    title: '二进制谜题规则',
    intro: '在 8×8 格子中填入 0 和 1，满足以下全部条件。',
    bullets: [
      '每一行、每一列恰好有 4 个 0 和 4 个 1',
      '同一行或列不能出现连续三个相同数字（如 000、111）',
      '任意两行不能完全相同；任意两列也不能完全相同',
      '灰色数字是题目给定的；点格子在 空 → 0 → 1 之间切换，长按清空',
      '违反规则时相关格子会标红；全部合法填满后可「完成今日」',
    ],
  },
};
