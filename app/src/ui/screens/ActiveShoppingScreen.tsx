import { getActiveShoppingItems } from '../../shopping/activeShoppingService';
import { type Item } from '../../types';

export type MembershipRecoveryState = {
  code: 'membership_required';
  message: string;
  actions: Array<'retry' | 'sign_out'>;
};

export type ActiveShoppingScreenModel = {
  isOffline: boolean;
  isReconnecting: boolean;
  validatedItems: Item[];
  offlineIndicator: string | null;
  reconnectingIndicator: string | null;
  lastReplayRefreshAtUtc: string | null;
  membershipRecovery: MembershipRecoveryState | null;
};

export function getMembershipRecoveryState(): MembershipRecoveryState {
  return {
    code: 'membership_required',
    message: 'No household membership found for this account.',
    actions: ['retry', 'sign_out'],
  };
}

export function buildActiveShoppingScreenModel(
  items: Item[],
  isOffline: boolean,
  options?: {
    membershipRequired?: boolean;
    isReconnecting?: boolean;
    replayCompletedAtUtc?: string;
  },
): ActiveShoppingScreenModel {
  const membershipRequired = options?.membershipRequired === true;
  const isReconnecting = options?.isReconnecting === true;

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
  };
}
