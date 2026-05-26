jest.mock('../../../constants/dev', () => ({
  getDevForceGameType: () => null,
}));

jest.mock('../../../lib/platform/runAfterInteractions', () => ({
  runAfterInteractions: <T,>(fn: () => T | Promise<T>) => Promise.resolve(fn()),
}));

import { getLocalDateKey } from '../../../lib/date/localDay';
import {
  buildNewDailySnapshot,
  hydrateDailyGame,
} from '../../../lib/daily/dailyHydrate';
import * as dailyStorage from '../../../lib/storage/dailyStorage';
import * as snapshotPrep from '../../../lib/storage/snapshotPrep';
import {
  FIXTURE_TODAY,
  FIXTURE_YESTERDAY,
  makeBinaryPlayingSnapshot,
} from '../../helpers/dailyGameFixtures';

jest.mock('../../../lib/date/localDay');
jest.mock('../../../lib/storage/snapshotPrep');

const getLocalDateKeyMock = jest.mocked(getLocalDateKey);

describe('dailyHydrate', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    getLocalDateKeyMock.mockReturnValue(FIXTURE_TODAY);
  });

  it('hydrateDailyGame returns today snapshot from storage', async () => {
    const stored = makeBinaryPlayingSnapshot();
    jest.spyOn(dailyStorage, 'loadDailySnapshot').mockResolvedValue(stored);
    const saveSpy = jest
      .spyOn(dailyStorage, 'saveDailySnapshot')
      .mockResolvedValue(true);
    jest
      .spyOn(snapshotPrep, 'prepareTodaySnapshot')
      .mockImplementation((s) => s);

    const result = await hydrateDailyGame();

    expect(result.dateKey).toBe(FIXTURE_TODAY);
    expect(result.status).toBe('playing');
    expect(saveSpy).toHaveBeenCalled();
  });

  it('hydrateDailyGame builds new daily when dateKey differs', async () => {
    const yesterday = makeBinaryPlayingSnapshot({
      dateKey: FIXTURE_YESTERDAY,
      seed: 42,
    });
    jest.spyOn(dailyStorage, 'loadDailySnapshot').mockResolvedValue(yesterday);
    jest.spyOn(dailyStorage, 'saveDailySnapshot').mockResolvedValue(true);

    const result = await hydrateDailyGame();

    expect(result.dateKey).toBe(FIXTURE_TODAY);
    expect(result.seed).not.toBe(42);
  });

  it('does not add empty playState when status is completed', async () => {
    const completed = makeBinaryPlayingSnapshot({
      status: 'completed',
      finishedAt: Date.now(),
    });
    const { playState: _omit, ...withoutPlay } = completed;
    jest.spyOn(dailyStorage, 'loadDailySnapshot').mockResolvedValue(withoutPlay);
    jest.spyOn(dailyStorage, 'saveDailySnapshot').mockResolvedValue(true);
    jest
      .spyOn(snapshotPrep, 'prepareTodaySnapshot')
      .mockImplementation((s) => s);

    const result = await hydrateDailyGame();

    expect(result.status).toBe('completed');
    expect(result.playState).toBeUndefined();
  });

  it('buildNewDailySnapshot invokes onSaveFailed when save fails', async () => {
    jest.spyOn(dailyStorage, 'saveDailySnapshot').mockResolvedValue(false);
    const onSaveFailed = jest.fn();

    await buildNewDailySnapshot({
      today: FIXTURE_TODAY,
      previous: null,
      onSaveFailed,
    });

    expect(onSaveFailed).toHaveBeenCalledTimes(1);
  });
});
