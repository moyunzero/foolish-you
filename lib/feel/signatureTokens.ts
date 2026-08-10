import { Easing } from 'react-native-reanimated';

/** Ephemeral board signature polarity — never persisted. */
export type SignatureMoment = 'idle' | 'win' | 'abandon';

/** Win envelope — UI-SPEC lock (D-11 / DIFF-03). */
export const SIG_WIN_MS = 200;

/** Abandon envelope — shorter / duller (D-11). */
export const SIG_ABANDON_MS = 120;

/** Cell / paint scale peak — win. */
export const SIG_SCALE_PEAK_WIN = 1.04;

/** Cell / paint scale peak — abandon settle. */
export const SIG_SCALE_PEAK_ABANDON = 0.985;

/** Win sunset glow opacity peak. */
export const SIG_GLOW_PEAK = 0.28;

export const SIG_WIN_EASE = Easing.out(Easing.cubic);
export const SIG_ABANDON_EASE = Easing.in(Easing.quad);
