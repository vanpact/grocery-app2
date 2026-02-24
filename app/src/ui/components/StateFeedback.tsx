import { type FeedbackState, type RecoveryAction } from '../../runtime/contracts';

type RecoveryActionState = 'error' | 'offline' | 'membership-required';

export type Feedback = {
  state: FeedbackState;
  message: string;
  recoveryActions: RecoveryAction[];
  accessibility: {
    ariaLabel: string;
    focusIndicatorRequired: boolean;
  };
};

export const RECOVERY_ACTION_CONTRACT: Record<RecoveryActionState, RecoveryAction[]> = {
  error: ['retry'],
  offline: ['continue', 'retry_connection'],
  'membership-required': ['retry_membership', 'sign_out'],
};

const MESSAGES: Record<FeedbackState, string> = {
  empty: 'No items yet. Add your first grocery item to begin.',
  loading: 'Loading shopping data...',
  error: 'Something went wrong. Retry to continue.',
  offline: 'You are offline. Continue offline or retry connection.',
  'membership-required': 'No household membership found. Retry membership lookup or sign out.',
  reconnecting: 'Reconnecting... queued changes are replaying in order.',
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
  return {
    state,
    message: MESSAGES[state],
    recoveryActions: getRecoveryActions(state),
    accessibility: {
      ariaLabel: `${toReadableState(state)} state message`,
      focusIndicatorRequired: true,
    },
  };
}
