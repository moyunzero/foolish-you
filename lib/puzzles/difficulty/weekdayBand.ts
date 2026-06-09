const FALLBACK_BAND = 3;

function parseLocalDateKey(dateKey: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/** Monday-easy → Sunday-hard band (Mon=0 .. Sun=6). Invalid dateKey → band 3. */
export function weekdayBand(dateKey: string): number {
  const date = parseLocalDateKey(dateKey);
  if (date == null) return FALLBACK_BAND;
  const js = date.getDay();
  return js === 0 ? 6 : js - 1;
}

/** Linear interpolation: band 0 → easy (more givens), band 6 → hard (fewer givens). */
export function bandLerp(band: number, easy: number, hard: number): number {
  const clamped = Math.max(0, Math.min(6, band));
  return Math.round(easy - (clamped / 6) * (easy - hard));
}

export function sudokuGivensForDate(dateKey: string): number {
  return bandLerp(weekdayBand(dateKey), 33, 27);
}

export function binaryGivensForDate(dateKey: string): number {
  return bandLerp(weekdayBand(dateKey), 26, 20);
}
