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
  const appliedIdempotencyTokens = new Set<string>();

  let appliedCount = 0;
  let dataLossCount = 0;
  let duplicateReplayCount = 0;
  let requeuedCount = 0;
  let stoppedOnFailure = false;

  for (let index = 0; index < mutations.length; index += 1) {
    const mutation = mutations[index];
    const idempotencyToken = extractIdempotencyToken(mutation);

    if (idempotencyToken && appliedIdempotencyTokens.has(idempotencyToken)) {
      duplicateReplayCount += 1;
      continue;
    }

    if (seen.has(mutation.mutationId)) {
      duplicateReplayCount += 1;
      continue;
    }

    seen.add(mutation.mutationId);

    try {
      await applyMutation(mutation);
      appliedCount += 1;
      if (idempotencyToken) {
        appliedIdempotencyTokens.add(idempotencyToken);
      }
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
      const requeuedIdempotencyTokens = new Set<string>();

      for (let tailIndex = index; tailIndex < mutations.length; tailIndex += 1) {
        const candidate = mutations[tailIndex];
        const candidateIdempotencyToken = extractIdempotencyToken(candidate);

        if (requeuedMutationIds.has(candidate.mutationId)) {
          continue;
        }

        if (candidateIdempotencyToken && appliedIdempotencyTokens.has(candidateIdempotencyToken)) {
          continue;
        }

        if (candidateIdempotencyToken && requeuedIdempotencyTokens.has(candidateIdempotencyToken)) {
          continue;
        }

        if (candidate.mutationId !== failedMutationId && seen.has(candidate.mutationId)) {
          continue;
        }

        queue.enqueue(candidate);
        requeuedMutationIds.add(candidate.mutationId);
        if (candidateIdempotencyToken) {
          requeuedIdempotencyTokens.add(candidateIdempotencyToken);
        }
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

function extractIdempotencyToken(mutation: Mutation): string | null {
  const operationId = mutation.payload.operationId;
  if (typeof operationId === 'string' && operationId) {
    return operationId;
  }

  const idempotencyToken = mutation.payload.idempotencyToken;
  if (typeof idempotencyToken === 'string' && idempotencyToken) {
    return idempotencyToken;
  }

  return null;
}
