import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, waitFor } from '@testing-library/react-native';

import IndexScreen from '../../app/index';
import { getLocalDateKey } from '../../lib/date/localDay';
import { saveDailySnapshot } from '../../lib/storage/dailyStorage';
import {
  makeBinaryPlayingSnapshot,
  makeSudokuPlayingSnapshot,
} from '../helpers/dailyGameFixtures';
import { ScreenProviders } from '../helpers/screenTestUtils';

const getLocalDateKeyMock = jest.mocked(getLocalDateKey);

function renderIndex() {
  return render(
    <ScreenProviders>
      <IndexScreen />
    </ScreenProviders>,
  );
}

describe('IndexScreen', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    getLocalDateKeyMock.mockReturnValue('2026-05-19');
  });

  it('shows splash copy while daily state is loading', () => {
    renderIndex();
    expect(screen.getByText('傻了么')).toBeTruthy();
    expect(screen.getByText('正在翻出今天的傻题…')).toBeTruthy();
  });

  it('redirects to game when today is playing', async () => {
    await saveDailySnapshot(makeSudokuPlayingSnapshot());
    renderIndex();

    await waitFor(() => {
      expect(screen.getByTestId('redirect:/game')).toBeTruthy();
    });
  });

  it('redirects to result when today is completed', async () => {
    await saveDailySnapshot(
      makeSudokuPlayingSnapshot({
        status: 'completed',
        finishedAt: 1_700_000_900_000,
      }),
    );
    renderIndex();

    await waitFor(() => {
      expect(screen.getByTestId('redirect:/result')).toBeTruthy();
    });
  });

  it('redirects to result when today is abandoned', async () => {
    await saveDailySnapshot(
      makeBinaryPlayingSnapshot({
        status: 'abandoned',
        finishedAt: 1_700_000_900_000,
      }),
    );
    renderIndex();

    await waitFor(() => {
      expect(screen.getByTestId('redirect:/result')).toBeTruthy();
    });
  });
});
