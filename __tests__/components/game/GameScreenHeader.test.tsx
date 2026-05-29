import { screen } from '@testing-library/react-native';

import GameScreenHeader from '../../../components/game/GameScreenHeader';
import { renderWithI18n } from '../../helpers/renderWithI18n';

describe('GameScreenHeader', () => {
  it('highlights streak line when checked in today', () => {
    renderWithI18n(
      <GameScreenHeader
        dateKey="2026-05-25"
        streakLine="连续 2 天 · 今天没傻过"
        streakHighlight
        elapsed="01:23"
        typeLabel="数独"
        gameType="sudoku"
        showRules
      />,
    );

    expect(screen.getByText('连续 2 天 · 今天没傻过')).toBeTruthy();
    expect(screen.getByText('数独')).toBeTruthy();
    expect(screen.getByLabelText('查看数独规则')).toBeTruthy();
  });

  it('hides rules button when showRules is false', () => {
    renderWithI18n(
      <GameScreenHeader
        dateKey="2026-05-25"
        streakLine="连签战绩 · 完成今日入账"
        streakHighlight={false}
        elapsed="00:05"
        typeLabel="二进制"
        gameType="binary"
        showRules={false}
      />,
    );

    expect(screen.queryByLabelText('查看二进制谜题规则')).toBeNull();
  });
});
