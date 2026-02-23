import { describe, expect, it } from 'vitest';
import { createReplayQueue } from '../../src/sync/replayQueue';
import { replayQueuedMutations } from '../../src/sync/replayOrchestrator';

describe('US2 reconnect replay ordering', () => {
  it('replays queued mutations in deterministic queued order', async () => {
    const queue = createReplayQueue();
    const applied: string[] = [];

    queue.enqueue({ mutationId: 'm1', householdId: 'hh-1', type: 'add', payload: { name: 'A' } });
    queue.enqueue({ mutationId: 'm2', householdId: 'hh-1', type: 'add', payload: { name: 'B' } });
    queue.enqueue({ mutationId: 'm3', householdId: 'hh-1', type: 'validate', payload: { itemId: 'item-2' } });

    const stats = await replayQueuedMutations(queue, async (mutation) => {
      applied.push(mutation.mutationId);
    });

    expect(stats.dataLossCount).toBe(0);
    expect(stats.duplicateReplayCount).toBe(0);
    expect(applied).toEqual(['m1', 'm2', 'm3']);
  });
});
