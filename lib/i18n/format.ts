import type { AppDisplayName, Locale } from './types';

export function getAppDisplayName(locale: Locale): AppDisplayName {
  return locale === 'zh' ? '傻了么' : 'Silly Me';
}

export function formatElapsedDuration(ms: number, locale: Locale): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (locale === 'en') {
    if (minutes === 0) return `${seconds}s`;
    return `${minutes}m ${seconds}s`;
  }

  if (minutes === 0) return `${seconds} 秒`;
  return `${minutes} 分 ${seconds} 秒`;
}

export function formatTodayMeta(dateKey: string | null, locale: Locale): string {
  const key = dateKey ?? '—';
  return locale === 'zh' ? `今日 · ${key}` : `Today · ${key}`;
}
