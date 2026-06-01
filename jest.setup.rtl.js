jest.mock('./lib/date/localDay', () => ({
  getLocalDateKey: jest.fn(() => '2026-05-19'),
}));

jest.mock('expo-router', () => {
  const { createExpoRouterMock } = require('./__tests__/helpers/expoRouterMocks');
  return createExpoRouterMock();
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children ?? null,
    SafeAreaView: View,
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

jest.mock('./lib/platform/runAfterInteractions', () => ({
  runAfterInteractions: (fn) => Promise.resolve().then(() => fn()),
}));

jest.setTimeout(30_000);
