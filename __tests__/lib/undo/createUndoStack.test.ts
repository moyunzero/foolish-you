import { createUndoStack } from '../../../lib/undo/createUndoStack';

describe('createUndoStack', () => {
  it('reports canUndo false when empty and pop returns undefined', () => {
    const stack = createUndoStack<number>();
    expect(stack.canUndo()).toBe(false);
    expect(stack.pop()).toBeUndefined();
    expect(stack.canUndo()).toBe(false);
  });

  it('push then pop restores LIFO and clears canUndo', () => {
    const stack = createUndoStack<string>();
    stack.push('a');
    stack.push('b');
    expect(stack.canUndo()).toBe(true);
    expect(stack.pop()).toBe('b');
    expect(stack.pop()).toBe('a');
    expect(stack.canUndo()).toBe(false);
    expect(stack.pop()).toBeUndefined();
  });

  it('drops oldest when push exceeds default capacity 50 (FIFO ring)', () => {
    const stack = createUndoStack<number>();
    for (let i = 0; i < 51; i += 1) {
      stack.push(i);
    }
    // Oldest (0) dropped; next pop is newest (50), then … down to 1
    expect(stack.pop()).toBe(50);
    const remaining: number[] = [];
    while (stack.canUndo()) {
      remaining.push(stack.pop()!);
    }
    expect(remaining[remaining.length - 1]).toBe(1);
    expect(remaining).not.toContain(0);
    expect(remaining).toHaveLength(49);
  });

  it('honors custom capacity', () => {
    const stack = createUndoStack<number>(2);
    stack.push(1);
    stack.push(2);
    stack.push(3);
    expect(stack.pop()).toBe(3);
    expect(stack.pop()).toBe(2);
    expect(stack.pop()).toBeUndefined();
  });

  it('normalizes non-finite capacity to the default bound', () => {
    const fromNaN = createUndoStack<number>(Number.NaN);
    for (let i = 0; i < 51; i += 1) {
      fromNaN.push(i);
    }
    expect(fromNaN.pop()).toBe(50);
    expect(fromNaN.pop()).toBe(49);

    const fromInf = createUndoStack<number>(Number.POSITIVE_INFINITY);
    fromInf.push(1);
    fromInf.push(2);
    expect(fromInf.pop()).toBe(2);
  });

  it('clear empties the stack', () => {
    const stack = createUndoStack<number>();
    stack.push(1);
    stack.push(2);
    stack.clear();
    expect(stack.canUndo()).toBe(false);
    expect(stack.pop()).toBeUndefined();
  });
});
