import { render, screen } from '@testing-library/react-native';

import NonogramGrid from '../../../components/grid/NonogramGrid';
import { createEmptyGrid } from '../../../lib/puzzles/nonogram/grid';
import { NONOGRAM_COLS, NONOGRAM_ROWS } from '../../../lib/puzzles/nonogram/spec';

describe('NonogramGrid', () => {
  it('renders column clues top-to-bottom in clue order (first block at top)', () => {
    render(
      <NonogramGrid
        rows={NONOGRAM_ROWS}
        cols={NONOGRAM_COLS}
        rowClues={Array.from({ length: NONOGRAM_ROWS }, () => [0])}
        colClues={[
          [1, 1],
          [2, 3],
          [8],
          [2, 3],
          [1, 1],
          [0],
          [0],
          [0],
        ]}
        playState={createEmptyGrid()}
        selected={null}
        maxWidth={360}
        onPressCell={jest.fn()}
        onLongPressCell={jest.fn()}
      />,
    );

    expect(screen.getByTestId('col-clue-1-0')).toHaveTextContent('2');
    expect(screen.getByTestId('col-clue-1-1')).toHaveTextContent('3');
  });
});
