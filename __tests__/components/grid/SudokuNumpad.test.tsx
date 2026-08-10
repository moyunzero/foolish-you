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
        notesMode={false}
        onToggleNotesMode={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByLabelText('填入 3'));
    fireEvent.press(screen.getByLabelText('清除当前格'));
    expect(onDigit).toHaveBeenCalledWith(3);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('does not call digit handlers when disabled; notes toggle stays available', () => {
    const onDigit = jest.fn();
    const onToggleNotesMode = jest.fn();
    renderWithI18n(
      <SudokuNumpad
        onDigit={onDigit}
        onClear={jest.fn()}
        disabled
        notesMode={false}
        onToggleNotesMode={onToggleNotesMode}
      />,
    );

    fireEvent.press(screen.getByLabelText('填入 1'));
    expect(onDigit).not.toHaveBeenCalled();

    fireEvent.press(
      screen.getByLabelText('切换笔记模式；开启时数字键填写候选笔记'),
    );
    expect(onToggleNotesMode).toHaveBeenCalledTimes(1);
  });

  it('notes mode toggle exposes a11y selected state', () => {
    const onToggleNotesMode = jest.fn();
    renderWithI18n(
      <SudokuNumpad
        onDigit={jest.fn()}
        onClear={jest.fn()}
        disabled={false}
        notesMode
        onToggleNotesMode={onToggleNotesMode}
      />,
    );

    const toggle = screen.getByLabelText(
      '切换笔记模式；开启时数字键填写候选笔记',
    );
    expect(toggle.props.accessibilityState).toMatchObject({ selected: true });
    fireEvent.press(toggle);
    expect(onToggleNotesMode).toHaveBeenCalledTimes(1);
  });

  it('digitsOnly omits clear and notes tools', () => {
    renderWithI18n(
      <SudokuNumpad
        digitsOnly
        onDigit={jest.fn()}
        onClear={jest.fn()}
        disabled={false}
        notesMode={false}
        onToggleNotesMode={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('填入 9')).toBeTruthy();
    expect(screen.queryByLabelText('清除当前格')).toBeNull();
    expect(
      screen.queryByLabelText(
        '切换笔记模式；开启时数字键填写候选笔记',
      ),
    ).toBeNull();
  });

  it('toolsOnly renders clear and notes without digits', () => {
    renderWithI18n(
      <SudokuNumpad
        toolsOnly
        onDigit={jest.fn()}
        onClear={jest.fn()}
        disabled={false}
        notesMode={false}
        onToggleNotesMode={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('清除当前格')).toBeTruthy();
    expect(
      screen.getByLabelText(
        '切换笔记模式；开启时数字键填写候选笔记',
      ),
    ).toBeTruthy();
    expect(screen.queryByLabelText('填入 1')).toBeNull();
  });
});
