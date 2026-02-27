import { type FeedbackState, type RecoveryAction } from '../../runtime/contracts';

type RecoveryActionState = 'error' | 'offline' | 'membership-required';

export type Feedback = {
  state: FeedbackState;
  purpose: 'informational' | 'recovery';
  message: string;
  recoveryActions: RecoveryAction[];
  recoveryGroupLabel: string;
  accessibility: {
    ariaLabel: string;
    focusIndicatorRequired: boolean;
    keyboardTraversalOrder: string[];
    minimumTouchTargetPx: number;
  };
};

export const RECOVERY_ACTION_CONTRACT: Record<RecoveryActionState, RecoveryAction[]> = {
  error: ['retry'],
  offline: ['continue', 'retry_connection'],
  'membership-required': ['retry_membership', 'sign_out'],
};

const MESSAGES: Record<FeedbackState, string> = {
  empty: 'No items yet. Add your first grocery item to begin.',
  loading: 'Loading shopping data and session context.',
  error: 'Action failed. Retry to continue this step.',
  offline: 'Offline mode active. Continue offline or retry sync connection.',
  'membership-required': 'Membership lookup failed. Retry membership lookup or sign out of household.',
  reconnecting: 'Reconnecting sync. Queued changes are replaying in deterministic order.',
};

function toReadableState(state: FeedbackState): string {
  return state
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getRecoveryActions(state: FeedbackState): RecoveryAction[] {
  if (state === 'error' || state === 'offline' || state === 'membership-required') {
    return [...RECOVERY_ACTION_CONTRACT[state]];
  }

  return [];
}

export function getStateFeedback(state: FeedbackState): Feedback {
  const recoveryActions = getRecoveryActions(state);
  return {
    state,
    purpose: recoveryActions.length > 0 ? 'recovery' : 'informational',
    message: MESSAGES[state],
    recoveryActions,
    recoveryGroupLabel: recoveryActions.length > 0 ? 'Recovery actions' : 'No recovery actions',
    accessibility: {
      ariaLabel: `${toReadableState(state)} state message`,
      focusIndicatorRequired: true,
      keyboardTraversalOrder: ['status-message', 'primary-action', 'secondary-actions'],
      minimumTouchTargetPx: 44,
    },
  };
}
