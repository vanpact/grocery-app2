import { getActiveShoppingItems } from '../../shopping/activeShoppingService';
import {
  type RecoveryAction,
  type UiMistapControlEvent,
  type UiPrimaryActionRecognitionRun,
  type UiUsabilityTaskRun,
} from '../../runtime/contracts';
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

export type ActiveShoppingActionGroup = {
  groupId: 'core-flow' | 'recovery';
  primaryAction: string;
  secondaryActions: string[];
  destructiveActions: string[];
  copyUniquenessStatus: 'pass' | 'fail';
  controlFeedbackStates: Array<'idle' | 'focused' | 'pressed' | 'disabled'>;
};

export type ListPresentationState = 'empty' | 'long-list' | 'partially-synced' | 'ready';

export type ListRowPresentation = {
  itemId: string;
  label: string;
  quantityLabel: string;
  quantityBadge: string;
  touchTargetMinPx: number;
};

export type ActiveShoppingScreenModel = {
  isOffline: boolean;
  isReconnecting: boolean;
  heading: string;
  body: string;
  actionGroups: ActiveShoppingActionGroup[];
  validatedItems: Item[];
  listRows: ListRowPresentation[];
  listPresentationState: ListPresentationState;
  listStateMessage: string;
  offlineIndicator: string | null;
  reconnectingIndicator: string | null;
  lastReplayRefreshAtUtc: string | null;
  membershipRecovery: MembershipRecoveryState | null;
  recoveryStates: ActiveShoppingRecoveryState[];
  primaryPaneStateChangingControls: string[];
  secondaryPaneContextSections: string[];
  stateChangingControlsOutsidePrimaryPane: boolean;
  instrumentation: {
    recognitionThresholdSeconds: number;
    mistapRateTargetPct: number;
    sc002ImprovementTargetPct: number;
  };
  taskRunCapture: CoreFlowTimingCapture | null;
};

function normalizeCopy(value: string): string {
  return value.trim().toLowerCase();
}

function evaluateCopyUniqueness(values: string[]): 'pass' | 'fail' {
  const normalized = values.map(normalizeCopy);
  return new Set(normalized).size === normalized.length ? 'pass' : 'fail';
}

function toQuantityLabel(item: Item): string {
  if (item.qty === null || item.qty === undefined || item.qty <= 0) {
    return 'Qty not set';
  }

  return item.unit ? `${item.qty} ${item.unit}` : `${item.qty}`;
}

function toListRowPresentation(item: Item): ListRowPresentation {
  const quantityLabel = toQuantityLabel(item);
  return {
    itemId: item.itemId,
    label: item.name,
    quantityLabel,
    quantityBadge: `[${quantityLabel}]`,
    touchTargetMinPx: 44,
  };
}

function resolveListPresentationState(items: Item[]): ListPresentationState {
  if (items.length === 0) {
    return 'empty';
  }

  if (items.length >= 15) {
    return 'long-list';
  }

  const hasDraft = items.some((item) => item.status === 'draft' || item.status === 'suggested');
  const hasValidated = items.some((item) => item.status === 'validated' || item.status === 'bought');
  if (hasDraft && hasValidated) {
    return 'partially-synced';
  }

  return 'ready';
}

function resolveListStateMessage(state: ListPresentationState): string {
  if (state === 'empty') {
    return 'No items yet. Add the first item to start shopping.';
  }

  if (state === 'long-list') {
    return 'Long list mode: scan item names on the left and quantity badges on the right.';
  }

  if (state === 'partially-synced') {
    return 'Partially synced: validated and draft items are grouped to prevent missed actions.';
  }

  return 'List is up to date and ready for validation.';
}

export function beginCoreAddValidateTiming(runId: string, at: Date = new Date()): CoreFlowTimingCapture {
  return {
    runId,
    flow: 'core-add-validate',
    startedAtUtc: at.toISOString(),
    startedAtMs: at.getTime(),
  };
}

export function recordPrimaryActionRecognition(input: {
  participantId: string;
  platform: 'web' | 'android';
  screenId: 'sign-in' | 'active-shopping' | 'overview' | 'settings';
  startedAtMs: number;
  selectedAtMs: number;
  recognizedOnFirstAttempt: boolean;
}): UiPrimaryActionRecognitionRun {
  const secondsToPrimaryAction = Math.max(0, (input.selectedAtMs - input.startedAtMs) / 1000);

  return {
    participantId: input.participantId,
    platform: input.platform,
    screenId: input.screenId,
    secondsToPrimaryAction: Number(secondsToPrimaryAction.toFixed(4)),
    recognizedOnFirstAttempt: input.recognizedOnFirstAttempt,
  };
}

export function recordMistapEvent(input: {
  controlId: string;
  platform: 'web' | 'android';
  attempts: number;
  mistaps: number;
}): UiMistapControlEvent {
  return {
    controlId: input.controlId,
    platform: input.platform,
    attempts: Math.max(0, Math.floor(input.attempts)),
    mistaps: Math.max(0, Math.floor(input.mistaps)),
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
  const actionGroups: ActiveShoppingActionGroup[] = [
    {
      groupId: 'core-flow',
      primaryAction: 'Add item to list',
      secondaryActions: ['Validate next item'],
      destructiveActions: [],
      copyUniquenessStatus: 'pass',
      controlFeedbackStates: ['idle', 'focused', 'pressed', 'disabled'],
    },
    {
      groupId: 'recovery',
      primaryAction: 'Retry sync connection',
      secondaryActions: ['Continue in offline mode'],
      destructiveActions: ['Sign out of household'],
      copyUniquenessStatus: 'pass',
      controlFeedbackStates: ['idle', 'focused', 'pressed', 'disabled'],
    },
  ];

  if (membershipRequired) {
    recoveryStates.push(getMembershipRecoveryStateForScreen());
  } else if (isOffline) {
    recoveryStates.push(getOfflineRecoveryState());
  }

  if (!membershipRequired && isReconnecting) {
    recoveryStates.push(getReconnectingRecoveryState());
  }

  const listPresentationState = resolveListPresentationState(items);
  const listStateMessage = resolveListStateMessage(listPresentationState);
  const listRows = membershipRequired ? [] : items.map(toListRowPresentation);
  const allActionCopy = actionGroups.flatMap((group) => [
    group.primaryAction,
    ...group.secondaryActions,
    ...group.destructiveActions,
  ]);
  const copyUniquenessStatus = evaluateCopyUniqueness(allActionCopy);
  const normalizedActionGroups = actionGroups.map((group) => ({
    ...group,
    copyUniquenessStatus,
  }));

  return {
    isOffline,
    isReconnecting,
    heading: 'Active shopping workspace',
    body: 'Complete the flow in order: add item, then validate item.',
    actionGroups: normalizedActionGroups,
    validatedItems: membershipRequired ? [] : getActiveShoppingItems(items),
    listRows,
    listPresentationState,
    listStateMessage,
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
    primaryPaneStateChangingControls: ['Add item to list', 'Validate next item', 'Retry sync connection'],
    secondaryPaneContextSections: ['status-summary', 'selected-item-context', 'recent-history'],
    stateChangingControlsOutsidePrimaryPane: false,
    instrumentation: {
      recognitionThresholdSeconds: 5,
      mistapRateTargetPct: 5,
      sc002ImprovementTargetPct: 25,
    },
    taskRunCapture: options?.taskRunCapture ?? null,
  };
}
