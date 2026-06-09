export type ReminderSoftAskOutcome = 'completed' | 'abandoned';

export type ShouldShowReminderSoftAskInput = {
  outcome: ReminderSoftAskOutcome;
  /** Lifetime completed count from rating storage (after today's completion). */
  completedCount: number;
  softAskDismissed: boolean;
};

/** D-04: first-ever completed only; D-07: never on abandoned. */
export function shouldShowReminderSoftAsk(
  input: ShouldShowReminderSoftAskInput,
): boolean {
  if (input.outcome !== 'completed') return false;
  if (input.softAskDismissed) return false;
  if (input.completedCount !== 1) return false;
  return true;
}
