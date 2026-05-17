import { useEffect, useState } from 'react';

function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** 从 startedAt 起每秒刷新，用于游戏页计时显示 */
export function useElapsedTimer(startedAt: number | undefined): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (startedAt == null) return undefined;

    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  if (startedAt == null) return '00:00';
  return formatClock(now - startedAt);
}
