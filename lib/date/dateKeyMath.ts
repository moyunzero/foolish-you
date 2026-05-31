function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 本地日历日加减（用于滚动 7 日窗口） */
export function addDaysToDateKey(dateKey: string, deltaDays: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + deltaDays);
  return formatDateKey(date);
}

/**
 * Local-calendar ISO 8601 week key (Monday-based), format `YYYY-Www`.
 */
export function getIsoWeekKey(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const d = new Date(date.getTime());
  const dayNum = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - dayNum);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/** 含 today 在内、向前共 `count` 个自然日的 dateKey（升序） */
export function getRollingDateKeysEnding(today: string, count: number): string[] {
  const keys: string[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    keys.push(addDaysToDateKey(today, -offset));
  }
  return keys;
}
