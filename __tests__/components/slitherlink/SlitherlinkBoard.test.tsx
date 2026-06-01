import { fireEvent, screen } from '@testing-library/react-native';

import SlitherlinkBoard, {
  SLITHERLINK_BOARD_INSET,
} from '../../../components/slitherlink/SlitherlinkBoard';
import { createEmptyPlayState } from '../../../lib/puzzles/slitherlink/edges';
import { generateSlitherlinkPuzzle } from '../../../lib/puzzles/slitherlink/generator';
import { EDGE_LINE, SLITHERLINK_SIZE } from '../../../lib/puzzles/slitherlink/spec';
import { renderWithI18n } from '../../helpers/renderWithI18n';

function emptyConflicts() {
  return {
    h: Array.from({ length: SLITHERLINK_SIZE + 1 }, () =>
      Array<boolean>(SLITHERLINK_SIZE).fill(false),
    ),
    v: Array.from({ length: SLITHERLINK_SIZE }, () =>
      Array<boolean>(SLITHERLINK_SIZE + 1).fill(false),
    ),
  };
}

describe('SlitherlinkBoard', () => {
  it('renders clue digits from puzzle', () => {
    const puzzle = generateSlitherlinkPuzzle(111);
    const clueValues = new Set(
      puzzle.clues.flat().filter((cell): cell is number => cell != null),
    );
    expect(clueValues.size).toBeGreaterThan(0);

    renderWithI18n(
      <SlitherlinkBoard
        puzzle={puzzle}
        playState={createEmptyPlayState()}
        conflicts={emptyConflicts()}
        selectedEdge={null}
        onPressEdge={jest.fn()}
        onLongPressEdge={jest.fn()}
        maxWidth={320}
      />,
    );

    for (const clue of clueValues) {
      expect(
        screen.getAllByText(String(clue), { includeHiddenElements: true })
          .length,
      ).toBeGreaterThan(0);
    }
  });

  it('fires onPressEdge for horizontal tap via hit-test layer', () => {
    const puzzle = generateSlitherlinkPuzzle(222);
    const onPressEdge = jest.fn();
    const maxWidth = 320;
    const cellStep = Math.max(32, Math.floor((maxWidth - SLITHERLINK_BOARD_INSET * 2) / SLITHERLINK_SIZE));

    renderWithI18n(
      <SlitherlinkBoard
        puzzle={puzzle}
        playState={createEmptyPlayState()}
        conflicts={emptyConflicts()}
        selectedEdge={null}
        onPressEdge={onPressEdge}
        onLongPressEdge={jest.fn()}
        maxWidth={maxWidth}
      />,
    );

    fireEvent.press(screen.getByTestId('slitherlink-board-touch'), {
      nativeEvent: {
        locationX: SLITHERLINK_BOARD_INSET + cellStep / 2,
        locationY: SLITHERLINK_BOARD_INSET,
      },
    });
    expect(onPressEdge).toHaveBeenCalledWith('h', 0, 0);
  });

  it('fires onPressEdge for vertical tap via hit-test layer', () => {
    const puzzle = generateSlitherlinkPuzzle(223);
    const onPressEdge = jest.fn();
    const maxWidth = 320;
    const cellStep = Math.max(32, Math.floor((maxWidth - SLITHERLINK_BOARD_INSET * 2) / SLITHERLINK_SIZE));

    renderWithI18n(
      <SlitherlinkBoard
        puzzle={puzzle}
        playState={createEmptyPlayState()}
        conflicts={emptyConflicts()}
        selectedEdge={null}
        onPressEdge={onPressEdge}
        onLongPressEdge={jest.fn()}
        maxWidth={maxWidth}
      />,
    );

    fireEvent.press(screen.getByTestId('slitherlink-board-touch'), {
      nativeEvent: {
        locationX: SLITHERLINK_BOARD_INSET,
        locationY: SLITHERLINK_BOARD_INSET + cellStep / 2,
      },
    });
    expect(onPressEdge).toHaveBeenCalledWith('v', 0, 0);
  });
});
