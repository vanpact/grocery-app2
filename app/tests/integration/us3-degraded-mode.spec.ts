import { describe, expect, it } from 'vitest';

import { createFirestoreClient } from '../../src/sync/firestoreClient';

describe('VR-COM-022 dependency degraded mode', () => {
  it('switches to degraded mode and keeps queue-only local capture during outage', () => {
    const client = createFirestoreClient();

    client.setDependencyAvailable(false);

    expect(client.getOperationalMode()).toBe('degraded');
    expect(client.getOutageState()).toEqual({
      code: 'dependency_outage',
      message: 'Remote sync unavailable. Local queue capture is active.',
    });

    client.enqueueOfflineMutation({
      mutationId: 'm1',
      householdId: 'hh-1',
      type: 'add',
      payload: {},
    });

    expect(client.snapshotOfflineQueue().map((mutation) => mutation.mutationId)).toEqual(['m1']);
  });

  it('returns to online mode when dependency recovers', () => {
    const client = createFirestoreClient();

    client.setDependencyAvailable(false);
    client.setDependencyAvailable(true);

    expect(client.getOperationalMode()).toBe('online');
    expect(client.getOutageState()).toBeNull();
  });
});
