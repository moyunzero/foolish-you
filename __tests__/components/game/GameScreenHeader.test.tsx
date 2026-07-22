import { screen } from '@testing-library/react-native';

import GameScreenHeader from '../../../components/game/GameScreenHeader';
import { renderWithI18n } from '../../helpers/renderWithI18n';

describe('GameScreenHeader', () => {
  it('renders single-line meta with date · streak', () => {
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

    expect(
      screen.getByText(/今日 · 2026-05-25 · 连续 2 天 · 今天没傻过/),
    ).toBeTruthy();
    expect(screen.getByText('数独')).toBeTruthy();
    expect(screen.getByLabelText('查看数独规则')).toBeTruthy();
  });

  it('uses 24pt title typography contract', () => {
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

    const title = screen.getByText('二进制');
    expect(title).toHaveStyle({ fontSize: 24, lineHeight: 29, fontWeight: '700' });
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

  it('renders streak subline below title with meta typography', () => {
    renderWithI18n(
      <GameScreenHeader
        dateKey="2026-05-25"
        streakLine="连续 4 天 · 今日卷面待交"
        streakHighlight={false}
        elapsed="01:23"
        typeLabel="数绘"
        gameType="nonogram"
        showRules
        streakSubline="护盾生效：昨天缺席，连签还在，别得瑟。"
      />,
    );

    expect(screen.getByText('护盾生效：昨天缺席，连签还在，别得瑟。')).toBeTruthy();
  });

  it('shows host intro with testID when showHostIntro', () => {
    renderWithI18n(
      <GameScreenHeader
        dateKey="2026-05-25"
        streakLine="连续 1 天 · 今天没傻过"
        streakHighlight={false}
        elapsed="00:10"
        typeLabel="数独"
        gameType="sudoku"
        showRules
        hostIntroLine="今天这局，脑壳先热热身。"
        showHostIntro
      />,
    );

    expect(screen.getByTestId('game-host-intro')).toBeTruthy();
    expect(screen.getByText('今天这局，脑壳先热热身。')).toBeTruthy();
  });

  it('hides host intro when showHostIntro is false', () => {
    renderWithI18n(
      <GameScreenHeader
        dateKey="2026-05-25"
        streakLine="连续 1 天 · 今天没傻过"
        streakHighlight={false}
        elapsed="00:10"
        typeLabel="数独"
        gameType="sudoku"
        showRules
        hostIntroLine="今天这局，脑壳先热热身。"
        showHostIntro={false}
      />,
    );

    expect(screen.queryByTestId('game-host-intro')).toBeNull();
  });
});
