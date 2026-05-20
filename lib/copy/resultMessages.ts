import { Platform } from 'react-native';

import { deriveSeed, deriveSubSeed, mulberry32 } from '../puzzles/rng';
import type { DailyStatus } from '../puzzles/types';

export type CompletedResultCopy = {
  mode: 'completed';
  headline: string;
  punchline: string;
  sublines: string[];
  elapsedDisplay: string;
  cta: string;
};

export type AbandonedResultCopy = {
  mode: 'abandoned';
  headline: string;
  punchline: string;
  sublines: string[];
  foolIndexPercent: number;
  foolIndexHint: string;
  statsLine: string;
  cta: string;
};

export type ResultCopy = CompletedResultCopy | AbandonedResultCopy;

const SUCCESS_HEADLINES = ['傻了么？—— 今天答案：没有！'];

const SUCCESS_PUNCHLINES = [
  '就问还有谁？今天没傻！',
  '今天没傻，醒得很稳！',
  '脑子在线，完美收工！',
  '这题没把你带偏，厉害。',
];

const SUCCESS_SUBLINES = [
  '你今天赢了，明天它还想赢回去呢！',
  '这题可不简单，你居然拿下了，明天敢来更狠的吗？',
  '脑力 +1，明天继续别掉链子啊！',
  '厉害！今天成功避开了「傻」字，保持住！',
  '完美收工！明天可别第一步就翻车哦~',
  '明天接着虐，别给它翻盘机会。',
];

const SUCCESS_CTAS = ['明天再来战', '我明天还要赢', '明天见，傻瓜'];

const FAIL_HEADLINES = ['恭喜达成「傻了」成就'];

const FAIL_PUNCHLINES = [
  '傻得有性格！',
  '就这？脑子暂时短路了！',
  '今日智商：离线模式。',
  '认输，但不认命。',
];

const FAIL_SUBLINES = [
  '明天争取让它傻。',
  '投降输一半，明天直接干翻它！',
  '这题把你干沉默了？正常，明天回来报仇！',
  '没关系，很多人比你傻得更彻底。',
  '放弃了？行吧，明天它还在等着你呢。',
  '今天你输给了它，明天换它输给你？',
  '已记录本次耻辱，明天洗刷它。',
];

const FOOL_INDEX_HINTS = [
  '再努力点就满分了',
  '离「傻神」只差一步',
  '明天有机会刷满',
  '还有上升空间（往下）',
];

const FAIL_CTAS = [
  '明天报仇',
  '我明天一定要过',
  '明天再来，不服输',
  '明天见，我要赢',
];

const FOOTER_HINT_DEFAULT = '明天 0 点后刷新，题型会变哦';
const FOOTER_HINT_IOS =
  '明天 0 点后刷新，题型会变哦。iOS 上点按钮后请从屏幕底部上滑回主屏幕。';

export function getResultFooterHint(): string {
  return Platform.OS === 'ios' ? FOOTER_HINT_IOS : FOOTER_HINT_DEFAULT;
}

function pickFromPool<T>(rng: () => number, items: readonly T[]): T {
  const idx = Math.floor(rng() * items.length);
  return items[idx] ?? items[0];
}

function pickUniquePlainLines(
  rng: () => number,
  pool: readonly string[],
  count: number,
  exclude: string[] = [],
): string[] {
  const filtered = pool.filter((line) => !exclude.includes(line));
  const shuffled = [...filtered].sort(() => (rng() < 0.5 ? -1 : 1));
  return shuffled.slice(0, count);
}

function seededFoolIndexPercent(rng: () => number): number {
  return 72 + Math.floor(rng() * 24);
}

function seededBrainCells(rng: () => number): number {
  return 500 + Math.floor(rng() * 700);
}

export function formatElapsedDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds} 秒`;
  return `${minutes} 分 ${seconds} 秒`;
}

function formatElapsedClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function pickResultCopy(
  status: Exclude<DailyStatus, 'playing'>,
  elapsedMs: number,
  dateKey: string,
  seed?: number | null,
): ResultCopy {
  const baseSeed = seed ?? deriveSeed(dateKey);
  const rng = mulberry32(deriveSubSeed(baseSeed, `result-${status}`));
  const elapsedDisplay = formatElapsedDuration(elapsedMs);

  if (status === 'completed') {
    const punchline = pickFromPool(rng, SUCCESS_PUNCHLINES);
    const sublines = pickUniquePlainLines(rng, SUCCESS_SUBLINES, 2, [punchline]);

    return {
      mode: 'completed',
      headline: pickFromPool(rng, SUCCESS_HEADLINES),
      punchline,
      sublines,
      elapsedDisplay,
      cta: pickFromPool(rng, SUCCESS_CTAS),
    };
  }

  const punchline = pickFromPool(rng, FAIL_PUNCHLINES);
  const sublines = pickUniquePlainLines(rng, FAIL_SUBLINES, 2, [punchline]);

  return {
    mode: 'abandoned',
    headline: pickFromPool(rng, FAIL_HEADLINES),
    punchline,
    sublines,
    foolIndexPercent: seededFoolIndexPercent(rng),
    foolIndexHint: pickFromPool(rng, FOOL_INDEX_HINTS),
    statsLine: `本次用时 ${formatElapsedClock(elapsedMs)} | 脑细胞阵亡 ${seededBrainCells(rng)} 个`,
    cta: pickFromPool(rng, FAIL_CTAS),
  };
}
