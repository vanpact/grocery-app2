import { type EventLogger } from '../events/eventLogger';
import { type ReplayQueue } from './replayQueue';
import { type Mutation } from '../types';

export type ReplayStats = {
  appliedCount: number;
  dataLossCount: number;
  duplicateReplayCount: number;
  requeuedCount: number;
  stoppedOnFailure: boolean;
};

export async function replayQueuedMutations(
  queue: ReplayQueue,
  applyMutation: (mutation: Mutation) => Promise<void>,
  logger?: EventLogger,
): Promise<ReplayStats> {
  const mutations = queue.drain();
  const seen = new Set<string>();

  let appliedCount = 0;
  let dataLossCount = 0;
  let duplicateReplayCount = 0;
  let requeuedCount = 0;
  let stoppedOnFailure = false;

  for (let index = 0; index < mutations.length; index += 1) {
    const mutation = mutations[index];

    if (seen.has(mutation.mutationId)) {
      duplicateReplayCount += 1;
      continue;
    }

    seen.add(mutation.mutationId);

    try {
      await applyMutation(mutation);
      appliedCount += 1;
    } catch {
      dataLossCount += 1;
      logger?.log({
        householdId: mutation.householdId,
        type: 'error_retry',
        ref: { mutationId: mutation.mutationId },
        payload: { mutationType: mutation.type },
        at: new Date().toISOString(),
      });

      const failedMutationId = mutation.mutationId;
      const requeuedMutationIds = new Set<string>();

      for (let tailIndex = index; tailIndex < mutations.length; tailIndex += 1) {
        const candidate = mutations[tailIndex];

        if (requeuedMutationIds.has(candidate.mutationId)) {
          continue;
        }

        if (candidate.mutationId !== failedMutationId && seen.has(candidate.mutationId)) {
          continue;
        }

        queue.enqueue(candidate);
        requeuedMutationIds.add(candidate.mutationId);
        requeuedCount += 1;
      }

      stoppedOnFailure = true;
      break;
    }
  }

  return {
    appliedCount,
    dataLossCount,
    duplicateReplayCount,
    requeuedCount,
    stoppedOnFailure,
  };
}
