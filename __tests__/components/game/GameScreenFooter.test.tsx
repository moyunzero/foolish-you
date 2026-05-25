import { fireEvent, render, screen } from '@testing-library/react-native';

import GameScreenFooter from '../../../components/game/GameScreenFooter';

describe('GameScreenFooter', () => {
  it('disables complete button when board is not ready', () => {
    const onComplete = jest.fn();
    render(
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
    render(
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
});
