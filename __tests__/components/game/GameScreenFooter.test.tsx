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
    fireEvent.press(screen.getByText('放弃今日挑战'));
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
    expect(screen.getByText('Give up on today’s puzzle')).toBeTruthy();
  });
});
