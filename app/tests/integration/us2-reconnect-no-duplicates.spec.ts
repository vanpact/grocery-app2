import { describe, expect, it } from 'vitest';
import { createReplayQueue } from '../../src/sync/replayQueue';
import { replayQueuedMutations } from '../../src/sync/replayOrchestrator';

describe('US2 reconnect duplicate prevention', () => {
  it('counts and suppresses duplicate mutation net effects during replay', async () => {
    const queue = createReplayQueue();
    const applied: string[] = [];

    queue.enqueue({ mutationId: 'm1', householdId: 'hh-1', type: 'add', payload: {} });
    queue.enqueue({ mutationId: 'm1', householdId: 'hh-1', type: 'add', payload: {} });
    queue.enqueue({ mutationId: 'm2', householdId: 'hh-1', type: 'validate', payload: {} });

    const stats = await replayQueuedMutations(queue, async (mutation) => {
      applied.push(mutation.mutationId);
    });

    expect(stats.dataLossCount).toBe(0);
    expect(stats.duplicateReplayCount).toBe(1);
    expect(applied).toEqual(['m1', 'm2']);
  });
});
