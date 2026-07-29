import type { MasteryGrade } from './types';

export const S_MIN = 0.5;
export const S_MAX = 365;

function clampS(value: number): number {
  return Math.max(S_MIN, Math.min(S_MAX, value));
}

/** FSRS v4 forgetting curve: R(t,S) = (1 + t/(9*S))^(-1) with S floored at S_MIN. */
export function retrievability(tDays: number, S: number): number {
  const s = Math.max(S, S_MIN);
  const t = Math.max(0, tDays);
  return Math.pow(1 + t / (9 * s), -1);
}

export function nextStability(
  S: number,
  R: number,
  grade: MasteryGrade,
): number {
  if (grade === 'again') {
    return clampS(S * 0.5 * (0.5 + 0.5 * R));
  }
  const factor =
    grade === 'easy' ? 1.8 : grade === 'good' ? 1.35 : /* hard */ 1.05;
  const spacing = 1 + 0.3 * (1 - R);
  return clampS(S * factor * spacing);
}

export function daysSincePractice(
  lastPracticedAtMs: number | null,
  nowMs: number,
): number {
  if (lastPracticedAtMs == null) return 0;
  return Math.max(0, Math.floor((nowMs - lastPracticedAtMs) / 86_400_000));
}
