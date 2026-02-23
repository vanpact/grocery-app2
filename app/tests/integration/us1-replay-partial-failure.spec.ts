import { describe, expect, it } from 'vitest';

import { replayQueuedMutations } from '../../src/sync/replayOrchestrator';
import { createReplayQueue } from '../../src/sync/replayQueue';

describe('VR-COM-015 replay partial-failure recovery', () => {
  it('keeps failed and later mutations queued in original order', async () => {
    const queue = createReplayQueue();
    const applied: string[] = [];

    queue.enqueue({ mutationId: 'm1', householdId: 'hh-1', type: 'add', payload: {} });
    queue.enqueue({ mutationId: 'm2', householdId: 'hh-1', type: 'validate', payload: {} });
    queue.enqueue({ mutationId: 'm3', householdId: 'hh-1', type: 'toggle', payload: {} });

    const firstRun = await replayQueuedMutations(queue, async (mutation) => {
      if (mutation.mutationId === 'm2') {
        throw new Error('transient failure');
      }

      applied.push(mutation.mutationId);
    });

    expect(firstRun.dataLossCount).toBe(1);
    expect(applied).toEqual(['m1']);
    expect(queue.getPending().map((mutation) => mutation.mutationId)).toEqual(['m2', 'm3']);

    const secondRun = await replayQueuedMutations(queue, async (mutation) => {
      applied.push(mutation.mutationId);
    });

    expect(secondRun.dataLossCount).toBe(0);
    expect(applied).toEqual(['m1', 'm2', 'm3']);
    expect(queue.getPending()).toEqual([]);
  });
});
