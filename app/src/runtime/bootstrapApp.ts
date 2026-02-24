import { bootstrapSession, isMembershipRequiredError, type Session } from '../auth/sessionBootstrap';
import { type PersistedMutation, type ReplayPersistenceAdapter } from '../sync/replayPersistence';
import { type Mutation } from '../types';
import { type StartupGateResult } from './startupGate';

export type QueueReadiness = {
  pendingCount: number;
  oldestQueuedAtUtc: string | null;
  staleThresholdHours: number;
  staleQueueDetected: boolean;
  writeBlocked: boolean;
};

export type BootstrapStatus = 'ready' | 'blocked';

export type BootstrapAppResult = {
  status: BootstrapStatus;
  reason:
    | 'startup_gate_failed'
    | 'stale_replay_queue'
    | 'membership_required'
    | 'membership_resolution_failed'
    | 'runtime_ready';
  startupGate: StartupGateResult;
  queueReadiness: QueueReadiness;
  session: Session | null;
  recoveryActions: Array<'retry' | 'retry_membership' | 'sign_out'>;
};

export type BootstrapAppInput = {
  userId: string;
  resolveMembership: (userId: string) => Promise<{ householdId: string; role: Session['role'] } | null>;
  startupGate: () => Promise<StartupGateResult>;
  replayPersistence?: ReplayPersistenceAdapter;
  restoreReplayQueue?: (mutations: Mutation[]) => void;
  staleThresholdHours?: number;
  now?: () => Date;
};

const DEFAULT_STALE_THRESHOLD_HOURS = 24;

function createQueueReadiness(
  persistedQueue: PersistedMutation[],
  staleThresholdHours: number,
  now: Date,
): QueueReadiness {
  const pendingCount = persistedQueue.length;
  const oldestQueuedAtUtc =
    pendingCount === 0
      ? null
      : [...persistedQueue]
          .map((mutation) => mutation.queuedAtUtc)
          .sort((left, right) => left.localeCompare(right))[0];

  const staleThresholdMs = staleThresholdHours * 60 * 60 * 1000;
  const oldestMs = oldestQueuedAtUtc ? Date.parse(oldestQueuedAtUtc) : Number.NaN;
  const staleQueueDetected =
    oldestQueuedAtUtc !== null &&
    Number.isFinite(oldestMs) &&
    now.getTime() - oldestMs > staleThresholdMs;

  return {
    pendingCount,
    oldestQueuedAtUtc,
    staleThresholdHours,
    staleQueueDetected,
    writeBlocked: staleQueueDetected,
  };
}

export async function bootstrapApp(input: BootstrapAppInput): Promise<BootstrapAppResult> {
  const startupGate = await input.startupGate();
  const now = input.now ?? (() => new Date());
  const staleThresholdHours = input.staleThresholdHours ?? DEFAULT_STALE_THRESHOLD_HOURS;

  if (startupGate.status !== 'pass') {
    return {
      status: 'blocked',
      reason: 'startup_gate_failed',
      startupGate,
      queueReadiness: {
        pendingCount: 0,
        oldestQueuedAtUtc: null,
        staleThresholdHours,
        staleQueueDetected: false,
        writeBlocked: true,
      },
      session: null,
      recoveryActions: ['retry'],
    };
  }

  const persistedQueue = input.replayPersistence ? await input.replayPersistence.load() : [];
  if (persistedQueue.length > 0 && input.restoreReplayQueue) {
    const baseMutations = persistedQueue.map((mutation) => ({
      mutationId: mutation.mutationId,
      householdId: mutation.householdId,
      type: mutation.type,
      payload: mutation.payload,
    }));
    input.restoreReplayQueue(baseMutations);
  }

  const queueReadiness = createQueueReadiness(persistedQueue, staleThresholdHours, now());

  try {
    const session = await bootstrapSession({
      userId: input.userId,
      resolveMembership: input.resolveMembership,
    });

    return {
      status: queueReadiness.writeBlocked ? 'blocked' : 'ready',
      reason: queueReadiness.writeBlocked ? 'stale_replay_queue' : 'runtime_ready',
      startupGate,
      queueReadiness,
      session,
      recoveryActions: queueReadiness.writeBlocked ? ['retry'] : [],
    };
  } catch (error) {
    if (isMembershipRequiredError(error)) {
      return {
        status: 'blocked',
        reason: 'membership_required',
        startupGate,
        queueReadiness,
        session: null,
        recoveryActions: [...error.recoveryActions],
      };
    }

    return {
      status: 'blocked',
      reason: 'membership_resolution_failed',
      startupGate,
      queueReadiness,
      session: null,
      recoveryActions: ['retry'],
    };
  }
}
