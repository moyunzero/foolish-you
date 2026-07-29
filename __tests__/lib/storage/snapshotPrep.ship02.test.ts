import * as fs from 'node:fs';
import * as path from 'node:path';

import { selectDailyGame } from '../../../lib/puzzles/dailySelector';
import type { DailySnapshot, GameType } from '../../../lib/puzzles/types';
import { prepareTodaySnapshot } from '../../../lib/storage/snapshotPrep';
import { isSnapshotPuzzleConsistent } from '../../../lib/storage/snapshotValidate';

const FIXTURE_DIR = path.join(__dirname, 'fixtures');

const FIXTURES: { gameType: GameType; file: string }[] = [
  { gameType: 'sudoku', file: 'stale-playing-sudoku.json' },
  { gameType: 'binary', file: 'stale-playing-binary.json' },
  { gameType: 'slitherlink', file: 'stale-playing-slitherlink.json' },
  { gameType: 'nonogram', file: 'stale-playing-nonogram.json' },
];

function loadFixture(name: string): DailySnapshot {
  const raw = fs.readFileSync(path.join(FIXTURE_DIR, name), 'utf8');
  return JSON.parse(raw) as DailySnapshot;
}

function hasNonEmptyPlayProgress(snap: DailySnapshot): boolean {
  const play = snap.playState;
  if (play == null) return false;
  if (Array.isArray(play)) {
    return play.some((row) =>
      Array.isArray(row) && row.some((cell) => cell !== 0 && cell !== -1),
    );
  }
  if (typeof play === 'object' && 'h' in play && 'v' in play) {
    const edges = play as { h: number[][]; v: number[][] };
    return (
      edges.h.some((row) => row.some((cell) => cell !== 0)) ||
      edges.v.some((row) => row.some((cell) => cell !== 0))
    );
  }
  return false;
}

describe('SHIP-02 prepareTodaySnapshot keep contract', () => {
  it.each(FIXTURES)(
    'keeps playing $gameType when generator would emit a different puzzleHash',
    ({ gameType, file }) => {
      const snap = loadFixture(file);

      expect(snap.status).toBe('playing');
      expect(snap.gameType).toBe(gameType);
      expect(isSnapshotPuzzleConsistent(snap)).toBe(true);
      expect(hasNonEmptyPlayProgress(snap)).toBe(true);

      const canonical = selectDailyGame({
        dateKey: snap.dateKey,
        seed: snap.seed,
        forceGameType: gameType,
      });
      expect(canonical.puzzleHash).not.toBe(snap.puzzleHash);

      const beforeHash = snap.puzzleHash;
      const beforePlayState = structuredClone(snap.playState);
      const beforePuzzle = structuredClone(snap.puzzle);

      const next = prepareTodaySnapshot(snap);
      expect(next.puzzleHash).toBe(beforeHash);
      expect(next.playState).toEqual(beforePlayState);
      expect(next.puzzle).toEqual(beforePuzzle);
      expect(snap.puzzleHash).toBe(beforeHash);
      expect(snap.playState).toEqual(beforePlayState);
      expect(snap.puzzle).toEqual(beforePuzzle);
    },
  );
});
