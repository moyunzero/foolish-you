import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, waitFor } from '@testing-library/react-native';

import ResultScreen from '../../app/result';
import { buildMonthGrid } from '../../lib/calendar/buildMonthGrid';
import { DEFAULT_RATING_STATE } from '../../lib/rating/types';
import { DEFAULT_REMINDER_STATE } from '../../lib/reminder/types';
import { saveDailySnapshot } from '../../lib/storage/dailyStorage';
import { saveRatingState } from '../../lib/storage/ratingStorage';
import { saveReminderState } from '../../lib/storage/reminderStorage';
import {
  FIXTURE_TODAY,
  makeBinaryPlayingSnapshot,
  makeSudokuCompletedSnapshot,
} from '../helpers/dailyGameFixtures';
import { ScreenProviders } from '../helpers/screenTestUtils';

describe('v21 habit depth integration', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe('result reminder soft ask', () => {
    it('shows soft ask on first completed outcome', async () => {
      await saveDailySnapshot(makeSudokuCompletedSnapshot());
      await saveRatingState({ ...DEFAULT_RATING_STATE, completedCount: 1 });
      await saveReminderState({
        ...DEFAULT_REMINDER_STATE,
        softAskDismissed: false,
      });

      render(
        <ScreenProviders>
          <ResultScreen />
        </ScreenProviders>,
      );

      await waitFor(() => {
        expect(screen.getByText('明天叫我')).toBeTruthy();
      });
    });

    it('hides soft ask on abandoned outcome', async () => {
      await saveDailySnapshot(
        makeBinaryPlayingSnapshot({
          status: 'abandoned',
          finishedAt: 1_700_000_900_000,
        }),
      );
      await saveRatingState({ ...DEFAULT_RATING_STATE, completedCount: 1 });
      await saveReminderState({
        ...DEFAULT_REMINDER_STATE,
        softAskDismissed: false,
      });

      render(
        <ScreenProviders>
          <ResultScreen />
        </ScreenProviders>,
      );

      await waitFor(() => {
        expect(screen.getByText(/今日战绩 · 认怂/)).toBeTruthy();
      });
      expect(screen.queryByText('明天叫我')).toBeNull();
    });
  });

  describe('calendar month grid', () => {
    it('renders shield and abandoned states in the same month view', () => {
      const todayKey = FIXTURE_TODAY;
      const monthKey = todayKey.slice(0, 7);
      const cells = buildMonthGrid({
        monthKey,
        todayKey,
        entriesByDate: new Map([
          [
            '2026-05-18',
            { dateKey: '2026-05-18', elapsedMs: 1000, outcome: 'abandoned' },
          ],
        ]),
        freezeDates: new Set(['2026-05-15']),
        todaySnapshotStatus: 'completed',
      });

      const inMonth = cells.filter((c) => c.isInMonth);
      const shield = inMonth.find((c) => c.dateKey === '2026-05-15');
      const abandoned = inMonth.find((c) => c.dateKey === '2026-05-18');

      expect(shield?.state).toBe('shield');
      expect(abandoned?.state).toBe('abandoned');
    });
  });
});
