import {
  findNearestSlitherlinkEdge,
  SLITHERLINK_EDGE_HIT_RADIUS,
} from '../../../../lib/puzzles/slitherlink/hitTest';

const INSET = 20;
const STEP = 40;

describe('findNearestSlitherlinkEdge', () => {
  it('prefers horizontal edge when tap is on a horizontal segment', () => {
    const y = INSET;
    const midX = INSET + STEP / 2;
    const hit = findNearestSlitherlinkEdge(
      midX,
      y,
      INSET,
      STEP,
      SLITHERLINK_EDGE_HIT_RADIUS,
    );
    expect(hit).toEqual({ orientation: 'h', row: 0, col: 0 });
  });

  it('prefers vertical edge when tap is on a vertical segment', () => {
    const x = INSET;
    const midY = INSET + STEP / 2;
    const hit = findNearestSlitherlinkEdge(
      x,
      midY,
      INSET,
      STEP,
      SLITHERLINK_EDGE_HIT_RADIUS,
    );
    expect(hit).toEqual({ orientation: 'v', row: 0, col: 0 });
  });

  it('picks closer orientation at a grid intersection', () => {
    const cornerX = INSET;
    const cornerY = INSET;
    const hitH = findNearestSlitherlinkEdge(
      cornerX + 8,
      cornerY,
      INSET,
      STEP,
      SLITHERLINK_EDGE_HIT_RADIUS,
    );
    expect(hitH?.orientation).toBe('h');

    const hitV = findNearestSlitherlinkEdge(
      cornerX,
      cornerY + 8,
      INSET,
      STEP,
      SLITHERLINK_EDGE_HIT_RADIUS,
    );
    expect(hitV?.orientation).toBe('v');
  });

  it('returns null when tap is far from any edge', () => {
    const hit = findNearestSlitherlinkEdge(
      INSET + STEP / 2,
      INSET + STEP / 2,
      INSET,
      STEP,
      SLITHERLINK_EDGE_HIT_RADIUS,
    );
    expect(hit).toBeNull();
  });
});
