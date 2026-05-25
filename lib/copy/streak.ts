import type { StreakDisplay } from '../streak/types';

/** 游戏页连签副文案（幽默向，不用「打卡/未打卡」） */
export function formatStreakLine(display: StreakDisplay): string {
  const { displayStreak, checkedInToday, streakBroken } = display;

  if (streakBroken) {
    return '连签断了 · 通关一次重新开张';
  }

  if (displayStreak === 0) {
    return '连签战绩 · 完成今日入账';
  }

  const prefix = `连续 ${displayStreak} 天`;
  if (checkedInToday) {
    return `${prefix} · 今天没傻过`;
  }

  return `${prefix} · 今日卷面待交`;
}
