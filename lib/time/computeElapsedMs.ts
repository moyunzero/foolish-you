/** Elapsed ms from `startedAt` to `now`, clamped for invalid clocks. */
export function computeElapsedMs(
  startedAt: number | undefined,
  now: number,
): number {
  if (startedAt == null) return 0;
  if (now < startedAt) return 0;
  return now - startedAt;
}
