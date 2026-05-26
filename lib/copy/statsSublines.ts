import { deriveSeed, deriveSubSeed, mulberry32 } from '../puzzles/rng';
import type { CompletionEntry } from '../storage/completionHistoryStorage';
import { formatElapsedClock } from '../time/formatElapsedClock';

function pickFromPool(rng: () => number, pool: readonly string[]): string {
  const index = Math.floor(rng() * pool.length);
  return pool[Math.min(index, pool.length - 1)]!;
}

export function formatStatsClock(ms: number): string {
  return formatElapsedClock(ms);
}

function findPreviousCompletion(
  entries: CompletionEntry[],
  today: string,
): CompletionEntry | null {
  let best: CompletionEntry | null = null;
  for (const entry of entries) {
    if (entry.inferred) continue;
    if (entry.dateKey >= today) continue;
    if (best == null || entry.dateKey > best.dateKey) {
      best = entry;
    }
  }
  return best;
}

const ELAPSED_FAST_SEC = 120;
const ELAPSED_SLOW_SEC = 480;

const ELAPSED_FAST_LINES = [
  '飞快，键盘要冒烟了',
  '这速度，题目还没醒你就交了卷',
  '手速在线，明天别飘',
  '快得像开了倍速',
  '今日效率：离谱',
] as const;

const ELAPSED_SLOW_LINES = [
  '磨蹭得很有水平',
  '用时够泡一杯茶了',
  '慢工出细活？反正出活了',
  '这局主打一个沉浸式思考',
  '时间换智商，不亏',
] as const;

const ELAPSED_MID_LINES = [
  '稳中带快，刚刚好',
  '正常发挥，别骄傲',
  '用时中规中矩',
  '不快不慢，像你的性格',
  '还行，明天还能更快',
] as const;

export function pickElapsedSubline(
  elapsedMs: number,
  entries: CompletionEntry[],
  today: string,
  rng: () => number,
): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const previous = findPreviousCompletion(entries, today);

  if (previous != null) {
    const deltaSec = Math.floor((previous.elapsedMs - elapsedMs) / 1000);
    if (deltaSec >= 5) {
      return `比上次快 ${deltaSec} 秒`;
    }
    if (deltaSec <= -5) {
      return `比上次慢 ${Math.abs(deltaSec)} 秒`;
    }
  }

  if (totalSeconds <= ELAPSED_FAST_SEC) {
    return pickFromPool(rng, ELAPSED_FAST_LINES);
  }
  if (totalSeconds >= ELAPSED_SLOW_SEC) {
    return pickFromPool(rng, ELAPSED_SLOW_LINES);
  }
  return pickFromPool(rng, ELAPSED_MID_LINES);
}

const WEEKLY_FULL_LINES = [
  '全勤了，慢着点',
  '七天全勤，你是来上班的',
  '本周满分打卡',
  '卷王本周已上线',
  '七天都在，离谱',
] as const;

const WEEKLY_LOW_LINES = [
  '这周只来 1 次，是把这里当树洞？',
  '本周存在感偏低',
  '才开局，别急着躺',
  '1/7，还有很大进步空间',
  '本周摸鱼指数偏高',
] as const;

export function pickWeeklySubline(weeklyCount: number, rng: () => number): string {
  if (weeklyCount >= 7) {
    return pickFromPool(rng, WEEKLY_FULL_LINES);
  }
  if (weeklyCount <= 1) {
    return pickFromPool(rng, WEEKLY_LOW_LINES);
  }
  const remaining = 7 - weeklyCount;
  return `还能再来 ${remaining} 天`;
}

const STREAK_RECORD_LINES = [
  '正在刷新纪录',
  '连签新高，稳住',
  '纪录在脚下，别飘',
  '今天就是巅峰',
  '历史最长，恭喜',
] as const;

const STREAK_CHASE_LINES = [
  (gap: number) => `距离破纪录 ${gap} 天`,
  (gap: number) => `还差 ${gap} 天就能超自己`,
  (gap: number) => `再坚持 ${gap} 天，纪录是你的`,
  (gap: number) => `当前势头不错，差 ${gap} 天`,
  (gap: number) => `纪录 ${gap} 天在前方`,
];

export function pickStreakSubline(
  currentStreak: number,
  historicalMax: number,
  rng: () => number,
): string {
  if (historicalMax <= 0) {
    return '连签纪录从零开始';
  }
  if (currentStreak >= historicalMax && currentStreak > 0) {
    return pickFromPool(rng, STREAK_RECORD_LINES);
  }
  const gap = Math.max(0, historicalMax - currentStreak);
  const index = Math.floor(rng() * STREAK_CHASE_LINES.length);
  return STREAK_CHASE_LINES[Math.min(index, STREAK_CHASE_LINES.length - 1)]!(gap);
}

export function createStatsSublineRng(
  dateKey: string,
  seed: number | null | undefined,
  cardIndex: number,
): () => number {
  const baseSeed = seed ?? deriveSeed(dateKey);
  return mulberry32(deriveSubSeed(baseSeed, `stats-card-${cardIndex}`));
}
