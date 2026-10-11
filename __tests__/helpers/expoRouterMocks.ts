export const mockRouterReplace = jest.fn();
export const mockRouterPush = jest.fn();
export const mockRouterBack = jest.fn();

/** Controllable pathname for `usePathname` (default home). */
export let mockPathname = '/';

export function setMockPathname(pathname: string): void {
  mockPathname = pathname;
}

export function resetRouterMocks(): void {
  mockRouterReplace.mockReset();
  mockRouterPush.mockReset();
  mockRouterBack.mockReset();
  mockPathname = '/';
}

export function createExpoRouterMock(): Record<string, unknown> {
  const React = require('react') as typeof import('react');
  const { Text } = require('react-native') as typeof import('react-native');

  return {
    useRouter: () => ({
      replace: mockRouterReplace,
      push: mockRouterPush,
      back: mockRouterBack,
    }),
    usePathname: () => mockPathname,
    Redirect: ({ href }: { href: string }) =>
      React.createElement(Text, { testID: `redirect:${href}` }, `Redirect:${href}`),
    Stack: ({ children }: { children?: React.ReactNode }) => children ?? null,
    Link: ({ children }: { children?: React.ReactNode }) => children ?? null,
  };
}
