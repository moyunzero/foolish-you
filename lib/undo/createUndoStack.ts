/**
 * Ephemeral in-memory undo ring (D-01, D-02).
 * Memory-only — never written to daily snapshot storage.
 *
 * D-04 push contract (locked for plan 02 drag-fill):
 * - Tap / cycle / clear / edge toggle: one `push(prevClone)` per successful mutate
 * - Drag-fill stroke: one `push` at stroke `onEnd` (not per cell)
 */

export const DEFAULT_UNDO_CAPACITY = 50;

export type UndoStack<T> = {
  push: (snapshot: T) => void;
  pop: () => T | undefined;
  canUndo: () => boolean;
  clear: () => void;
};

export function createUndoStack<T>(
  capacity: number = DEFAULT_UNDO_CAPACITY,
): UndoStack<T> {
  const floored = Math.floor(capacity);
  const max = Number.isFinite(floored)
    ? Math.max(1, floored)
    : DEFAULT_UNDO_CAPACITY;
  let items: T[] = [];

  return {
    push(snapshot: T) {
      items = [...items, snapshot].slice(-max);
    },
    pop() {
      if (items.length === 0) return undefined;
      const next = items.slice(0, -1);
      const last = items[items.length - 1];
      items = next;
      return last;
    },
    canUndo() {
      return items.length > 0;
    },
    clear() {
      items = [];
    },
  };
}
