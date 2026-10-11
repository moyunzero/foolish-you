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
  FIXTURE_TOMORROW,
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

  it('keeps playing snapshot when dateKey is yesterday (carry)', async () => {
    const yesterday = makeBinaryPlayingSnapshot({
      dateKey: FIXTURE_YESTERDAY,
      seed: 42,
    });
    const playState = yesterday.playState;
    const puzzleHash = yesterday.puzzleHash;
    jest.spyOn(dailyStorage, 'loadDailySnapshot').mockResolvedValue(yesterday);
    jest.spyOn(dailyStorage, 'saveDailySnapshot').mockResolvedValue(true);
    jest
      .spyOn(snapshotPrep, 'prepareTodaySnapshot')
      .mockImplementation((s) => s);

    const result = await hydrateDailyGame();

    expect(result.dateKey).toBe(FIXTURE_YESTERDAY);
    expect(result.seed).toBe(42);
    expect(result.puzzleHash).toBe(puzzleHash);
    expect(result.playState).toEqual(playState);
    expect(result.status).toBe('playing');
  });

  it('keeps playing snapshot when dateKey is tomorrow (clock skew)', async () => {
    const tomorrow = makeBinaryPlayingSnapshot({
      dateKey: FIXTURE_TOMORROW,
      seed: 99,
    });
    jest.spyOn(dailyStorage, 'loadDailySnapshot').mockResolvedValue(tomorrow);
    jest.spyOn(dailyStorage, 'saveDailySnapshot').mockResolvedValue(true);
    jest
      .spyOn(snapshotPrep, 'prepareTodaySnapshot')
      .mockImplementation((s) => s);

    const result = await hydrateDailyGame();

    expect(result.dateKey).toBe(FIXTURE_TOMORROW);
    expect(result.seed).toBe(99);
    expect(result.status).toBe('playing');
  });

  it('mints new daily when completed snapshot dateKey is stale', async () => {
    const stale = makeBinaryPlayingSnapshot({
      dateKey: FIXTURE_YESTERDAY,
      seed: 42,
      status: 'completed',
      finishedAt: 1_700_000_900_000,
    });
    jest.spyOn(dailyStorage, 'loadDailySnapshot').mockResolvedValue(stale);
    jest.spyOn(dailyStorage, 'saveDailySnapshot').mockResolvedValue(true);

    const result = await hydrateDailyGame();

    expect(result.dateKey).toBe(FIXTURE_TODAY);
    expect(result.status).toBe('playing');
    expect(result.seed).not.toBe(42);
  });

  it('keeps stale completed when suppressMint is true', async () => {
    const stale = makeBinaryPlayingSnapshot({
      dateKey: FIXTURE_YESTERDAY,
      seed: 42,
      status: 'completed',
      finishedAt: 1_700_000_900_000,
    });
    jest.spyOn(dailyStorage, 'loadDailySnapshot').mockResolvedValue(stale);
    const saveSpy = jest
      .spyOn(dailyStorage, 'saveDailySnapshot')
      .mockResolvedValue(true);
    jest
      .spyOn(snapshotPrep, 'prepareTodaySnapshot')
      .mockImplementation((s) => s);

    const result = await hydrateDailyGame({ suppressMint: true });

    expect(result.dateKey).toBe(FIXTURE_YESTERDAY);
    expect(result.status).toBe('completed');
    expect(result.seed).toBe(42);
    expect(result.puzzleHash).toBe(stale.puzzleHash);
    // Keep path prepare/saves; must not mint a new playing slot.
    expect(saveSpy).toHaveBeenCalled();
    const saved = saveSpy.mock.calls.at(-1)?.[0];
    expect(saved?.status).toBe('completed');
    expect(saved?.dateKey).toBe(FIXTURE_YESTERDAY);
  });

  it('mints new daily when abandoned snapshot dateKey is stale (D-06)', async () => {
    const stale = makeBinaryPlayingSnapshot({
      dateKey: FIXTURE_YESTERDAY,
      seed: 77,
      status: 'abandoned',
      finishedAt: 1_700_000_900_000,
    });
    jest.spyOn(dailyStorage, 'loadDailySnapshot').mockResolvedValue(stale);
    jest.spyOn(dailyStorage, 'saveDailySnapshot').mockResolvedValue(true);

    const result = await hydrateDailyGame();

    expect(result.dateKey).toBe(FIXTURE_TODAY);
    expect(result.status).toBe('playing');
    expect(result.seed).not.toBe(77);
  });

  it('keeps stale abandoned when suppressMint is true (D-06)', async () => {
    const stale = makeBinaryPlayingSnapshot({
      dateKey: FIXTURE_YESTERDAY,
      seed: 77,
      status: 'abandoned',
      finishedAt: 1_700_000_900_000,
    });
    jest.spyOn(dailyStorage, 'loadDailySnapshot').mockResolvedValue(stale);
    jest.spyOn(dailyStorage, 'saveDailySnapshot').mockResolvedValue(true);
    jest
      .spyOn(snapshotPrep, 'prepareTodaySnapshot')
      .mockImplementation((s) => s);

    const result = await hydrateDailyGame({ suppressMint: true });

    expect(result.dateKey).toBe(FIXTURE_YESTERDAY);
    expect(result.status).toBe('abandoned');
    expect(result.seed).toBe(77);
  });

  it('mints only calendar today after multi-day gap (D-05)', async () => {
    const multiDayStale = makeBinaryPlayingSnapshot({
      dateKey: '2026-05-10',
      seed: 11,
      status: 'completed',
      finishedAt: 1_700_000_100_000,
    });
    jest.spyOn(dailyStorage, 'loadDailySnapshot').mockResolvedValue(multiDayStale);
    jest.spyOn(dailyStorage, 'saveDailySnapshot').mockResolvedValue(true);

    const result = await hydrateDailyGame({ today: FIXTURE_TODAY });

    expect(result.dateKey).toBe(FIXTURE_TODAY);
    expect(result.status).toBe('playing');
    expect(result.seed).not.toBe(11);
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
