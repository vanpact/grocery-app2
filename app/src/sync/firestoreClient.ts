import { type Mutation } from '../types';
import { type PersistedMutation } from './replayPersistence';

export type OperationalMode = 'online' | 'degraded';

export type DependencyOutageState = {
  code: 'dependency_outage';
  message: string;
};

export type FirestoreClient = {
  offlineEnabled: boolean;
  enqueueOfflineMutation: (mutation: Mutation) => void;
  flushOfflineMutations: () => Mutation[];
  snapshotOfflineQueue: () => Mutation[];
  snapshotOfflineQueueForPersistence: (now?: () => string) => PersistedMutation[];
  restoreOfflineQueue: (mutations: Mutation[]) => void;
  restoreOfflineQueueFromPersistence: (mutations: PersistedMutation[]) => void;
  setDependencyAvailable: (available: boolean) => void;
  getOperationalMode: () => OperationalMode;
  getOutageState: () => DependencyOutageState | null;
};

export function createFirestoreClient(): FirestoreClient {
  const offlineQueue: Mutation[] = [];
  let mode: OperationalMode = 'online';
  let outageState: DependencyOutageState | null = null;

  return {
    offlineEnabled: true,
    enqueueOfflineMutation(mutation) {
      offlineQueue.push(mutation);
    },
    flushOfflineMutations() {
      const drained = [...offlineQueue];
      offlineQueue.length = 0;
      return drained;
    },
    snapshotOfflineQueue() {
      return [...offlineQueue];
    },
    snapshotOfflineQueueForPersistence(now = () => new Date().toISOString()) {
      return offlineQueue.map((mutation) => ({
        ...mutation,
        queuedAtUtc: now(),
      }));
    },
    restoreOfflineQueue(mutations) {
      for (const mutation of mutations) {
        offlineQueue.push(mutation);
      }
    },
    restoreOfflineQueueFromPersistence(mutations) {
      for (const mutation of mutations) {
        offlineQueue.push({
          mutationId: mutation.mutationId,
          householdId: mutation.householdId,
          type: mutation.type,
          payload: mutation.payload,
        });
      }
    },
    setDependencyAvailable(available) {
      if (available) {
        mode = 'online';
        outageState = null;
        return;
      }

      mode = 'degraded';
      outageState = {
        code: 'dependency_outage',
        message: 'Remote sync unavailable. Local queue capture is active.',
      };
    },
    getOperationalMode() {
      return mode;
    },
    getOutageState() {
      return outageState;
    },
  };
}
