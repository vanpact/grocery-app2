import { describe, expect, it } from 'vitest';
import { createReplayQueue } from '../../src/sync/replayQueue';
import { replayQueuedMutations } from '../../src/sync/replayOrchestrator';

describe('quick-wins offline replay idempotency', () => {
  it('applies one operation per idempotency token when replay contains duplicates', async () => {
    const queue = createReplayQueue();
    const applied: string[] = [];

    queue.enqueue({
      mutationId: 'm1',
      householdId: 'hh-1',
      type: 'add',
      payload: { operationId: 'op-quick-wins-1' },
    });
    queue.enqueue({
      mutationId: 'm2',
      householdId: 'hh-1',
      type: 'add',
      payload: { operationId: 'op-quick-wins-1' },
    });
    queue.enqueue({
      mutationId: 'm3',
      householdId: 'hh-1',
      type: 'merge',
      payload: { operationId: 'op-quick-wins-2' },
    });

    const stats = await replayQueuedMutations(queue, async (mutation) => {
      applied.push(String(mutation.payload.operationId));
    });

    expect(applied).toEqual(['op-quick-wins-1', 'op-quick-wins-2']);
    expect(stats.duplicateReplayCount).toBe(1);
    expect(queue.getPending()).toEqual([]);
  });

  it('requeues a failed tokenized mutation and keeps one replay candidate per operation token', async () => {
    const queue = createReplayQueue();
    const replayedOperationIds: string[] = [];

    queue.enqueue({
      mutationId: 'm1',
      householdId: 'hh-1',
      type: 'add',
      payload: { operationId: 'op-quick-wins-1' },
    });
    queue.enqueue({
      mutationId: 'm2',
      householdId: 'hh-1',
      type: 'add',
      payload: { operationId: 'op-quick-wins-1' },
    });
    queue.enqueue({
      mutationId: 'm3',
      householdId: 'hh-1',
      type: 'merge',
      payload: { operationId: 'op-quick-wins-2' },
    });

    const firstRun = await replayQueuedMutations(queue, async (mutation) => {
      if (mutation.mutationId === 'm1') {
        throw new Error('transient failure');
      }
      replayedOperationIds.push(String(mutation.payload.operationId));
    });

    expect(firstRun.dataLossCount).toBe(1);
    expect(firstRun.requeuedCount).toBe(2);
    expect(queue.getPending().map((mutation) => mutation.mutationId)).toEqual(['m1', 'm3']);

    const secondRun = await replayQueuedMutations(queue, async (mutation) => {
      replayedOperationIds.push(String(mutation.payload.operationId));
    });

    expect(secondRun.dataLossCount).toBe(0);
    expect(replayedOperationIds).toEqual(['op-quick-wins-1', 'op-quick-wins-2']);
    expect(queue.getPending()).toEqual([]);
  });
});
