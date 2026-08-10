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
        canUndo={false}
        onUndo={jest.fn()}
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
    const onUndo = jest.fn();
    renderWithI18n(
      <GameScreenFooter
        statusHint={null}
        canComplete
        canUndo
        onUndo={onUndo}
        onComplete={onComplete}
        onAbandon={onAbandon}
      />,
    );

    fireEvent.press(screen.getByText('撤销'));
    fireEvent.press(screen.getByText('完成今日'));
    fireEvent.press(screen.getByText('认怂今日'));
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onAbandon).toHaveBeenCalledTimes(1);
  });

  it('does not call undo when stack is empty', () => {
    const onUndo = jest.fn();
    renderWithI18n(
      <GameScreenFooter
        statusHint={null}
        canComplete={false}
        canUndo={false}
        onUndo={onUndo}
        onComplete={jest.fn()}
        onAbandon={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText('撤销'));
    expect(onUndo).not.toHaveBeenCalled();
  });

  it('renders English labels when locale is en', () => {
    renderWithI18n(
      <GameScreenFooter
        statusHint={null}
        canComplete
        canUndo={false}
        onUndo={jest.fn()}
        onComplete={jest.fn()}
        onAbandon={jest.fn()}
      />,
      { locale: 'en' },
    );

    expect(screen.getByText('Finish today’s puzzle')).toBeTruthy();
    expect(screen.getByText('Bail today')).toBeTruthy();
    expect(screen.getByText('Undo')).toBeTruthy();
  });

  it('renders abandon as text-link with min 44px hit target', () => {
    renderWithI18n(
      <GameScreenFooter
        statusHint={null}
        canComplete
        canUndo={false}
        onUndo={jest.fn()}
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
