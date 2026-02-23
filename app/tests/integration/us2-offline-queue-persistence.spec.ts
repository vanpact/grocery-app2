import { describe, expect, it } from 'vitest';
import { createFirestoreClient } from '../../src/sync/firestoreClient';
import { createMemoryReplayPersistence } from '../../src/sync/replayPersistence';

describe('US2 offline queue persistence across restart', () => {
  it('restores pending queue mutations from persisted snapshot', async () => {
    const firstClient = createFirestoreClient();
    firstClient.enqueueOfflineMutation({
      mutationId: 'm1',
      householdId: 'hh-1',
      type: 'add',
      payload: { name: 'Milk' },
    });
    firstClient.enqueueOfflineMutation({
      mutationId: 'm2',
      householdId: 'hh-1',
      type: 'validate',
      payload: { itemId: 'item-1' },
    });

    const persistence = createMemoryReplayPersistence();
    await persistence.save(firstClient.snapshotOfflineQueueForPersistence(() => '2026-02-23T00:00:00.000Z'));

    const secondClient = createFirestoreClient();
    secondClient.restoreOfflineQueueFromPersistence(await persistence.load());

    expect(secondClient.snapshotOfflineQueue().map((mutation) => mutation.mutationId)).toEqual(['m1', 'm2']);
  });
});
