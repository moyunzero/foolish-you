import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Alert } from 'react-native';

import { PLAY_STATE_DEBOUNCE_MS } from '../../constants/config';
import GameScreen from '../../app/game';
import * as dailyStorage from '../../lib/storage/dailyStorage';
import { saveDailySnapshot } from '../../lib/storage/dailyStorage';
import * as snapshotValidate from '../../lib/storage/snapshotValidate';
import {
  mockRouterReplace,
  resetRouterMocks,
} from '../helpers/expoRouterMocks';
import {
  makeBinaryPlayingSnapshot,
  makeSudokuPlayingSnapshot,
} from '../helpers/dailyGameFixtures';
import { ScreenProviders } from '../helpers/screenTestUtils';

function renderGame() {
  return render(
    <ScreenProviders>
      <GameScreen />
    </ScreenProviders>,
  );
}

describe('GameScreen', () => {
  beforeEach(async () => {
    resetRouterMocks();
    await AsyncStorage.clear();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders sudoku chrome when today is sudoku', async () => {
    await saveDailySnapshot(makeSudokuPlayingSnapshot());
    renderGame();

    await waitFor(() => {
      expect(screen.getByText('数独')).toBeTruthy();
    });
    expect(screen.getByText('完成今日')).toBeTruthy();
    expect(screen.getByText('放弃今日挑战')).toBeTruthy();
  });

  it('renders binary chrome when today is binary', async () => {
    await saveDailySnapshot(makeBinaryPlayingSnapshot());
    renderGame();

    await waitFor(() => {
      expect(screen.getByText('二进制')).toBeTruthy();
    });
    expect(screen.getByText('完成今日')).toBeTruthy();
  });

  it('navigates to result when stored status is already completed', async () => {
    await saveDailySnapshot(
      makeSudokuPlayingSnapshot({
        status: 'completed',
        finishedAt: 1_700_000_900_000,
      }),
    );
    renderGame();

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/result');
    });
  });

  it('shows reload UI when puzzle is inconsistent while still playing', async () => {
    await saveDailySnapshot(makeBinaryPlayingSnapshot());
    jest
      .spyOn(snapshotValidate, 'isSnapshotPuzzleConsistent')
      .mockReturnValue(false);

    renderGame();

    await waitFor(
      () => {
        expect(screen.getByText(/今日题目加载失败/)).toBeTruthy();
        expect(screen.getByText('重新加载')).toBeTruthy();
      },
      { timeout: 15_000 },
    );
  });

  it('shows save error banner after failed playState persistence', async () => {
    jest.useFakeTimers();
    await saveDailySnapshot(makeBinaryPlayingSnapshot());

    jest
      .spyOn(dailyStorage, 'saveDailySnapshot')
      .mockResolvedValueOnce(true)
      .mockResolvedValue(false);

    renderGame();

    await waitFor(() => {
      expect(screen.getByText('二进制')).toBeTruthy();
    });

    const emptyCell = screen.queryByLabelText('第 1 行第 1 列，空');
    if (emptyCell != null) {
      fireEvent.press(emptyCell);
    }

    await act(async () => {
      jest.advanceTimersByTime(PLAY_STATE_DEBOUNCE_MS);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByText('重试保存')).toBeTruthy();
    });

    jest.useRealTimers();
  });

  it('navigates to result after confirming abandon', async () => {
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _message, buttons) => {
        const abandon = buttons?.find((b) => b.text === '放弃');
        abandon?.onPress?.();
      });

    await saveDailySnapshot(makeSudokuPlayingSnapshot());
    renderGame();

    await waitFor(() => {
      expect(screen.getByText('放弃今日挑战')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('放弃今日挑战'));

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/result');
    });

    alertSpy.mockRestore();
  });
});
