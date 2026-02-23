import { type Mutation } from '../types';
import { type ReplayQueue } from './replayQueue';

export type PersistedMutation = Mutation & {
  queuedAtUtc: string;
};

export type ReplayPersistenceAdapter = {
  load: () => Promise<PersistedMutation[]>;
  save: (mutations: PersistedMutation[]) => Promise<void>;
  clear: () => Promise<void>;
};

export function createMemoryReplayPersistence(
  initialMutations: PersistedMutation[] = [],
): ReplayPersistenceAdapter {
  let mutations = [...initialMutations];

  return {
    async load() {
      return [...mutations];
    },
    async save(next) {
      mutations = [...next];
    },
    async clear() {
      mutations = [];
    },
  };
}

export function snapshotReplayQueue(
  queue: ReplayQueue,
  now: () => string = () => new Date().toISOString(),
): PersistedMutation[] {
  return queue.getPending().map((mutation) => ({
    ...mutation,
    queuedAtUtc: now(),
  }));
}

export function restoreReplayQueue(queue: ReplayQueue, persisted: PersistedMutation[]): void {
  for (const mutation of persisted) {
    queue.enqueue({
      mutationId: mutation.mutationId,
      householdId: mutation.householdId,
      type: mutation.type,
      payload: mutation.payload,
    });
  }
}
