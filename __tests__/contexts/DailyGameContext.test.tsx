import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  act,
  renderHook,
  waitFor,
} from '@testing-library/react-native';
import React, { type ReactNode } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { PLAY_STATE_DEBOUNCE_MS } from '../../constants/config';
import {
  DailyGameProvider,
  useDailyGame,
} from '../../contexts/DailyGameContext';
import { I18nTestProvider } from '../../lib/i18n/I18nContext';
import { getLocalDateKey } from '../../lib/date/localDay';
import * as dailyStorage from '../../lib/storage/dailyStorage';
import * as streakStorage from '../../lib/storage/streakStorage';
import {
  clearDailySnapshot,
  saveDailySnapshot,
} from '../../lib/storage/dailyStorage';
import {
  loadStreakState,
  saveStreakState,
} from '../../lib/storage/streakStorage';
import { recordCompletion } from '../../lib/storage/completionHistoryStorage';
import {
  FIXTURE_TODAY,
  FIXTURE_TOMORROW,
  FIXTURE_YESTERDAY,
  makeBinaryPlayingSnapshot,
  makeSlitherlinkCompletedSnapshot,
  makeSlitherlinkPlayingSnapshot,
  makeSudokuPlayingSnapshot,
  withOneFilledCell,
  withOneSlitherlinkEdge,
} from '../helpers/dailyGameFixtures';
import type { SlitherlinkPlayState } from '../../lib/puzzles/types';

const getLocalDateKeyMock = jest.mocked(getLocalDateKey);

type AppStateHandler = (state: AppStateStatus) => void;
const appStateHandlers: AppStateHandler[] = [];

function wrapper({ children }: { children: ReactNode }) {
  return (
    <I18nTestProvider locale="zh">
      <DailyGameProvider>{children}</DailyGameProvider>
    </I18nTestProvider>
  );
}

async function waitForHydrated(
  result: { current: ReturnType<typeof useDailyGame> },
) {
  await waitFor(
    () => {
      expect(result.current.status).not.toBe('loading');
    },
    { timeout: 15_000 },
  );
}

async function renderAndHydrate() {
  const hook = renderHook(() => useDailyGame(), { wrapper });
  await waitForHydrated(hook.result);
  return hook;
}

function emitAppState(state: AppStateStatus) {
  for (const handler of appStateHandlers) {
    handler(state);
  }
}

