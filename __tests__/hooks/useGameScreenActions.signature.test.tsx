import { act, renderHook } from '@testing-library/react-native';

import { useGameScreenActions } from '../../hooks/useGameScreenActions';
import { feelSuccess } from '../../lib/feel/haptics';

jest.mock('../../lib/feel/haptics', () => ({
  feelSuccess: jest.fn(),
  feelConfirm: jest.fn(),
}));

describe('useGameScreenActions signature kicks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('complete path kicks win signature then feelSuccess once before markCompleted', async () => {
    const markCompleted = jest.fn(async () => {});
    const markAbandoned = jest.fn(async () => {});
    const onWinSignature = jest.fn();
    const onAbandonSignature = jest.fn();
    const callOrder: string[] = [];

    markCompleted.mockImplementation(async () => {
      callOrder.push('markCompleted');
    });
    onWinSignature.mockImplementation(() => {
      callOrder.push('onWinSignature');
    });
    (feelSuccess as jest.Mock).mockImplementation(() => {
      callOrder.push('feelSuccess');
    });

    const { result } = renderHook(() =>
      useGameScreenActions({
        canComplete: true,
        markCompleted,
        markAbandoned,
        onWinSignature,
        onAbandonSignature,
      }),
    );

    await act(async () => {
      await result.current.handleComplete();
    });

    expect(onWinSignature).toHaveBeenCalledTimes(1);
    expect(feelSuccess).toHaveBeenCalledTimes(1);
    expect(markCompleted).toHaveBeenCalledTimes(1);
    expect(onAbandonSignature).not.toHaveBeenCalled();
    expect(callOrder).toEqual([
      'onWinSignature',
      'feelSuccess',
      'markCompleted',
    ]);
  });

  it('complete is no-op when cannot complete — no kick or feelSuccess', async () => {
    const markCompleted = jest.fn(async () => {});
    const onWinSignature = jest.fn();

    const { result } = renderHook(() =>
      useGameScreenActions({
        canComplete: false,
        markCompleted,
        markAbandoned: jest.fn(async () => {}),
        onWinSignature,
      }),
    );

    await act(async () => {
      await result.current.handleComplete();
    });

    expect(onWinSignature).not.toHaveBeenCalled();
    expect(feelSuccess).not.toHaveBeenCalled();
    expect(markCompleted).not.toHaveBeenCalled();
  });

  it('abandon path kicks abandon signature without feelSuccess', () => {
    const markAbandoned = jest.fn(async () => {});
    const onAbandonSignature = jest.fn();
    const callOrder: string[] = [];

    onAbandonSignature.mockImplementation(() => {
      callOrder.push('onAbandonSignature');
    });
    markAbandoned.mockImplementation(async () => {
      callOrder.push('markAbandoned');
    });

    const { result } = renderHook(() =>
      useGameScreenActions({
        canComplete: true,
        markCompleted: jest.fn(async () => {}),
        markAbandoned,
        onAbandonSignature,
      }),
    );

    act(() => {
      result.current.confirmAbandon();
    });
    expect(result.current.abandonSheetVisible).toBe(true);

    act(() => {
      result.current.performAbandon();
    });

    expect(onAbandonSignature).toHaveBeenCalledTimes(1);
    expect(feelSuccess).not.toHaveBeenCalled();
    expect(markAbandoned).toHaveBeenCalledTimes(1);
    expect(result.current.abandonSheetVisible).toBe(false);
    expect(callOrder[0]).toBe('onAbandonSignature');
  });
});
