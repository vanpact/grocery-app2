import { describe, expect, it } from 'vitest';
import { runDbSetup } from '../../scripts/db-setup';

describe('US1 db setup idempotency', () => {
  it('keeps baseline fixture keys unique across repeated upsert runs', async () => {
    const first = await runDbSetup();
    const second = await runDbSetup({ state: first.state });

    const fixtureKeys = second.state.fixturesByTarget.default ?? [];
    const uniqueKeyCount = new Set(fixtureKeys).size;

    expect(first.result.status).toBe('success');
    expect(second.result.status).toBe('success');
    expect(uniqueKeyCount).toBe(fixtureKeys.length);
    expect(second.result.fixtureDeletes).toBe(0);
  });
});
