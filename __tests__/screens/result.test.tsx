import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import ResultScreen from '../../app/result';
import { saveDailySnapshot } from '../../lib/storage/dailyStorage';
import { saveRatingState } from '../../lib/storage/ratingStorage';
import { saveStreakState } from '../../lib/storage/streakStorage';
import { EMPTY_STREAK_STATE } from '../../lib/streak/types';
import { DEFAULT_RATING_STATE } from '../../lib/rating/types';
import {
  mockRouterReplace,
  resetRouterMocks,
} from '../helpers/expoRouterMocks';
import {
  FIXTURE_TODAY,
  makeBinaryPlayingSnapshot,
  makeSlitherlinkCompletedSnapshot,
  makeSudokuCompletedSnapshot,
  makeSudokuPlayingSnapshot,
} from '../helpers/dailyGameFixtures';
import { ScreenProviders } from '../helpers/screenTestUtils';

const mockSetStringAsync = jest.fn();

jest.mock('expo-clipboard', () => ({
  setStringAsync: (...args: unknown[]) => mockSetStringAsync(...args),
}));

const mockRequestReview = jest.fn(() => Promise.resolve());

jest.mock('expo-store-review', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  requestReview: () => mockRequestReview(),
}));

jest.mock('../../lib/platform/exitApp', () => ({
  exitApplication: jest.fn(),
}));

function renderResult() {
  return render(
    <ScreenProviders>
      <ResultScreen />
    </ScreenProviders>,
  );
}

describe('ResultScreen', () => {
  beforeEach(async () => {
    resetRouterMocks();
    mockSetStringAsync.mockReset();
    mockSetStringAsync.mockResolvedValue(undefined);
    mockRequestReview.mockClear();
    await AsyncStorage.clear();
  });

  it('shows fallback when status is still playing', async () => {
    await saveDailySnapshot(makeSudokuPlayingSnapshot());
    renderResult();

    await waitFor(() => {
      expect(screen.getByText('今日状态加载中…')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('返回'));
    expect(mockRouterReplace).toHaveBeenCalledWith('/');
  });

  it('shows victory copy when completed without playState after recovery', async () => {
    const snap = makeSudokuPlayingSnapshot({
      status: 'completed',
      finishedAt: 1_700_000_900_000,
    });
    delete snap.playState;
    await saveDailySnapshot(snap);

    renderResult();

    await waitFor(() => {
      expect(screen.getByText(/今日战绩 · 通关/)).toBeTruthy();
      expect(screen.getByText('今日', { exact: true })).toBeTruthy();
    });
    expect(screen.queryByText('拷贝战报')).toBeNull();
  });

  it('shows victory copy when today is completed', async () => {
    await saveDailySnapshot(makeSudokuCompletedSnapshot());
    renderResult();

    await waitFor(() => {
      expect(screen.getByText(/今日战绩 · 通关/)).toBeTruthy();
    });
    expect(screen.getByText(/连续 1 天/)).toBeTruthy();
    expect(screen.getByText('拷贝战报')).toBeTruthy();
    expect(screen.getByText(/傻了么/)).toBeTruthy();
  });

  it('shows defeat copy when today is abandoned', async () => {
    await saveDailySnapshot(
      makeBinaryPlayingSnapshot({
        status: 'abandoned',
        finishedAt: 1_700_000_900_000,
      }),
    );
    renderResult();

    await waitFor(() => {
      expect(screen.getByText(/今日战绩 · 认怂/)).toBeTruthy();
    });
    expect(screen.getByText('拷贝战报')).toBeTruthy();
  });

  it('copies share card to clipboard when share button pressed', async () => {
    await saveDailySnapshot(makeSudokuCompletedSnapshot());
    renderResult();

    await waitFor(() => {
      expect(screen.getByText('拷贝战报')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('拷贝战报'));

    await waitFor(() => {
      expect(mockSetStringAsync).toHaveBeenCalledTimes(1);
    });

    const copied = String(mockSetStringAsync.mock.calls[0]?.[0] ?? '');
    expect(copied).toContain('傻了么 · 数独');
    expect(copied).not.toMatch(/绝密/);

    await waitFor(() => {
      expect(screen.getByText('已复制')).toBeTruthy();
    });
  });

  it('shows stats cards on completed result', async () => {
    await saveDailySnapshot(
      makeSudokuCompletedSnapshot({
        startedAt: 1_700_000_500_000,
      }),
    );
    await saveStreakState({
      ...EMPTY_STREAK_STATE,
      currentStreak: 2,
      lastCheckInDateKey: FIXTURE_TODAY,
      historicalMax: 5,
    });

    renderResult();

    await waitFor(() => {
      expect(screen.getByText('今日')).toBeTruthy();
      expect(screen.getByText('06:40')).toBeTruthy();
      expect(screen.getByText('本周')).toBeTruthy();
      expect(screen.getByText('最长连签')).toBeTruthy();
    });

    expect(screen.getByLabelText('查看本月日历')).toBeTruthy();
  });

  it('shows slitherlink reveal on completed slitherlink result', async () => {
    await saveDailySnapshot(makeSlitherlinkCompletedSnapshot());
    renderResult();

    await waitFor(() => {
      expect(screen.getByText(/今日战绩 · 通关/)).toBeTruthy();
      expect(screen.getByText('今日数回 ·')).toBeTruthy();
    });
  });

  it('requests store review after delay when rating gates pass', async () => {
    jest.useFakeTimers();
    await saveRatingState({ ...DEFAULT_RATING_STATE, completedCount: 3 });
    await saveStreakState({
      ...EMPTY_STREAK_STATE,
      currentStreak: 2,
      lastCheckInDateKey: FIXTURE_TODAY,
      historicalMax: 2,
    });
    await saveDailySnapshot(makeSudokuCompletedSnapshot());

    renderResult();

    await waitFor(() => {
      expect(screen.getByText('拷贝战报')).toBeTruthy();
    });

    await act(async () => {
      await jest.advanceTimersByTimeAsync(250);
    });

    await waitFor(() => {
      expect(mockRequestReview).toHaveBeenCalledTimes(1);
    });

    jest.useRealTimers();
  });
});
