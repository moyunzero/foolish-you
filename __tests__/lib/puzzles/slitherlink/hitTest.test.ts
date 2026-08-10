import {
  findNearestSlitherlinkEdge,
  SLITHERLINK_EDGE_HIT_RADIUS,
} from '../../../../lib/puzzles/slitherlink/hitTest';

const INSET = 20;
const STEP = 40;

describe('findNearestSlitherlinkEdge', () => {
  it('uses the tuned FEEL-04 radius constant', () => {
    // RESEARCH A2 / D-14: prototype 20; must stay < floor(STEP/2) so center stays null.
    expect(SLITHERLINK_EDGE_HIT_RADIUS).toBe(20);
    expect(SLITHERLINK_EDGE_HIT_RADIUS).toBeLessThan(Math.floor(STEP / 2));
  });

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

  it('registers mid-edge taps just inside the tuned radius', () => {
    // 19px off a horizontal mid-edge — needs radius > 19 (18 would miss).
    const midX = INSET + STEP / 2;
    const y = INSET + 19;
    const hit = findNearestSlitherlinkEdge(midX, y, INSET, STEP);
    expect(hit).toEqual({ orientation: 'h', row: 0, col: 0 });
  });

  it('picks closer orientation at a grid intersection (corner tradeoff)', () => {
    // D-14: larger radius widens the ambiguous corner band; nearest-distance still wins.
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

  it('returns null when tap is at cell center (half-step budget)', () => {
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
