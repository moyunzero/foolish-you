/** 设备本地日历日 YYYY-MM-DD（禁止 UTC ISO 切片） */
import { getDevForceDateKey } from '../dev/forceDateKey';

export function getLocalDateKey(date?: Date): string {
  // No-arg calls honor __DEV__ fake date (Maestro / panel QA). Explicit Date args stay pure.
  if (arguments.length === 0) {
    const forced = getDevForceDateKey();
    if (forced != null) return forced;
  }
  const d = date ?? new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
