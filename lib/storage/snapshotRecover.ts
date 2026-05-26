import type { DailySnapshot } from '../puzzles/types';
import type { RecoveryLogKind } from './recoveryLog';
import { repairSnapshotPuzzle } from './snapshotPrep';
import {
  isCompletedPlayStateSatisfied,
  isSnapshotPuzzleConsistent,
} from './snapshotValidate';

export type SnapshotDamageKind =
  | 'none'
  | 'puzzle_inconsistent'
  | 'play_state_contradiction';

export type RecoverSnapshotResult = {
  snapshot: DailySnapshot;
  damage: SnapshotDamageKind;
  logKind?: RecoveryLogKind;
  detail?: string;
};

/**
 * Repair recoverable snapshot damage while preserving status, streak-related fields, and timing.
 */
export function recoverSnapshot(snapshot: DailySnapshot): RecoverSnapshotResult {
  let current = snapshot;

  if (!isSnapshotPuzzleConsistent(current)) {
    const repaired = repairSnapshotPuzzle(current);
    return {
      snapshot: repaired,
      damage: 'puzzle_inconsistent',
      logKind: 'puzzle_repaired',
      detail: 'puzzle inconsistent; regenerated from seed',
    };
  }

  if (!isCompletedPlayStateSatisfied(current)) {
    const { playState: _omit, ...rest } = current;
    return {
      snapshot: rest,
      damage: 'play_state_contradiction',
      logKind: 'play_state_contradiction',
      detail: 'status completed but board incomplete; playState dropped',
    };
  }

  return { snapshot: current, damage: 'none' };
}
