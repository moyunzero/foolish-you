import { act, renderHook } from '@testing-library/react-native';
import React, { type ReactNode } from 'react';

import { useSlitherlinkBoard } from '../../hooks/useSlitherlinkBoard';
import { I18nTestProvider } from '../../lib/i18n/I18nContext';
import { createEmptyPlayState } from '../../lib/puzzles/slitherlink/edges';
import { generateSlitherlinkPuzzle } from '../../lib/puzzles/slitherlink/generator';
import { EDGE_LINE, EDGE_UNKNOWN } from '../../lib/puzzles/slitherlink/spec';

function i18nWrapper({ children }: { children: ReactNode }) {
  return <I18nTestProvider locale="zh">{children}</I18nTestProvider>;
}

describe('useSlitherlinkBoard', () => {
  it('sets first tap from 空 to 连线', () => {
    const puzzle = generateSlitherlinkPuzzle(707);
    const updatePlayState = jest.fn();
    const playState = createEmptyPlayState();

    const { result } = renderHook(() =>
      useSlitherlinkBoard({
        puzzle,
        playState,
        updatePlayState,
      }),
      { wrapper: i18nWrapper },
    );

    act(() => {
      result.current.handlePressEdge('h', 0, 0);
    });

    expect(updatePlayState).toHaveBeenCalled();
    expect(updatePlayState.mock.calls.at(-1)?.[0].h[0][0]).toBe(EDGE_LINE);
  });

  it('resets edge to unknown on long press', () => {
    const puzzle = generateSlitherlinkPuzzle(808);
    const updatePlayState = jest.fn();
    const playState = createEmptyPlayState();
    playState.h[1][1] = EDGE_LINE;

    const { result } = renderHook(() =>
      useSlitherlinkBoard({
        puzzle,
        playState,
        updatePlayState,
      }),
      { wrapper: i18nWrapper },
    );

    act(() => {
      result.current.handleLongPressEdge('h', 1, 1);
    });

    const next = updatePlayState.mock.calls.at(-1)?.[0];
    expect(next.h[1][1]).toBe(EDGE_UNKNOWN);
  });

  it('exposes tap hint on empty board', () => {
    const puzzle = generateSlitherlinkPuzzle(909);
    const { result } = renderHook(() =>
      useSlitherlinkBoard({
        puzzle,
        playState: createEmptyPlayState(),
        updatePlayState: jest.fn(),
      }),
      { wrapper: i18nWrapper },
    );

    expect(result.current.statusHint).toMatch(/未标 → 连线 → ×/);
    expect(result.current.canComplete).toBe(false);
  });
});
