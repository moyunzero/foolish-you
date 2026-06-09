const DEFAULT_HOUR = 9;
const DEFAULT_MINUTE = 0;
const SUGGEST_OFFSET_MINUTES = 30;

/** Validates and clamps hour/minute; returns null when invalid. */
export function normalizeHourMinute(
  hour: unknown,
  minute: unknown,
): { hour: number; minute: number } | null {
  if (
    typeof hour !== 'number' ||
    typeof minute !== 'number' ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return null;
  }

  const h = Math.floor(hour);
  const m = Math.floor(minute);
  if (h < 0 || h > 23 || m < 0 || m > 59) {
    return null;
  }

  return { hour: h, minute: m };
}

function addMinutesToClock(
  hour: number,
  minute: number,
  deltaMinutes: number,
): { hour: number; minute: number } {
  let total = hour * 60 + minute + deltaMinutes;
  total = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  return { hour: Math.floor(total / 60), minute: total % 60 };
}

/** Smart default: first-open hour + 30 min, else 09:00 (D-11). */
export function suggestedReminderTime(
  firstOpenHour: number | null,
): { hour: number; minute: number } {
  if (
    firstOpenHour == null ||
    typeof firstOpenHour !== 'number' ||
    !Number.isFinite(firstOpenHour) ||
    firstOpenHour < 0 ||
    firstOpenHour > 23
  ) {
    return { hour: DEFAULT_HOUR, minute: DEFAULT_MINUTE };
  }

  const baseHour = Math.floor(firstOpenHour);
  return addMinutesToClock(baseHour, 0, SUGGEST_OFFSET_MINUTES);
}