describe('DailyGameContext', () => {
  beforeEach(async () => {
    jest.useRealTimers();
    await AsyncStorage.clear();
    getLocalDateKeyMock.mockReturnValue(FIXTURE_TODAY);
    appStateHandlers.length = 0;

    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, handler) => {
      appStateHandlers.push(handler as AppStateHandler);
      return { remove: jest.fn() };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws when useDailyGame is used outside provider', () => {
    expect(() => renderHook(() => useDailyGame())).toThrow(
      'useDailyGame must be used within DailyGameProvider',
    );
  });

  it('hydrates today snapshot from storage', async () => {
    const stored = makeBinaryPlayingSnapshot({ status: 'playing' });
    await saveDailySnapshot(stored);

    const { result } = await renderAndHydrate();

    expect(result.current.status).toBe('playing');
    expect(result.current.dateKey).toBe(FIXTURE_TODAY);
    expect(result.current.gameType).toBe('binary');
    expect(result.current.puzzle).not.toBeNull();
    expect(result.current.playState).not.toBeNull();
  });

  it('starts a new daily when stored dateKey is not today', async () => {
    const yesterday = makeBinaryPlayingSnapshot({
      dateKey: FIXTURE_YESTERDAY,
      seed: 111,
    });
    await saveDailySnapshot(yesterday);

    const { result } = await renderAndHydrate();

    expect(result.current.status).toBe('playing');
    expect(result.current.dateKey).toBe(FIXTURE_TODAY);
    expect(result.current.dateKey).not.toBe(FIXTURE_YESTERDAY);
    expect(result.current.seed).not.toBe(111);
  });

  it('repairs inconsistent snapshot on hydrate and exposes puzzle', async () => {
    const sudoku = makeSudokuPlayingSnapshot();
    const broken = { ...sudoku, gameType: 'binary' as const };
    await saveDailySnapshot(broken);

    const { result } = await renderAndHydrate();

    expect(result.current.puzzle).not.toBeNull();
    expect(result.current.gameType).toBe('binary');
    expect(result.current.puzzle?.kind).toBe('binary');
    expect(result.current.playState).not.toBeNull();
  });

  it('updatePlayState applies optimistic UI immediately', async () => {
    const stored = makeBinaryPlayingSnapshot();
    await saveDailySnapshot(stored);

    const { result } = await renderAndHydrate();

    const base = result.current.playState!;
    const edited = withOneFilledCell(base);

    act(() => {
      result.current.updatePlayState(edited);
    });

    expect(result.current.playState).toEqual(edited);
  });

  it('debounces playState persistence', async () => {
    jest.useFakeTimers();
    const stored = makeBinaryPlayingSnapshot();
    await saveDailySnapshot(stored);

    const saveSpy = jest.spyOn(dailyStorage, 'saveDailySnapshot');

    const { result } = await renderAndHydrate();

    const initialSaveCount = saveSpy.mock.calls.length;
    const edited = withOneFilledCell(result.current.playState!);

    act(() => {
      result.current.updatePlayState(edited);
    });

    expect(saveSpy.mock.calls.length).toBe(initialSaveCount);

    await act(async () => {
      jest.advanceTimersByTime(PLAY_STATE_DEBOUNCE_MS - 1);
    });
    expect(saveSpy.mock.calls.length).toBe(initialSaveCount);

    await act(async () => {
      jest.advanceTimersByTime(1);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(saveSpy.mock.calls.length).toBeGreaterThan(initialSaveCount);
    });

    const lastPayload = saveSpy.mock.calls.at(-1)?.[0];
    expect(lastPayload?.playState).toEqual(edited);

    saveSpy.mockRestore();
    jest.useRealTimers();
  });

  it('markCompleted flushes pending playState before saving status', async () => {
    jest.useFakeTimers();
    const stored = makeBinaryPlayingSnapshot();
    await saveDailySnapshot(stored);

    const { result } = await renderAndHydrate();

    const edited = withOneFilledCell(result.current.playState!);

    act(() => {
      result.current.updatePlayState(edited);
    });

    await act(async () => {
      await result.current.markCompleted();
    });

    expect(result.current.status).toBe('completed');
    expect(result.current.snapshot?.playState).toEqual(edited);
    expect(result.current.snapshot?.finishedAt).toEqual(expect.any(Number));
    expect(result.current.streakLine).toBe('连续 1 天 · 今天没傻过');

    await expect(loadStreakState()).resolves.toEqual({
      currentStreak: 1,
      lastCheckInDateKey: FIXTURE_TODAY,
      historicalMax: 1,
      freezeCount: 0,
      lastFreezeGrantWeekKey: '2026-W21',
      freezeConsumedSessionKey: null,
    });

    jest.useRealTimers();
  });

  it('markAbandoned does not record streak check-in', async () => {
    const stored = makeBinaryPlayingSnapshot();
    await saveDailySnapshot(stored);

    const { result } = await renderAndHydrate();

    await act(async () => {
      await result.current.markAbandoned();
    });

    expect(result.current.status).toBe('abandoned');
    await expect(loadStreakState()).resolves.toBeNull();
    expect(result.current.streakLine).toBe('连签战绩 · 完成今日入账');
  });

  it('reconciles streak on hydrate when daily is already completed', async () => {
    const stored = makeBinaryPlayingSnapshot({
      status: 'completed',
      finishedAt: Date.now(),
    });
    await saveDailySnapshot(stored);

    const { result } = await renderAndHydrate();

    expect(result.current.streakLine).toBe('连续 1 天 · 今天没傻过');
    await expect(loadStreakState()).resolves.toEqual({
      currentStreak: 1,
      lastCheckInDateKey: FIXTURE_TODAY,
      historicalMax: 1,
      freezeCount: 0,
      lastFreezeGrantWeekKey: '2026-W21',
      freezeConsumedSessionKey: null,
    });
  });

  it('surfaces streak save failure after markCompleted', async () => {
    const stored = makeBinaryPlayingSnapshot();
    await saveDailySnapshot(stored);

    jest.spyOn(streakStorage, 'saveStreakState').mockResolvedValue(false);

    const { result } = await renderAndHydrate();

    await act(async () => {
      await result.current.markCompleted();
    });

    expect(result.current.status).toBe('completed');
    expect(result.current.streakSaveError).toBe(true);
    expect(result.current.streakLine).toBe('连签战绩 · 完成今日入账');
  });

  it('retryStreakSave clears streakSaveError when persistence succeeds', async () => {
    const stored = makeBinaryPlayingSnapshot();
    await saveDailySnapshot(stored);

    const saveStreakSpy = jest
      .spyOn(streakStorage, 'saveStreakState')
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    const { result } = await renderAndHydrate();

    await act(async () => {
      await result.current.markCompleted();
    });

    expect(result.current.streakSaveError).toBe(true);

    await act(async () => {
      await result.current.retryStreakSave();
    });

    expect(result.current.streakSaveError).toBe(false);
    expect(result.current.streakLine).toBe('连续 1 天 · 今天没傻过');
    expect(saveStreakSpy).toHaveBeenCalledTimes(2);
  });

  it('reverts optimistic playState when persistence fails', async () => {
    jest.useFakeTimers();
    const stored = makeBinaryPlayingSnapshot();
    await saveDailySnapshot(stored);

    const saveSpy = jest
      .spyOn(dailyStorage, 'saveDailySnapshot')
      .mockResolvedValueOnce(true)
      .mockResolvedValue(false);

    const { result } = await renderAndHydrate();

    const before = result.current.playState!;
    const edited = withOneFilledCell(before);

    act(() => {
      result.current.updatePlayState(edited);
    });
    expect(result.current.playState).toEqual(edited);

    await act(async () => {
      jest.advanceTimersByTime(PLAY_STATE_DEBOUNCE_MS);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.playState).toEqual(before);
      expect(result.current.saveError).toBe(true);
    });

    saveSpy.mockResolvedValue(true);

    await act(async () => {
      await result.current.retrySave();
    });

    expect(result.current.saveError).toBe(false);

    saveSpy.mockRestore();
    jest.useRealTimers();
  });

  it('flushes pending playState on AppState background', async () => {
    jest.useFakeTimers();
    const stored = makeBinaryPlayingSnapshot();
    await saveDailySnapshot(stored);

    const saveSpy = jest.spyOn(dailyStorage, 'saveDailySnapshot');

    const { result } = await renderAndHydrate();

    const countAfterHydrate = saveSpy.mock.calls.length;
    const edited = withOneFilledCell(result.current.playState!);

    act(() => {
      result.current.updatePlayState(edited);
    });

    await act(async () => {
      emitAppState('background');
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(saveSpy.mock.calls.length).toBeGreaterThan(countAfterHydrate);
    });

    const lastPayload = saveSpy.mock.calls.at(-1)?.[0];
    expect(lastPayload?.playState).toEqual(edited);

    saveSpy.mockRestore();
    jest.useRealTimers();
  });

  it('starts a new playing daily when calendar day advances on AppState active', async () => {
    await saveDailySnapshot(
      makeBinaryPlayingSnapshot({ status: 'completed', dateKey: FIXTURE_TODAY }),
    );

    const { result } = await renderAndHydrate();
    expect(result.current.status).toBe('completed');
    expect(result.current.dateKey).toBe(FIXTURE_TODAY);

    getLocalDateKeyMock.mockReturnValue(FIXTURE_TOMORROW);

    await act(async () => {
      emitAppState('active');
      await Promise.resolve();
    });

    await waitFor(
      () => {
        expect(result.current.status).not.toBe('loading');
        expect(result.current.dateKey).toBe(FIXTURE_TOMORROW);
        expect(result.current.status).toBe('playing');
      },
      { timeout: 15_000 },
    );
  });

  it('re-hydrates when AppState becomes active', async () => {
    const stored = makeBinaryPlayingSnapshot({ status: 'completed' });
    await saveDailySnapshot(stored);

    const { result } = await renderAndHydrate();
    expect(result.current.status).toBe('completed');

    await saveDailySnapshot(
      makeBinaryPlayingSnapshot({ status: 'playing', seed: 9999 }),
    );

    await act(async () => {
      emitAppState('active');
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('playing');
      expect(result.current.seed).toBe(9999);
    });
  });

  it('devRegenerateToday clears storage and builds a new snapshot', async () => {
    const stored = makeBinaryPlayingSnapshot({ seed: 555 });
    await saveDailySnapshot(stored);

    const { result } = await renderAndHydrate();
    expect(result.current.seed).toBe(555);

    await act(async () => {
      await result.current.devRegenerateToday('sudoku');
    });

    expect(result.current.status).toBe('playing');
    expect(result.current.gameType).toBe('sudoku');
    expect(result.current.seed).not.toBe(555);

    const onDisk = await AsyncStorage.getItem('@foolish-you/daily-v1');
    expect(onDisk).not.toBeNull();
  });

  it('devRegenerateToday() with no arg keeps gameType but changes puzzle', async () => {
    const stored = makeBinaryPlayingSnapshot({ seed: 777 });
    await saveDailySnapshot(stored);

    const { result } = await renderAndHydrate();
    expect(result.current.gameType).toBe('binary');
    const priorHash = result.current.snapshot?.puzzleHash;

    await act(async () => {
      await result.current.devRegenerateToday();
    });

    expect(result.current.status).toBe('playing');
    expect(result.current.gameType).toBe('binary');
    expect(result.current.snapshot?.puzzleHash).not.toBe(priorHash);
    expect(result.current.seed).not.toBe(777);
  });

  it('devRegenerateToday(null) full re-roll may change gameType', async () => {
    const stored = makeBinaryPlayingSnapshot({ seed: 888 });
    await saveDailySnapshot(stored);

    const { result } = await renderAndHydrate();
    expect(result.current.gameType).toBe('binary');
    const priorHash = result.current.snapshot?.puzzleHash;

    await act(async () => {
      await result.current.devRegenerateToday(null);
    });

    expect(result.current.status).toBe('playing');
    expect(result.current.snapshot?.puzzleHash).not.toBe(priorHash);
    expect(result.current.seed).not.toBe(888);
  });

  it('devRegenerateToday forces slitherlink without blocking on generator', async () => {
    const stored = makeSudokuPlayingSnapshot();
    await saveDailySnapshot(stored);

    const { result } = await renderAndHydrate();
    expect(result.current.gameType).toBe('sudoku');

    await act(async () => {
      await result.current.devRegenerateToday('slitherlink');
    });

    expect(result.current.status).toBe('playing');
    expect(result.current.gameType).toBe('slitherlink');
    expect(result.current.puzzle?.kind).toBe('slitherlink');
    expect(result.current.playState).not.toBeNull();
    expect(Array.isArray(result.current.playState)).toBe(false);
  });

  it('markAbandoned persists abandoned status', async () => {
    const stored = makeBinaryPlayingSnapshot();
    await saveDailySnapshot(stored);

    const { result } = await renderAndHydrate();

    await act(async () => {
      await result.current.markAbandoned();
    });

    expect(result.current.status).toBe('abandoned');
    expect(result.current.snapshot?.status).toBe('abandoned');
  });

  it('refresh re-runs hydrate', async () => {
    const stored = makeBinaryPlayingSnapshot({ status: 'completed' });
    await saveDailySnapshot(stored);

    const { result } = await renderAndHydrate();
    expect(result.current.status).toBe('completed');

    await clearDailySnapshot();
    await saveDailySnapshot(
      makeBinaryPlayingSnapshot({ status: 'playing', seed: 7777 }),
    );

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.status).toBe('playing');
    expect(result.current.seed).toBe(7777);
  });

  it('consumes freeze on hydrate when user missed exactly one day', async () => {
    await saveStreakState({
      currentStreak: 5,
      lastCheckInDateKey: '2026-05-17',
      historicalMax: 8,
      freezeCount: 1,
      lastFreezeGrantWeekKey: '2026-W21',
      freezeConsumedSessionKey: null,
    });
    await saveDailySnapshot(makeBinaryPlayingSnapshot());

    const { result } = await renderAndHydrate();

    expect(result.current.displayStreak).toBe(5);
    expect(result.current.freezeConsumedToday).toBe(true);
    await expect(loadStreakState()).resolves.toEqual({
      currentStreak: 5,
      lastCheckInDateKey: '2026-05-18',
      historicalMax: 8,
      freezeCount: 0,
      lastFreezeGrantWeekKey: '2026-W21',
      freezeConsumedSessionKey: FIXTURE_TODAY,
    });
  });

  it('backfills yesterday check-in instead of consuming freeze when real completion exists', async () => {
    await saveStreakState({
      currentStreak: 5,
      lastCheckInDateKey: '2026-05-17',
      historicalMax: 8,
      freezeCount: 1,
      lastFreezeGrantWeekKey: '2026-W21',
      freezeConsumedSessionKey: null,
    });
    await recordCompletion('2026-05-18', 120_000);
    await saveDailySnapshot(makeBinaryPlayingSnapshot());

    const { result } = await renderAndHydrate();

    expect(result.current.freezeConsumedToday).toBe(false);
    await expect(loadStreakState()).resolves.toEqual({
      currentStreak: 6,
      lastCheckInDateKey: '2026-05-18',
      historicalMax: 8,
      freezeCount: 1,
      lastFreezeGrantWeekKey: '2026-W21',
      freezeConsumedSessionKey: null,
    });
  });

  describe('slitherlink', () => {
    it('hydrates slitherlink snapshot from storage', async () => {
      await saveDailySnapshot(makeSlitherlinkPlayingSnapshot());

      const { result } = await renderAndHydrate();

      expect(result.current.status).toBe('playing');
      expect(result.current.gameType).toBe('slitherlink');
      expect(result.current.puzzle?.kind).toBe('slitherlink');
      expect(result.current.playState).not.toBeNull();
    });

    it('updatePlayState and markCompleted persist slitherlink edges', async () => {
      await saveDailySnapshot(makeSlitherlinkPlayingSnapshot());

      const { result } = await renderAndHydrate();

      const edited = withOneSlitherlinkEdge(
        result.current.playState as SlitherlinkPlayState,
      );

      act(() => {
        result.current.updatePlayState(edited);
      });

      expect(result.current.playState).toEqual(edited);

      await act(async () => {
        await result.current.markCompleted();
      });

      expect(result.current.status).toBe('completed');
      expect(result.current.snapshot?.playState).toEqual(edited);
    });

    it('completed snapshot with solution playState hydrates for result', async () => {
      await saveDailySnapshot(makeSlitherlinkCompletedSnapshot());

      const { result } = await renderAndHydrate();

      expect(result.current.status).toBe('completed');
      expect(result.current.gameType).toBe('slitherlink');
      expect(result.current.playState).not.toBeNull();
    });
  });
});
