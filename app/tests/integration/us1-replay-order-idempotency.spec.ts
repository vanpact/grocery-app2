import { describe, expect, it } from 'vitest';

import { replayQueuedMutations } from '../../src/sync/replayOrchestrator';
import { createReplayQueue } from '../../src/sync/replayQueue';

describe('VR-COM-014 replay order and idempotency', () => {
  it('applies FIFO order and ignores duplicate mutation IDs', async () => {
    const queue = createReplayQueue();
    const applied: string[] = [];

    queue.enqueue({ mutationId: 'm1', householdId: 'hh-1', type: 'add', payload: {} });
    queue.enqueue({ mutationId: 'm2', householdId: 'hh-1', type: 'toggle', payload: {} });
    queue.enqueue({ mutationId: 'm2', householdId: 'hh-1', type: 'toggle', payload: {} });
    queue.enqueue({ mutationId: 'm3', householdId: 'hh-1', type: 'validate', payload: {} });

    const stats = await replayQueuedMutations(queue, async (mutation) => {
      applied.push(mutation.mutationId);
    });

    expect(applied).toEqual(['m1', 'm2', 'm3']);
    expect(stats.duplicateReplayCount).toBe(1);
    expect(stats.dataLossCount).toBe(0);
    expect(queue.getPending()).toEqual([]);
  });
});
