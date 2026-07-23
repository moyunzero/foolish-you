import { useCallback, useState } from 'react';

type UseGameScreenActionsParams = {
  canComplete: boolean;
  markCompleted: () => Promise<void>;
  markAbandoned: () => Promise<void>;
};

export function useGameScreenActions({
  canComplete,
  markCompleted,
  markAbandoned,
}: UseGameScreenActionsParams) {
  const [abandonSheetVisible, setAbandonSheetVisible] = useState(false);

  const handleComplete = useCallback(async () => {
    if (!canComplete) return;
    await markCompleted();
  }, [canComplete, markCompleted]);

  const confirmAbandon = useCallback(() => {
    setAbandonSheetVisible(true);
  }, []);

  const cancelAbandon = useCallback(() => {
    setAbandonSheetVisible(false);
  }, []);

  const performAbandon = useCallback(() => {
    setAbandonSheetVisible(false);
    void markAbandoned();
  }, [markAbandoned]);

  return {
    handleComplete,
    confirmAbandon,
    abandonSheetVisible,
    cancelAbandon,
    performAbandon,
  };
}
