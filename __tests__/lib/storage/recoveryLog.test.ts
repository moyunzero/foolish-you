import { clearRecoveryLog, appendRecoveryLog, loadRecoveryLog } from '../../../lib/storage/recoveryLog';

describe('recoveryLog', () => {
  beforeEach(async () => {
    await clearRecoveryLog();
  });

  it('appends and trims to max entries', async () => {
    for (let i = 0; i < 12; i += 1) {
      await appendRecoveryLog({
        kind: 'structural',
        detail: `entry-${i}`,
      });
    }
    const entries = await loadRecoveryLog();
    expect(entries.length).toBeLessThanOrEqual(10);
    expect(entries[entries.length - 1]?.detail).toBe('entry-11');
  });
});
