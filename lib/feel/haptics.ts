import * as Haptics from 'expo-haptics';

/**
 * Single feel entry for FEEL-06 (D-19..D-21).
 * Quiet no-op if the native module / device rejects feedback.
 */

async function safe(run: () => Promise<void>): Promise<void> {
  try {
    await run();
  } catch {
    // Simulator / unsupported device — ignore
  }
}

/** Fill / toggle / edge — light impact. */
export function feelLight(): void {
  void safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

/** Rule conflict — replaces react-native Vibration conflict buzz. */
export function feelConflict(): void {
  void safe(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  );
}

/** Undo pop applied. */
export function feelUndo(): void {
  void safe(() => Haptics.selectionAsync());
}

/** Abandon confirm secondary action. */
export function feelConfirm(): void {
  void safe(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  );
}

/**
 * Drag-fill coalesce helper for plan 02 (D-21).
 * Fires once at stroke start — never per cell. `onStrokeCell` is intentionally a no-op.
 */
export function createDragHapticCoalesce(): {
  onStrokeStart: () => void;
  onStrokeCell: () => void;
  onStrokeEnd: () => void;
} {
  let firedThisStroke = false;
  return {
    onStrokeStart() {
      if (firedThisStroke) return;
      firedThisStroke = true;
      feelLight();
    },
    onStrokeCell() {
      // never per cell
    },
    onStrokeEnd() {
      firedThisStroke = false;
    },
  };
}
