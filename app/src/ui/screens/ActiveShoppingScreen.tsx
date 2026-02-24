import { getActiveShoppingItems } from '../../shopping/activeShoppingService';
import { type RecoveryAction, type UiUsabilityTaskRun } from '../../runtime/contracts';
import { type Item } from '../../types';

export type MembershipRecoveryState = {
  code: 'membership_required';
  message: string;
  actions: Array<'retry_membership' | 'sign_out'>;
};

export type ActiveShoppingRecoveryState = {
  state: 'offline' | 'reconnecting' | 'membership-required';
  message: string;
  actions: RecoveryAction[];
};

export type CoreFlowTimingCapture = {
  runId: string;
  flow: 'core-add-validate';
  startedAtUtc: string;
  startedAtMs: number;
};

export type ActiveShoppingScreenModel = {
  isOffline: boolean;
  isReconnecting: boolean;
  validatedItems: Item[];
  offlineIndicator: string | null;
  reconnectingIndicator: string | null;
  lastReplayRefreshAtUtc: string | null;
  membershipRecovery: MembershipRecoveryState | null;
  recoveryStates: ActiveShoppingRecoveryState[];
  taskRunCapture: CoreFlowTimingCapture | null;
};

export function beginCoreAddValidateTiming(runId: string, at: Date = new Date()): CoreFlowTimingCapture {
  return {
    runId,
    flow: 'core-add-validate',
    startedAtUtc: at.toISOString(),
    startedAtMs: at.getTime(),
  };
}

export function completeCoreAddValidateTiming(
  capture: CoreFlowTimingCapture,
  input: {
    platform: 'android' | 'web';
    inputMode: 'touch' | 'keyboard' | 'pointer';
    completed: boolean;
    deterministic: boolean;
  },
  at: Date = new Date(),
): UiUsabilityTaskRun {
  const durationSeconds = Math.max(0, (at.getTime() - capture.startedAtMs) / 1000);

  return {
    runId: capture.runId,
    platform: input.platform,
    inputMode: input.inputMode,
    flow: capture.flow,
    durationSeconds: Number(durationSeconds.toFixed(4)),
    completed: input.completed,
    deterministic: input.deterministic,
  };
}

export function getMembershipRecoveryState(): MembershipRecoveryState {
  return {
    code: 'membership_required',
    message: 'No household membership found for this account.',
    actions: ['retry_membership', 'sign_out'],
  };
}

function getOfflineRecoveryState(): ActiveShoppingRecoveryState {
  return {
    state: 'offline',
    message: 'You are offline. Continue offline or retry connection.',
    actions: ['continue', 'retry_connection'],
  };
}

function getReconnectingRecoveryState(): ActiveShoppingRecoveryState {
  return {
    state: 'reconnecting',
    message: 'Reconnecting: replaying queued changes in deterministic order.',
    actions: ['continue', 'retry_connection'],
  };
}

function getMembershipRecoveryStateForScreen(): ActiveShoppingRecoveryState {
  const membershipRecovery = getMembershipRecoveryState();
  return {
    state: 'membership-required',
    message: membershipRecovery.message,
    actions: [...membershipRecovery.actions],
  };
}

export function buildActiveShoppingScreenModel(
  items: Item[],
  isOffline: boolean,
  options?: {
    membershipRequired?: boolean;
    isReconnecting?: boolean;
    replayCompletedAtUtc?: string;
    taskRunCapture?: CoreFlowTimingCapture | null;
  },
): ActiveShoppingScreenModel {
  const membershipRequired = options?.membershipRequired === true;
  const isReconnecting = options?.isReconnecting === true;
  const recoveryStates: ActiveShoppingRecoveryState[] = [];

  if (membershipRequired) {
    recoveryStates.push(getMembershipRecoveryStateForScreen());
  } else if (isOffline) {
    recoveryStates.push(getOfflineRecoveryState());
  }

  if (!membershipRequired && isReconnecting) {
    recoveryStates.push(getReconnectingRecoveryState());
  }

  return {
    isOffline,
    isReconnecting,
    validatedItems: membershipRequired ? [] : getActiveShoppingItems(items),
    offlineIndicator: membershipRequired
      ? null
      : isOffline
        ? 'Offline mode: queued changes will replay on reconnect.'
        : null,
    reconnectingIndicator: membershipRequired
      ? null
      : isReconnecting
        ? 'Reconnecting: replaying queued changes in deterministic order.'
        : null,
    lastReplayRefreshAtUtc: membershipRequired ? null : options?.replayCompletedAtUtc ?? null,
    membershipRecovery: membershipRequired ? getMembershipRecoveryState() : null,
    recoveryStates,
    taskRunCapture: options?.taskRunCapture ?? null,
  };
}
