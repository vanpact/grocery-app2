import { type Mutation } from '../types';

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
  restoreOfflineQueue: (mutations: Mutation[]) => void;
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
    restoreOfflineQueue(mutations) {
      for (const mutation of mutations) {
        offlineQueue.push(mutation);
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
