import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, waitFor } from '@testing-library/react-native';

import GameScreen from '../../app/game';
import { saveDailySnapshot } from '../../lib/storage/dailyStorage';
import { saveStreakState } from '../../lib/storage/streakStorage';
import {
  FIXTURE_TODAY,
  makeBinaryPlayingSnapshot,
} from '../helpers/dailyGameFixtures';
import { ScreenProviders } from '../helpers/screenTestUtils';

function renderGame(locale: 'zh' | 'en' = 'zh') {
  return render(
    <ScreenProviders locale={locale}>
      <GameScreen />
    </ScreenProviders>,
  );
}

describe('GameScreen missed-yesterday banner', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('shows recall line when yesterday had no real completion', async () => {
    await saveStreakState({
      currentStreak: 4,
      lastCheckInDateKey: '2026-05-17',
      historicalMax: 4,
      freezeCount: 0,
      lastFreezeGrantWeekKey: '2026-W21',
      freezeConsumedSessionKey: null,
    });
    await saveDailySnapshot(makeBinaryPlayingSnapshot());

    renderGame();

    await waitFor(
      () => {
        expect(screen.getByText(/昨天鸽了|缺席一天|断签边缘/)).toBeTruthy();
      },
      { timeout: 15_000 },
    );
  });

  it('shows freeze consumed line when freeze was consumed today', async () => {
    await saveStreakState({
      currentStreak: 4,
      lastCheckInDateKey: '2026-05-18',
      historicalMax: 4,
      freezeCount: 0,
      lastFreezeGrantWeekKey: '2026-W21',
      freezeConsumedSessionKey: FIXTURE_TODAY,
    });
    await saveDailySnapshot(makeBinaryPlayingSnapshot());

    renderGame();

    await waitFor(() => {
      expect(
        screen.getByText(/护盾生效|冻住一天|系统替你圆场/),
      ).toBeTruthy();
    });
  });

  it('shows English recall line when yesterday had no real completion', async () => {
    await saveStreakState({
      currentStreak: 4,
      lastCheckInDateKey: '2026-05-17',
      historicalMax: 4,
      freezeCount: 0,
      lastFreezeGrantWeekKey: '2026-W21',
      freezeConsumedSessionKey: null,
    });
    await saveDailySnapshot(makeBinaryPlayingSnapshot());

    renderGame('en');

    await waitFor(
      () => {
        const line = screen.getByText(
          /You skipped yesterday|One day off|Edge of a break/,
        );
        expect(line).toBeTruthy();
        expect(String(line.props.children)).not.toMatch(/[\u4e00-\u9fff]/);
      },
      { timeout: 15_000 },
    );
  });

  it('shows English freeze consumed line when freeze was consumed today', async () => {
    await saveStreakState({
      currentStreak: 4,
      lastCheckInDateKey: '2026-05-18',
      historicalMax: 4,
      freezeCount: 0,
      lastFreezeGrantWeekKey: '2026-W21',
      freezeConsumedSessionKey: FIXTURE_TODAY,
    });
    await saveDailySnapshot(makeBinaryPlayingSnapshot());

    renderGame('en');

    await waitFor(() => {
      const line = screen.getByText(
        /Shield used|One day frozen|System covered/,
      );
      expect(line).toBeTruthy();
      expect(String(line.props.children)).not.toMatch(/[\u4e00-\u9fff]/);
    });
  });
});
