import * as Linking from 'expo-linking';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import PrivacyScreen from '../../app/privacy';
import { PRIVACY_POLICY_URL } from '../../constants/legal';
import { privacyPolicyMeta } from '../../lib/copy/privacyPolicy';
import {
  mockRouterBack,
  resetRouterMocks,
} from '../helpers/expoRouterMocks';
import { ScreenProviders } from '../helpers/screenTestUtils';

jest.mock('expo-linking', () => ({
  canOpenURL: jest.fn(),
  openURL: jest.fn(),
}));

const canOpenURLMock = jest.mocked(Linking.canOpenURL);
const openURLMock = jest.mocked(Linking.openURL);

function renderPrivacy() {
  return render(
    <ScreenProviders>
      <PrivacyScreen />
    </ScreenProviders>,
  );
}

describe('PrivacyScreen', () => {
  beforeEach(() => {
    resetRouterMocks();
    canOpenURLMock.mockReset();
    openURLMock.mockReset();
    canOpenURLMock.mockResolvedValue(true);
    openURLMock.mockResolvedValue(true);
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders in-app privacy policy content', () => {
    renderPrivacy();

    expect(screen.getByText(privacyPolicyMeta.title)).toBeTruthy();
    expect(screen.getByText(/傻了么 · mo yun/)).toBeTruthy();
    expect(screen.getByText('概述')).toBeTruthy();
  });

  it('shows public policy URL and action buttons', () => {
    renderPrivacy();

    expect(screen.getByText(PRIVACY_POLICY_URL)).toBeTruthy();
    expect(screen.getByText('在浏览器中打开公开版')).toBeTruthy();
    expect(screen.getByText('返回')).toBeTruthy();
  });

  it('calls router.back when 返回 is pressed', () => {
    renderPrivacy();

    fireEvent.press(screen.getByText('返回'));
    expect(mockRouterBack).toHaveBeenCalledTimes(1);
  });

  it('opens public policy URL from primary button', async () => {
    renderPrivacy();

    fireEvent.press(screen.getByText('在浏览器中打开公开版'));

    await waitFor(() => {
      expect(canOpenURLMock).toHaveBeenCalledWith(PRIVACY_POLICY_URL);
      expect(openURLMock).toHaveBeenCalledWith(PRIVACY_POLICY_URL);
    });
  });

  it('opens public policy URL when URL link is pressed', async () => {
    renderPrivacy();

    fireEvent.press(screen.getByLabelText('公开隐私政策网址'));

    await waitFor(() => {
      expect(openURLMock).toHaveBeenCalledWith(PRIVACY_POLICY_URL);
    });
  });

  it('alerts when public policy URL cannot be opened', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    canOpenURLMock.mockResolvedValue(false);

    renderPrivacy();
    fireEvent.press(screen.getByText('在浏览器中打开公开版'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        '无法打开链接',
        '请稍后重试，或在浏览器中访问公开隐私政策页面。',
      );
    });
    expect(openURLMock).not.toHaveBeenCalled();
  });
});
