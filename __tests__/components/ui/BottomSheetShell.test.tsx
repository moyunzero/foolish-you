import { screen } from '@testing-library/react-native';

import BottomSheetShell from '../../../components/ui/BottomSheetShell';
import { renderWithI18n } from '../../helpers/renderWithI18n';

describe('BottomSheetShell', () => {
  it('does not mount Modal host when hidden (avoids iOS multi-Modal present race)', () => {
    renderWithI18n(
      <BottomSheetShell
        visible={false}
        onClose={jest.fn()}
        dismissA11y="dismiss"
      >
        <></>
      </BottomSheetShell>,
    );

    expect(screen.queryByTestId('bottom-sheet-panel')).toBeNull();
  });

  it('mounts panel when visible', () => {
    renderWithI18n(
      <BottomSheetShell visible onClose={jest.fn()} dismissA11y="dismiss">
        <></>
      </BottomSheetShell>,
    );

    expect(screen.getByTestId('bottom-sheet-panel')).toBeTruthy();
  });
});
