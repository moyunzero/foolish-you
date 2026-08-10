import { useCallback, useState } from 'react';

import { feelSuccess } from '../lib/feel/haptics';

type UseGameScreenActionsParams = {
  canComplete: boolean;
  markCompleted: () => Promise<void>;
  markAbandoned: () => Promise<void>;
  /** Sync kick before markCompleted — setSignature('win') in game.tsx. */
  onWinSignature?: () => void;
  /** Sync kick before markAbandoned — setSignature('abandon'); no haptic here. */
  onAbandonSignature?: () => void;
};

export function useGameScreenActions({
  canComplete,
  markCompleted,
  markAbandoned,
  onWinSignature,
  onAbandonSignature,
}: UseGameScreenActionsParams) {
  const [abandonSheetVisible, setAbandonSheetVisible] = useState(false);

  const handleComplete = useCallback(async () => {
    if (!canComplete) return;
    onWinSignature?.();
    feelSuccess();
    await markCompleted();
  }, [canComplete, markCompleted, onWinSignature]);

  const confirmAbandon = useCallback(() => {
    setAbandonSheetVisible(true);
  }, []);

  const cancelAbandon = useCallback(() => {
    setAbandonSheetVisible(false);
  }, []);

  const performAbandon = useCallback(() => {
    setAbandonSheetVisible(false);
    onAbandonSignature?.();
    void markAbandoned();
  }, [markAbandoned, onAbandonSignature]);

  return {
    handleComplete,
    confirmAbandon,
    abandonSheetVisible,
    cancelAbandon,
    performAbandon,
  };
}
