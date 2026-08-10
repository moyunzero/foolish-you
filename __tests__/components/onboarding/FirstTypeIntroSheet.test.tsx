import { fireEvent, screen } from '@testing-library/react-native';

import FirstTypeIntroSheet from '../../../components/onboarding/FirstTypeIntroSheet';
import { renderWithI18n } from '../../helpers/renderWithI18n';

describe('FirstTypeIntroSheet', () => {
  it('Skip marks dismiss path (caller persists seen)', () => {
    const onDismiss = jest.fn();
    renderWithI18n(
      <FirstTypeIntroSheet
        visible
        gameType="sudoku"
        onDismiss={onDismiss}
      />,
    );

    fireEvent.press(screen.getByLabelText('跳过题型介绍，进入棋盘'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders English skip label', () => {
    renderWithI18n(
      <FirstTypeIntroSheet
        visible
        gameType="binary"
        onDismiss={jest.fn()}
      />,
      { locale: 'en' },
    );

    expect(screen.getByText('Skip — play now')).toBeTruthy();
  });
});
