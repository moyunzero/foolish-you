import { deriveSeed, deriveSubSeed, mulberry32 } from '../puzzles/rng';

const SHARE_SUCCESS_TOASTS = [
  '战报已复制，去群里炫耀吧',
  '剪贴板到手，别怂，发出去',
  '复制成功，让朋友也傻一下',
  '战报已就位，粘贴开秀',
  '已复制，坐等朋友问这是啥',
  '拷贝完成，传播「傻」学',
];

const SHARE_ERROR_TOASTS = [
  '复制失败，再点一次',
  '剪贴板罢工了，重试一下',
  '没拷上，手指再试',
  '系统不给面子，再来一遍',
  '复制翻车，点我重试',
];

function pickFromPool(rng: () => number, pool: readonly string[]): string {
  const index = Math.floor(rng() * pool.length);
  return pool[index] ?? pool[0]!;
}

export function pickShareSuccessToast(seed?: number | null, dateKey?: string): string {
  const base = seed ?? (dateKey != null ? deriveSeed(dateKey) : 1);
  const rng = mulberry32(deriveSubSeed(base, 'share-success-toast'));
  return pickFromPool(rng, SHARE_SUCCESS_TOASTS);
}

export function pickShareErrorToast(seed?: number | null, dateKey?: string): string {
  const base = seed ?? (dateKey != null ? deriveSeed(dateKey) : 1);
  const rng = mulberry32(deriveSubSeed(base, 'share-error-toast'));
  return pickFromPool(rng, SHARE_ERROR_TOASTS);
}
