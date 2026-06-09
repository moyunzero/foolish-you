/** Local daily reminder preferences (PII-free). */
export type ReminderState = {
  enabled: boolean;
  hour: number;
  minute: number;
  /** Set after first soft ask render — never show again (D-04). */
  softAskDismissed: boolean;
  /** User denied OS permission — no auto re-prompt until Sheet retry (D-06). */
  permissionDenied: boolean;
  /** Sampled once from first app open hour (D-11). */
  firstOpenHour: number | null;
  /** dateKey when firstOpenHour was recorded (one sample per day max). */
  firstOpenSampledForDateKey: string | null;
};

export const DEFAULT_REMINDER_STATE: ReminderState = {
  enabled: false,
  hour: 9,
  minute: 0,
  softAskDismissed: false,
  permissionDenied: false,
  firstOpenHour: null,
  firstOpenSampledForDateKey: null,
};
