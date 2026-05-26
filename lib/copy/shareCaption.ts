import { deriveSeed, deriveSubSeed, mulberry32 } from '../puzzles/rng';

const NONOGRAM_SHARE_TAILS = [
  '（今天画的是什么，自己玩了才知道）',
  '（图案保密，明天自己来拆）',
  '（别问像啥，问就是抽象派）',
  '（复制去群里，保证没人猜对）',
  '（答案不在战报里，在明天）',
];

const ABANDON_SHARE_TAILS = [
  '明天还来挨打。',
  '认怂记录已存档，明天报仇。',
  '今日先撤，明日再战。',
];

const SUCCESS_SHARE_TAILS = [
  '今天脑子转得动，手没跟上。',
  '干净局，但用时暴露了真实水平。',
  '九宫格没难住你，时钟难住了你。',
  '这局能处，下次别磨叽。',
  '复制去群里，看有几个人能更快。',
];

function pickFromPool(rng: () => number, pool: readonly string[]): string {
  const index = Math.floor(rng() * pool.length);
  return pool[index] ?? pool[0]!;
}

export function pickNonogramShareTail(seed: number, dateKey: string): string {
  const baseSeed = seed || deriveSeed(dateKey);
  const rng = mulberry32(deriveSubSeed(baseSeed, 'share-nonogram-tail'));
  return pickFromPool(rng, NONOGRAM_SHARE_TAILS);
}

export function pickAbandonShareTail(): string {
  return ABANDON_SHARE_TAILS[0]!;
}

export function pickAbandonShareTailSeeded(seed: number, dateKey: string): string {
  const baseSeed = seed || deriveSeed(dateKey);
  const rng = mulberry32(deriveSubSeed(baseSeed, 'share-abandon-tail'));
  return pickFromPool(rng, ABANDON_SHARE_TAILS);
}

export function pickSuccessShareTail(seed: number, dateKey: string): string {
  const baseSeed = seed || deriveSeed(dateKey);
  const rng = mulberry32(deriveSubSeed(baseSeed, 'share-success-tail'));
  return pickFromPool(rng, SUCCESS_SHARE_TAILS);
}

export const SHARE_CARD_CTA = '#傻了么 · 每日一题';
