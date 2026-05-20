jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
}));

import { Alert } from 'react-native';

import {
  notifyDailySaveFailed,
  SAVE_ERROR_MESSAGE,
} from '../../../lib/daily/saveFailureAlert';

describe('saveFailureAlert', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows retry button when onRetry is provided', () => {
    const onRetry = jest.fn();
    notifyDailySaveFailed(onRetry);

    expect(Alert.alert).toHaveBeenCalledWith(
      '保存失败',
      SAVE_ERROR_MESSAGE,
      expect.arrayContaining([
        expect.objectContaining({ text: '稍后' }),
        expect.objectContaining({ text: '重试保存', onPress: onRetry }),
      ]),
    );
  });

  it('shows dismiss-only button without onRetry', () => {
    notifyDailySaveFailed();

    expect(Alert.alert).toHaveBeenCalledWith(
      '保存失败',
      SAVE_ERROR_MESSAGE,
      expect.arrayContaining([
        expect.objectContaining({ text: '知道了' }),
      ]),
    );
  });
});
