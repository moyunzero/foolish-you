import { Text } from 'react-native';

import { renderWithI18n } from '../../helpers/renderWithI18n';
import { useI18n } from '../../../lib/i18n';

function Probe() {
  const { strings, appDisplayName } = useI18n();
  return (
    <>
      <Text testID="app-name">{strings.app.name}</Text>
      <Text testID="display-name">{appDisplayName}</Text>
    </>
  );
}

describe('I18nTestProvider via renderWithI18n', () => {
  it('provides zh strings by default', () => {
    const screen = renderWithI18n(<Probe />);
    expect(screen.getByTestId('app-name').props.children).toBe('傻了么');
    expect(screen.getByTestId('display-name').props.children).toBe('傻了么');
  });

  it('provides en strings when locale is en', () => {
    const screen = renderWithI18n(<Probe />, { locale: 'en' });
    expect(screen.getByTestId('app-name').props.children).toBe('Brainfool');
    expect(screen.getByTestId('display-name').props.children).toBe('Brainfool');
  });
});
