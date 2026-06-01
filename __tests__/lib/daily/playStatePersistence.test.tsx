import { renderHook, act, waitFor } from '@testing-library/react-native';

import { makeBinaryPlayingSnapshot } from '../../helpers/dailyGameFixtures';
import { usePlayStatePersistence } from '../../../lib/daily/playStatePersistence';
import type { DailySnapshot } from '../../../lib/puzzles/types';
import * as dailyStorage from '../../../lib/storage/dailyStorage';

describe('usePlayStatePersistence', () => {
  it('persistSnapshot does not update snapshot when save fails', async () => {
    const initial = makeBinaryPlayingSnapshot();
    let snapshot: DailySnapshot | null = initial;
    const setSnapshot = jest.fn((next: DailySnapshot | null) => {
      snapshot = next;
    });
    const onSaveFailed = jest.fn();

    jest.spyOn(dailyStorage, 'saveDailySnapshot').mockResolvedValue(false);

    const { result } = renderHook(() =>
      usePlayStatePersistence({ snapshot, setSnapshot, onSaveFailed }),
    );

    const terminal: DailySnapshot = {
      ...initial,
      status: 'completed',
      finishedAt: Date.now(),
    };

    let saveResult: Awaited<ReturnType<typeof result.current.persistSnapshot>> | undefined;
    await act(async () => {
      saveResult = await result.current.persistSnapshot(terminal);
    });

    expect(saveResult?.saved).toBe(false);
    expect(saveResult?.snapshot).toEqual(initial);
    expect(setSnapshot).not.toHaveBeenCalled();
    expect(onSaveFailed).toHaveBeenCalledTimes(1);

    jest.restoreAllMocks();
  });

  it('persistSnapshot updates snapshot when save succeeds', async () => {
    const initial = makeBinaryPlayingSnapshot();
    let snapshot: DailySnapshot | null = initial;
    const setSnapshot = jest.fn((next: DailySnapshot | null) => {
      snapshot = next;
    });

    jest.spyOn(dailyStorage, 'saveDailySnapshot').mockResolvedValue(true);

    const { result } = renderHook(() =>
      usePlayStatePersistence({ snapshot, setSnapshot }),
    );

    const terminal: DailySnapshot = {
      ...initial,
      status: 'abandoned',
      finishedAt: Date.now(),
    };

    await act(async () => {
      await result.current.persistSnapshot(terminal);
    });

    await waitFor(() => {
      expect(setSnapshot).toHaveBeenCalledWith(terminal);
    });

    jest.restoreAllMocks();
  });
});
