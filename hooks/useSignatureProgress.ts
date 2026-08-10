import { useEffect } from 'react';
import {
  ReduceMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import {
  SIG_ABANDON_EASE,
  SIG_ABANDON_MS,
  SIG_WIN_EASE,
  SIG_WIN_MS,
  type SignatureMoment,
} from '../lib/feel/signatureTokens';

/**
 * One board-level progress 0→1 for signature interpolate.
 * Prefer System reduce-motion so visuals collapse; haptics stay independent.
 */
export function useSignatureProgress(
  mode: SignatureMoment,
): SharedValue<number> {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (mode === 'idle') {
      progress.value = 0;
      return;
    }
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: mode === 'win' ? SIG_WIN_MS : SIG_ABANDON_MS,
      easing: mode === 'win' ? SIG_WIN_EASE : SIG_ABANDON_EASE,
      reduceMotion: ReduceMotion.System,
    });
  }, [mode, progress]);

  return progress;
}
