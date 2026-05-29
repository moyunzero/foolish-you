import { fireEvent, screen } from '@testing-library/react-native';

import SudokuNumpad from '../../../components/grid/SudokuNumpad';
import { renderWithI18n } from '../../helpers/renderWithI18n';

describe('SudokuNumpad', () => {
  it('calls onDigit and onClear', () => {
    const onDigit = jest.fn();
    const onClear = jest.fn();

    renderWithI18n(
      <SudokuNumpad
        onDigit={onDigit}
        onClear={onClear}
        disabled={false}
        dimmedDigits={new Set([5])}
      />,
    );

    fireEvent.press(screen.getByLabelText('填入 3'));
    fireEvent.press(screen.getByLabelText('清除当前格'));
    expect(onDigit).toHaveBeenCalledWith(3);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('does not call handlers when disabled', () => {
    const onDigit = jest.fn();
    renderWithI18n(
      <SudokuNumpad
        onDigit={onDigit}
        onClear={jest.fn()}
        disabled
      />,
    );

    fireEvent.press(screen.getByLabelText('填入 1'));
    expect(onDigit).not.toHaveBeenCalled();
  });
});
