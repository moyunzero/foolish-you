import { useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { computeElapsedMs } from '../lib/time/computeElapsedMs';
import { formatElapsedClock } from '../lib/time/formatElapsedClock';

/** 从 `startedAt` 起每秒刷新；前后台切换时立即重算，避免 timer 挂起导致用时偏少。 */
export function useElapsedTimer(startedAt: number | undefined): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (startedAt == null) return undefined;

    const tick = () => setNow(Date.now());
    tick();

    const intervalId = setInterval(tick, 1000);
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') {
        tick();
      }
    });

    return () => {
      clearInterval(intervalId);
      sub.remove();
    };
  }, [startedAt]);

  if (startedAt == null) return '00:00';
  return formatElapsedClock(computeElapsedMs(startedAt, now));
}
