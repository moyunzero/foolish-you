import { fireEvent, screen } from '@testing-library/react-native';

import GameScreenFooter from '../../../components/game/GameScreenFooter';
import { renderWithI18n } from '../../helpers/renderWithI18n';

describe('GameScreenFooter', () => {
  it('disables complete button when board is not ready', () => {
    const onComplete = jest.fn();
    renderWithI18n(
      <GameScreenFooter
        statusHint="还有冲突"
        canComplete={false}
        onComplete={onComplete}
        onAbandon={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText('完成今日'));
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('calls handlers when complete is enabled', () => {
    const onComplete = jest.fn();
    const onAbandon = jest.fn();
    renderWithI18n(
      <GameScreenFooter
        statusHint={null}
        canComplete
        onComplete={onComplete}
        onAbandon={onAbandon}
      />,
    );

    fireEvent.press(screen.getByText('完成今日'));
    fireEvent.press(screen.getByText('认怂今日'));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onAbandon).toHaveBeenCalledTimes(1);
  });

  it('renders English labels when locale is en', () => {
    renderWithI18n(
      <GameScreenFooter
        statusHint={null}
        canComplete
        onComplete={jest.fn()}
        onAbandon={jest.fn()}
      />,
      { locale: 'en' },
    );

    expect(screen.getByText('Finish today’s puzzle')).toBeTruthy();
    expect(screen.getByText('Bail today')).toBeTruthy();
  });

  it('renders abandon as text-link with min 44px hit target', () => {
    renderWithI18n(
      <GameScreenFooter
        statusHint={null}
        canComplete
        onComplete={jest.fn()}
        onAbandon={jest.fn()}
      />,
    );

    const abandon = screen.getByText('认怂今日');
    expect(abandon).toHaveStyle({
      fontSize: 16,
      lineHeight: 24,
    });
    expect(screen.getByLabelText('认怂今日')).toBeTruthy();
  });
});
