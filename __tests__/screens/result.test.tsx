import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import ResultScreen from '../../app/result';
import { saveDailySnapshot } from '../../lib/storage/dailyStorage';
import {
  mockRouterReplace,
  resetRouterMocks,
} from '../helpers/expoRouterMocks';
import {
  makeBinaryPlayingSnapshot,
  makeSudokuPlayingSnapshot,
} from '../helpers/dailyGameFixtures';
import { ScreenProviders } from '../helpers/screenTestUtils';

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

  it('shows victory copy when today is completed', async () => {
    await saveDailySnapshot(
      makeSudokuPlayingSnapshot({
        status: 'completed',
        finishedAt: 1_700_000_900_000,
      }),
    );
    renderResult();

    await waitFor(() => {
      expect(screen.getByText(/今日战绩 · 通关/)).toBeTruthy();
    });
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
  });
});
