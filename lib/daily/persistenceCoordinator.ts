/** Serializes hydrate, flush, and status persistence to avoid overlapping writes. */
export function createPersistenceCoordinator() {
  let tail: Promise<unknown> = Promise.resolve();

  function enqueue<T>(task: () => Promise<T>): Promise<T> {
    const run = tail.then(task, task);
    tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  return { enqueue };
}
