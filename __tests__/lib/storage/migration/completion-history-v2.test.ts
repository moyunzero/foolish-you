import * as fs from 'node:fs';
import * as path from 'node:path';

import { COMPLETION_HISTORY_STORAGE_VERSION } from '../../../../constants/config';
import { normalizeCompletionHistory } from '../../../../lib/storage/completionHistoryStorage';

const FIXTURE_DIR = path.join(__dirname, 'fixtures');

function loadFixture(name: string): unknown {
  const raw = fs.readFileSync(path.join(FIXTURE_DIR, name), 'utf8');
  return JSON.parse(raw);
}

describe('completion history v1 → v2 normalize', () => {
  it('preserves entries and defaults outcome to completed semantics', () => {
    const normalized = normalizeCompletionHistory(loadFixture('completion-history-v1.json'));
    expect(normalized).not.toBeNull();
    expect(normalized!.entries).toHaveLength(2);
    expect(normalized!.entries[0]).toEqual({
      dateKey: '2026-05-18',
      elapsedMs: 120_000,
    });
    expect(normalized!.entries[1]).toEqual({
      dateKey: '2026-05-19',
      elapsedMs: 90_000,
      inferred: true,
    });
  });

  it('accepts v2 abandoned outcome', () => {
    const normalized = normalizeCompletionHistory({
      version: COMPLETION_HISTORY_STORAGE_VERSION,
      entries: [{ dateKey: '2026-05-20', elapsedMs: 1, outcome: 'abandoned' }],
    });
    expect(normalized?.entries[0]?.outcome).toBe('abandoned');
  });
});
