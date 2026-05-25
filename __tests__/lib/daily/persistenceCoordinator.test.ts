import { createPersistenceCoordinator } from '../../../lib/daily/persistenceCoordinator';

describe('persistenceCoordinator', () => {
  it('runs tasks sequentially', async () => {
    const order: number[] = [];
    const coordinator = createPersistenceCoordinator();

    const first = coordinator.enqueue(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      order.push(1);
    });
    const second = coordinator.enqueue(async () => {
      order.push(2);
    });

    await Promise.all([first, second]);
    expect(order).toEqual([1, 2]);
  });
});
